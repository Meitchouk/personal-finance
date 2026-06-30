import { createServerClient } from "@supabase/ssr";
import { authDebugLog, getCookieDebugInfo } from "@/lib/auth-debug";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const host = request.headers.get("host");

  authDebugLog(host, "proxy", "start", {
    host,
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search,
    requestCookies: getCookieDebugInfo(request.cookies.getAll()),
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          authDebugLog(host, "proxy", "refresh-session-cookies", {
            cookies: getCookieDebugInfo(cookiesToSet),
          });

          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const isAuthRoute = request.nextUrl.pathname.startsWith("/login");
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");
  const isAuthCallback = request.nextUrl.pathname.startsWith("/auth/callback");

  authDebugLog(host, "proxy", "get-user-result", {
    hasUser: Boolean(user),
    userIdPrefix: user?.id.slice(0, 8) ?? null,
    error: error?.message ?? null,
    isAuthRoute,
    isApiRoute,
    isAuthCallback,
  });

  if (!user && !isAuthRoute && !isApiRoute && !isAuthCallback) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    authDebugLog(host, "proxy", "redirect-login", {
      from: request.nextUrl.pathname,
      to: url.pathname,
      reason: error?.message ?? "missing-user",
    });
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    authDebugLog(host, "proxy", "redirect-dashboard", {
      from: request.nextUrl.pathname,
      to: url.pathname,
      userIdPrefix: user.id.slice(0, 8),
    });
    return NextResponse.redirect(url);
  }

  authDebugLog(host, "proxy", "next", {
    pathname: request.nextUrl.pathname,
    responseCookies: getCookieDebugInfo(supabaseResponse.cookies.getAll()),
  });

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|manifest.webmanifest|sw.js|\\.well-known|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
