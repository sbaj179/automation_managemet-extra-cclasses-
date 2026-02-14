// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = {
  name: string;
  value: string;
  options?: CookieOptions;
};

export async function createClient() {
  const cookieStore = await cookies(); // keep async to match your Next setup

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // make sure this env var exists
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach((c) => {
              cookieStore.set({
                name: c.name,
                value: c.value,
                ...(c.options ?? {}),
              });
            });
          } catch {
            // Can throw during Server Component render (read-only cookies).
            // Works in Server Actions / Route Handlers.
          }
        },
      },
    }
  );
}
