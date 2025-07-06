import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

const handler = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
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
      // Ajouter l'ID utilisateur à la session
      if (token.sub && session.user) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      // Lors de la première connexion, sync avec ton backend
      if (account && profile) {
        try {
          const githubProfile = profile as any;
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/sync`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                githubId: githubProfile.id,
                username: githubProfile.login,
                email: githubProfile.email,
                name: githubProfile.name,
                avatarUrl: githubProfile.avatar_url,
              }),
            }
          );

          if (response.ok) {
            const userData = await response.json();
            token.userId = userData.id;
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
