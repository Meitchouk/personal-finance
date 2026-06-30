import { createServerClient } from "@supabase/ssr";
import {
  authDebugLog,
  getCookieDebugInfo,
  getSearchParamDebugInfo,
} from "@/lib/auth-debug";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");
  const next = nextParam?.startsWith("/") ? nextParam : "/dashboard";
  const providerError =
    searchParams.get("error_description") || searchParams.get("error");
  const host = request.headers.get("host");

  authDebugLog(host, "callback", "start", {
    host,
    origin,
    pathname: request.nextUrl.pathname,
    hasCode: Boolean(code),
    codeLength: code?.length ?? 0,
    providerError: providerError ?? null,
    next,
    searchParams: getSearchParamDebugInfo(searchParams),
    requestCookies: getCookieDebugInfo(request.cookies.getAll()),
  });

  if (!code || providerError) {
    authDebugLog(host, "callback", "redirect-login-before-exchange", {
      reason: providerError ? "provider-error" : "missing-code",
      providerError: providerError ?? null,
    });

    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(
        providerError ?? "No se recibió el código de autenticación"
      )}`
    );
  }

  // Create the redirect response FIRST so Supabase can set session cookies
  // directly on it — if we used cookies() + a separate redirect, the session
  // cookies are lost because NextResponse.redirect() is a new response object.
  const response = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          authDebugLog(host, "callback", "set-session-cookies", {
            cookies: getCookieDebugInfo(cookiesToSet),
          });

          // Set on both the request (for any downstream reads) and the
          // response that will actually reach the browser.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    authDebugLog(host, "callback", "exchange-error", {
      message: error.message,
      status: error.status ?? null,
      name: error.name,
    });

    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  authDebugLog(host, "callback", "exchange-success-redirect", {
    redirectTo: `${origin}${next}`,
    responseCookies: getCookieDebugInfo(response.cookies.getAll()),
  });

  return response;
}
