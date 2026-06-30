type AuthDebugDetails = Record<string, unknown>;

const AUTH_DEBUG_PREFIX = "[auth-debug]";

export function isLocalAuthDebugHost(host?: string | null) {
  if (!host) return false;

  const normalizedHost = host.toLowerCase();
  const hostname = normalizedHost.startsWith("[")
    ? normalizedHost.slice(1, normalizedHost.indexOf("]"))
    : normalizedHost.split(":")[0];

  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

export function isAuthDebugEnabled(host?: string | null) {
  return (
    process.env.NEXT_PUBLIC_AUTH_DEBUG === "true" ||
    (process.env.NODE_ENV === "development" && (!host || isLocalAuthDebugHost(host)))
  );
}

export function authDebugLog(
  host: string | null | undefined,
  source: string,
  event: string,
  details: AuthDebugDetails = {}
) {
  if (!isAuthDebugEnabled(host)) return;

  console.info(AUTH_DEBUG_PREFIX, source, event, {
    at: new Date().toISOString(),
    ...details,
  });
}

export function getCookieDebugInfo(
  cookies: Array<{ name: string; value?: string }>
) {
  return {
    count: cookies.length,
    names: cookies.map((cookie) => cookie.name),
  };
}

export function getSearchParamDebugInfo(searchParams: URLSearchParams) {
  return Object.fromEntries(
    Array.from(searchParams.entries()).map(([key, value]) => [
      key,
      key === "code"
        ? { present: true, length: value.length, prefix: value.slice(0, 4) }
        : value,
    ])
  );
}
