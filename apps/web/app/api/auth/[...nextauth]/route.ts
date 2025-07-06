import NextAuth from "next-auth";
import type { Account } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

const handler = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
  debug: true, // Active le debug pour voir les URLs
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        (session.user as { id?: string }).id = token.sub as string;
      }
      if (token.apiToken) {
        (session as { apiToken?: string }).apiToken = token.apiToken as string;
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const githubProfile = profile as any;
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/github/sync`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                githubProfile: {
                  id: githubProfile.id,
                  login: githubProfile.login,
                  name: githubProfile.name,
                  email: githubProfile.email,
                  avatar_url: githubProfile.avatar_url,
                },
                accessToken: (account as Account).access_token,
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            token.apiToken = data.access_token;
            token.sub = data.user.id;
          }
        } catch (error) {
          console.error("Erreur sync backend:", error);
        }
      }
      return token;
    },
  },
});

export { handler as GET, handler as POST };
