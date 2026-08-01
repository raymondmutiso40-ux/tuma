import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Only these email addresses are allowed to sign in as admin. Anyone else
// authenticates fine with Google, but signIn() below rejects them before a
// session is ever created — so a valid Google account alone is NOT enough.
// Set ADMIN_EMAILS as a comma-separated list in Vercel env vars, e.g.
//   ADMIN_EMAILS=raymondmutiso40@gmail.com,another@gmail.com
function getAllowedAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const allowed = getAllowedAdminEmails();
      if (!user.email) return false;
      return allowed.includes(user.email.toLowerCase());
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
};
