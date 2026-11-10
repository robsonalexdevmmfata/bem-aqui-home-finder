/** Helpers de ambiente — evita crash quando Vercel ainda não tem Secrets. */

export function getSupabasePublicEnv() {
  const url =
    (typeof import.meta !== "undefined" && import.meta.env?.["VITE_SUPABASE_URL"]) ||
    (typeof process !== "undefined" ? process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"] : undefined) ||
    "";
  const key =
    (typeof import.meta !== "undefined" && import.meta.env?.["VITE_SUPABASE_PUBLISHABLE_KEY"]) ||
    (typeof process !== "undefined"
      ? process.env["SUPABASE_PUBLISHABLE_KEY"] || process.env["VITE_SUPABASE_PUBLISHABLE_KEY"]
      : undefined) ||
    "";
  return {
    url: String(url).replace(/\/+$/, ""),
    key: String(key),
  };
}

export function hasSupabaseEnv() {
  const { url, key } = getSupabasePublicEnv();
  return Boolean(url && key);
}
