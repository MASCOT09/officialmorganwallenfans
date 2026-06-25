import type { Repository } from "./types";
import { createSupabaseRepository } from "./supabase";
import { createExcelRepository } from "./excel";

let repo: Repository | null = null;

export function isSupabaseEnabled(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getRepository(): Repository {
  if (!repo) {
    repo = isSupabaseEnabled() ? createSupabaseRepository() : createExcelRepository();
  }
  return repo;
}
