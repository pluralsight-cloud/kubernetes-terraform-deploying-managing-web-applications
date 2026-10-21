import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
      const isLogin = request.nextUrl.pathname.startsWith("/admin/login");
      if (isAdminRoute && !isLogin) {
        return !!auth?.user;
      }
      return true;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
