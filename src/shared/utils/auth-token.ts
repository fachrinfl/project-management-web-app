const TOKEN_COOKIE = "auth-token";
const ONE_WEEK_IN_SECONDS = 60 * 60 * 24 * 7;

function isBrowser() {
  return typeof document !== "undefined" && typeof window !== "undefined";
}

export function setAuthTokenCookie(token: string) {
  if (!token || !isBrowser()) {
    return;
  }

  const secure = window.location.protocol === "https:" ? "; Secure" : "";

  document.cookie = `${TOKEN_COOKIE}=${token}; Path=/; Max-Age=${ONE_WEEK_IN_SECONDS}; SameSite=Lax${secure}`;
}

export function clearAuthTokenCookie() {
  if (!isBrowser()) {
    return;
  }

  document.cookie = `${TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function getAuthTokenFromCookie(): string | null {
  if (!isBrowser()) {
    return null;
  }

  const cookies = document.cookie.split(";").map((cookie) => cookie.trim());

  for (const cookie of cookies) {
    if (cookie.startsWith(`${TOKEN_COOKIE}=`)) {
      return cookie.substring(TOKEN_COOKIE.length + 1) || null;
    }
  }

  return null;
}
