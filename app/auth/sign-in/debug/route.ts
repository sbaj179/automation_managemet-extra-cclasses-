import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

export async function GET(req: Request) {
  const url = new URL(req.url);
  const cookieStore = await cookies();

  const res = NextResponse.json({ ok: true });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach((c) => res.cookies.set(c.name, c.value, c.options));
        },
      },
    }
  );

  const { data: sess } = await supabase.auth.getSession();
  const { data: user } = await supabase.auth.getUser();

  const names = cookieStore.getAll().map((c) => c.name);

  return NextResponse.json({
    origin: url.origin,
    cookieNames: names,
    hasSbCookie: names.some((n) => n.startsWith("sb-")),
    sessionNull: !sess.session,
    userNull: !user.user,
    userId: user.user?.id ?? null,
  });
}
