// Shared domain types (mirror the Supabase tables).

export type Role = "admin" | "user";
export type UserStatus = "active" | "invited" | "disabled";

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
  credit_limit: number | null; // null = unlimited
  credits_used: number;
  status: UserStatus;
  created_at: string;
}

export interface Prompt {
  id: string;
  function_key: string;
  name: string;
  system_prompt: string;
  version: number;
  updated_by: string | null;
  updated_at: string;
  created_at: string;
}

export interface SessionRow {
  id: string;
  user_id: string;
  title: string | null;
  company: string | null;
  product: string | null;
  audience: string | null;
  offer: string | null;
  objective: string | null;
  context: string | null;
  selected_angle: string | null;
  selected_primary: string | null;
  created_at: string;
  updated_at: string;
}

export interface GenerationRow {
  id: string;
  session_id: string | null;
  user_id: string;
  function_key: string;
  input: Record<string, unknown> | null;
  output: Record<string, unknown> | null;
  provider: string | null;
  model: string | null;
  input_tokens: number;
  output_tokens: number;
  created_at: string;
}
