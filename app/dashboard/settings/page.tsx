import { createSupabaseServerClient } from "@/lib/supabase-server";
import { saveSettingsAction } from "./actions";
import { ManageSubscriptionButton } from "./subscription-button";

export default async function SettingsPage() {
  const supabase = createSupabaseServerClient();

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session) return <p>Not signed in.</p>;

  // Fetch user settings
  const { data: settings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", session.user.id)
    .single();

  // 🔹 Fetch billing info
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, current_period_end")
    .eq("id", session.user.id)
    .single();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-50">Settings</h1>
        <p className="text-slate-400 text-sm">
          Manage your preferences and subscription.
        </p>
      </div>

      {/* BILLING */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
        <h2 className="text-lg font-medium text-slate-100">Subscription</h2>

        <div className="text-sm text-slate-400 space-y-1">
          <p>
            Current plan:{" "}
            <span className="capitalize font-medium text-indigo-400">
              {profile?.plan ?? "free"}
            </span>
          </p>

          {profile?.current_period_end && (
            <p>
              Renews on{" "}
              {new Date(profile.current_period_end).toLocaleDateString()}
            </p>
          )}
        </div>

        <p className="text-sm text-slate-400">
          Manage your plan, payment method and invoices.
        </p>

        <ManageSubscriptionButton />
      </div>

      {/* SETTINGS FORM */}
      <form
        action={saveSettingsAction}
        className="space-y-6 bg-slate-900 border border-slate-800 p-6 rounded-xl"
      >
        {/* DISPLAY NAME */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">
            Display name
          </label>
          <input
            type="text"
            name="display_name"
            defaultValue={settings?.display_name ?? ""}
            className="w-full px-3 py-2 rounded-lg bg-slate-800 text-slate-100 border border-slate-700"
          />
        </div>

        {/* DEFAULT LANGUAGE */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">
            Default language
          </label>
          <select
            name="default_language"
            defaultValue={settings?.default_language ?? "en"}
            className="w-full px-3 py-2 rounded-lg bg-slate-800 text-slate-100 border border-slate-700"
          >
            <option value="en">English</option>
            <option value="sv">Swedish</option>
          </select>
        </div>

        {/* DEFAULT TONE */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">
            Default tone
          </label>
          <select
            name="default_tone"
            defaultValue={settings?.default_tone ?? "Persuasive"}
            className="w-full px-3 py-2 rounded-lg bg-slate-800 text-slate-100 border border-slate-700"
          >
            <option value="Persuasive">Persuasive</option>
            <option value="Informative">Informative</option>
            <option value="Luxury">Luxury</option>
            <option value="Technical">Technical</option>
          </select>
        </div>

        {/* DEFAULT AUDIENCE */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">
            Default audience
          </label>
          <input
            type="text"
            name="default_audience"
            defaultValue={settings?.default_audience ?? ""}
            placeholder="e.g. Adults, Professionals, B2B"
            className="w-full px-3 py-2 rounded-lg bg-slate-800 text-slate-100 border border-slate-700"
          />
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg transition"
        >
          Save settings
        </button>
      </form>
    </div>
  );
}
