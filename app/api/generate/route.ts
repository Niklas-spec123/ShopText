// app/api/generate/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { OpenAI } from "openai";
import { getUserProfile } from "@/lib/getProfile";
import { getPlanLimits } from "@/lib/planLimits";

interface AiResult {
  short: string;
  long: string;
  bullets: string[];
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
  instagram: string;
  ads: string[];
}

export async function POST(req: Request) {
  try {
    const supabase = createSupabaseServerClient();

    // 🔐 AUTH
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 👤 PROFILE
    const profile = await getUserProfile();
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    // 📊 PLAN LIMITS
    const limits = getPlanLimits(profile.effectivePlan);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // 🔢 SERVER-SIDE USAGE
    const { count: generationCount } = await supabase
      .from("history")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", startOfMonth.toISOString());

    if (
      limits.generationsPerMonth !== Infinity &&
      (generationCount ?? 0) >= limits.generationsPerMonth
    ) {
      return NextResponse.json(
        { code: "GENERATION_LIMIT_REACHED" },
        { status: 403 }
      );
    }

    // 🔽 INPUT
    const body = await req.json();
    const { productName, details, tone, projectId } = body;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // =========================
    // 🧠 PROMPT (NEW, FINAL)
    // =========================
    const prompt = `
You are an ecommerce copywriter.

IMPORTANT RULES:
- Do NOT invent features, colors, materials or use cases.
- Use ONLY the information explicitly provided.
- If a detail is missing, do NOT guess.
- The product name must be used EXACTLY as provided.
- Never change, shorten or reinterpret the product name.

Your task is to rewrite the provided information in clear, helpful ecommerce copy.
Focus on accuracy over creativity.

Product information:
Product name (exact): "${productName}"
Product details: "${details || "No additional details provided"}"
Tone: "${tone}"

Return ONLY valid JSON in the following format.
No markdown. No explanations.

{
  "short": "",
  "long": "",
  "bullets": ["", "", "", "", ""],
  "seoTitle": "",
  "metaDescription": "",
  "keywords": ["", "", "", "", ""],
  "instagram": "",
  "ads": ["", "", ""]
}


`.trim();

    const ai = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const raw = ai.choices[0].message?.content ?? "";

    let parsed: AiResult;

    try {
      const json = JSON.parse(raw);
      parsed = {
        short: json.short ?? "",
        long: json.long ?? "",
        bullets: Array.isArray(json.bullets) ? json.bullets.map(String) : [],
        seoTitle: json.seoTitle ?? "",
        metaDescription: json.metaDescription ?? "",
        keywords: Array.isArray(json.keywords) ? json.keywords.map(String) : [],
        instagram: json.instagram ?? "",
        ads: Array.isArray(json.ads) ? json.ads.map(String) : [],
      };
    } catch {
      // fallback safety
      parsed = {
        short: raw,
        long: raw,
        bullets: [],
        seoTitle: "",
        metaDescription: "",
        keywords: [],
        instagram: "",
        ads: [],
      };
    }

    // --- BUILD HISTORY CONTENT ---
    const allText = [
      parsed.short,
      parsed.long,
      parsed.bullets.join("\n"),
      parsed.seoTitle,
      parsed.metaDescription,
      parsed.keywords.join(", "),
      parsed.instagram,
      parsed.ads.join("\n\n"),
    ]
      .filter(Boolean)
      .join("\n\n");

    // --- SAVE HISTORY ---
    const { data: history, error } = await supabase
      .from("history")
      .insert({
        user_id: userId,
        title: productName,
        content: allText,
        json: parsed,
        project_id: projectId ?? null,
      })
      .select("id")
      .single();

    if (error || !history) {
      return NextResponse.json(
        { error: "Could not save history" },
        { status: 500 }
      );
    }

    // --- PROJECT ITEMS ---
    if (projectId) {
      await supabase.from("project_items").insert({
        project_id: projectId,
        history_id: history.id,
      });
    }

    if (profile.onboarding_completed === false) {
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", userId);
    }

    return NextResponse.json({
      result: parsed,
      historyId: history.id,
    });
  } catch (err) {
    console.error("GENERATE ERROR:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
