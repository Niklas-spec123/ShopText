export type History = {
  id: string; // 👈 Supabase PK
  user_id?: string; // (valfritt)
  title: string;
  content: string;
  created_at: string;
  project_id?: string | null;
};
