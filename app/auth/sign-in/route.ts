import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

export async function POST(req: Request) {
  const url = new URL(req.url);

  const form = await req.formData();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");

  if (!email || !password) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent("Email and password are required.")}`, url),
      { status: 303 }
    );
  }

  const cookieStore = await cookies();

  const redirectTo = NextResponse.redirect(new URL("/dashboard", url), { status: 303 });

  const isLocalHttp = url.hostname === "localhost" && url.protocol === "http:";

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach((c) => {
            const options: CookieOptions = {
              ...(c.options ?? {}),
              // Critical for localhost over http:
              secure: isLocalHttp ? false : (c.options?.secure ?? true),
              sameSite: (c.options?.sameSite ?? "lax") as any,
            };

            redirectTo.cookies.set(c.name, c.value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, url),
      { status: 303 }
    );
  }

  return redirectTo;
}
