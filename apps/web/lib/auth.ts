import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"

declare module "next-auth" {
  interface Session {
    apiToken?: string
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      username?: string
      githubId?: string
    }
  }
  
  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    username?: string
    githubId?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    apiToken?: string
    user?: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      username?: string
      githubId?: string
    }
  }
}

// Configuration NextAuth
export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "github-api",
      name: "GitHub",
      type: "oauth",
      authorization: {
        url: "https://github.com/login/oauth/authorize",
        params: {
          scope: "read:user user:email",
        },
      },
      token: "https://github.com/login/oauth/access_token",
      userinfo: "https://api.github.com/user",
      // eslint-disable-next-line turbo/no-undeclared-env-vars
      clientId: process.env.AUTH_GITHUB_ID!,
      // eslint-disable-next-line turbo/no-undeclared-env-vars
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      profile: async (
        profile: Record<string, unknown>,
        tokens: Record<string, unknown>,
      ) => {
        // Après récupération du profil GitHub, on l'envoie à notre API
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/github/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              githubProfile: profile,
              accessToken: tokens.access_token,
            }),
          })
          
          if (response.ok) {
            const userData = await response.json()
            return {
              id: userData.user.id,
              name: userData.user.name,
              email: userData.user.email,
              image: userData.user.avatarUrl,
              username: userData.user.username,
              githubId: userData.user.githubId,
              apiToken: userData.access_token,
            }
          }
        } catch (error) {
          console.error('Erreur lors de la synchronisation avec l\'API:', error)
        }
        
        // Fallback si l'API ne répond pas
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          username: profile.login,
          githubId: profile.id.toString(),
        }
      },
    },
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      // Stocker le token de votre API
      if (account && user) {
        const extendedUser = user as {
          apiToken?: string
          username?: string
          githubId?: string
        } & typeof user

        token.apiToken = extendedUser.apiToken
        token.user = {
          id: extendedUser.id,
          name: extendedUser.name,
          email: extendedUser.email,
          image: extendedUser.image,
          username: extendedUser.username,
          githubId: extendedUser.githubId,
        }
      }
      
      return token
    },
    async session({ session, token }) {
      // Ajouter les données à la session
      session.apiToken = token.apiToken
      session.user = token.user || session.user
      
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/dashboard`
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 jours
  },
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  debug: process.env.NODE_ENV === "development",
}

export default NextAuth(authOptions)
