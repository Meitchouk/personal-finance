import { isLocalAuthDebugHost } from "@/lib/auth-debug";

export function getAuthCallbackUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

  if (typeof window !== "undefined" && isLocalAuthDebugHost(window.location.host)) {
    return `${window.location.origin}/auth/callback`;
  }

  if (siteUrl) {
    return `${siteUrl}/auth/callback`;
  }

  return `${window.location.origin}/auth/callback`;
}
