import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      const isPublicPath =
        nextUrl.pathname === "/login" ||
        nextUrl.pathname.startsWith("/auth/error") ||
        nextUrl.pathname.startsWith("/api/auth") ||
        nextUrl.pathname.startsWith("/_next") ||
        nextUrl.pathname === "/favicon.ico";

      if (isLoggedIn) {
        // Redirect to dashboard if trying to access login page while logged in
        if (nextUrl.pathname === "/login") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      // If not logged in, only allow public paths
      return isPublicPath;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
