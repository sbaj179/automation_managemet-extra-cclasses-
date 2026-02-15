import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

export async function POST(req: Request) {
  const url = new URL(req.url);
  const form = await req.formData();

  const fullName = String(form.get("full_name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");

  if (!fullName) {
    return NextResponse.redirect(new URL("/login?error=" + encodeURIComponent("Full name is required."), url), {
      status: 303,
    });
  }
  if (!email) {
    return NextResponse.redirect(new URL("/login?error=" + encodeURIComponent("Email is required."), url), {
      status: 303,
    });
  }
  if (password.length < 8) {
    return NextResponse.redirect(
      new URL("/login?error=" + encodeURIComponent("Password must be at least 8 characters."), url),
      { status: 303 }
    );
  }

  const cookieStore = await cookies();

  // default success redirect
  const res = NextResponse.redirect(new URL("/onboarding", url), { status: 303 });

  // critical for http://localhost
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
            const opts: CookieOptions = {
              ...(c.options ?? {}),
              secure: isLocalHttp ? false : (c.options?.secure ?? true),
              sameSite: (c.options?.sameSite ?? "lax") as any,
            };
            res.cookies.set(c.name, c.value, opts);
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    return NextResponse.redirect(new URL("/login?error=" + encodeURIComponent(error.message), url), {
      status: 303,
    });
  }

  // If you forgot to disable email confirmation, you'll land back on login with this.
  if (!data.session) {
    return NextResponse.redirect(
      new URL(
        "/login?error=" +
          encodeURIComponent("Signup succeeded but no session. Disable email confirmation in Supabase."),
        url
      ),
      { status: 303 }
    );
  }

  return res;
}
