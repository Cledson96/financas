import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      return true;
      const isLoggedIn = !!auth?.user;

      const isPublicPath =
        nextUrl.pathname === "/login" ||
        nextUrl.pathname.startsWith("/auth/error") ||
        nextUrl.pathname.startsWith("/api/auth") ||
        nextUrl.pathname.startsWith("/api/assistant") ||
        nextUrl.pathname.startsWith("/_next") ||
        nextUrl.pathname === "/favicon.ico";

      if (isLoggedIn) {
        if (nextUrl.pathname === "/login") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      return isPublicPath;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
