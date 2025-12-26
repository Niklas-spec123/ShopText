// app/api/generate/redo/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { OpenAI } from "openai";
import { getUserProfile } from "@/lib/getProfile";
import { getPlanLimits } from "@/lib/planLimits";

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

    // 🔒 PROFILE + LIMITS
    const profile = await getUserProfile();
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

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

    const body = await req.json();
    const { type, productName, features, tone, audience, language } = body;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompts: Record<string, string> = {
      short: `Skriv en kort produkttext:\n${productName}\n${features}`,
      long: `Skriv en lång produkttext:\n${productName}\n${features}`,
      bullets: `Generera bullets för:\n${productName}\n${features}`,
      seo: `Generera SEO JSON för:\n${productName}\n${features}`,
      instagram: `Skriv Instagram-caption:\n${productName}`,
      ads: `Skriv annonstexter:\n${productName}`,
    };

    const prompt = prompts[type];
    if (!prompt) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const ai = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const raw = ai.choices[0].message?.content ?? "";

    // 🔐 SAVE HISTORY (redo räknas)
    await supabase.from("history").insert({
      user_id: userId,
      title: `Redo: ${productName}`,
      content: raw,
      json: { type, result: raw },
    });

    return NextResponse.json({ result: raw });
  } catch (err: any) {
    console.error("REDO ERROR:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
