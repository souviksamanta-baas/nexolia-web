import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client for Server Components / route handlers.
 * Reads and refreshes the session cookies emitted by @supabase/ssr.
 */
export async function getSupabaseServerClient(): Promise<SupabaseClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error(
      "Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, anon, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (
        all: { name: string; value: string; options: CookieOptions }[],
      ) => {
        try {
          for (const { name, value, options } of all) {
            cookieStore.set({ name, value, ...options });
          }
        } catch {
          // called from a Server Component that can't mutate cookies — safe to ignore.
        }
      },
    },
  });
}

export async function getServerAccessToken(): Promise<string | null> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}
