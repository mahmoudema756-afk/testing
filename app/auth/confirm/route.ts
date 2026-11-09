import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const nextParam = request.nextUrl.searchParams.get("next");
  const next = nextParam?.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const redirectUrl = request.nextUrl.clone();
  if (!code || !url || !key) {
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("error", !code ? "missing_confirmation_code" : "configuration");
    return NextResponse.redirect(redirectUrl);
  }
  redirectUrl.pathname = next;
  const response = NextResponse.redirect(redirectUrl);
  const supabase = createServerClient(url, key, { cookies: { getAll: () => request.cookies.getAll(), setAll: cookies => cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options)) } });
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const errorUrl = request.nextUrl.clone();
    errorUrl.pathname = "/login";
    errorUrl.searchParams.set("error", "confirmation_failed");
    return NextResponse.redirect(errorUrl);
  }
  return response;
}
