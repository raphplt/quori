// on importe la factory NextAuth
import NextAuth from "next-auth";
import type {
  NextAuthConfig,
  Session,
  Account,
  Profile,
  User,
} from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { AdapterUser } from "next-auth/adapters";
import GitHubProvider from "next-auth/providers/github";

interface GitHubProfileRaw {
  id: string;
  login: string;
  name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
}

interface SyncResponse {
  access_token: string;
  user: {
    id: string;
    githubId: string;
    username: string;
    email: string;
    avatarUrl: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
}

async function syncWithBackend(
  profile: GitHubProfileRaw,
  accessToken: string
): Promise<SyncResponse | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/github/sync`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          githubProfile: {
            id: Number(profile.id),
            login: profile.login,
            name: profile.name,
            email: profile.email,
            avatar_url: profile.avatar_url,
          },
          accessToken,
        }),
      }
    );
    if (!res.ok) {
      console.error(`Sync failed: HTTP ${res.status}`);
      return null;
    }
    return (await res.json()) as SyncResponse;
  } catch (err) {
    console.error("Erreur sync backend:", err);
    return null;
  }
}

export const authOptions: NextAuthConfig = {
  providers: [
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  debug: process.env.NEXTAUTH_DEBUG === "true",
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async redirect({
      url,
      baseUrl,
    }: {
      url: string;
      baseUrl: string;
    }): Promise<string> {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },

    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }): Promise<Session> {
      if (token.sub) session.user.id = token.sub;
      if (token.apiToken) {
        (session as Session & { apiToken: string }).apiToken = token.apiToken;
      }
      if (token.backendUser) {
        const u = token.backendUser;
        session.user = {
          ...session.user,
          username: u.username,
          githubId: u.githubId,
          avatarUrl: u.avatarUrl,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        };
      }
      return session;
    },

    async jwt(params: {
      token: JWT;
      user?: User | AdapterUser;
      account?: Account | null;
      profile?: Profile | null;
      trigger?: "signIn" | "signUp" | "update";
      session?: Session | null;
      isNewUser?: boolean;
    }): Promise<JWT> {
      const { token, account, profile } = params;
      if (account && profile && typeof profile.login === "string") {
        const data = await syncWithBackend(
          profile as unknown as GitHubProfileRaw,
          account.access_token as string
        );
        if (data) {
          token.sub = data.user.id;
          token.apiToken = data.access_token;
          token.backendUser = data.user;
        }
      }
      return token;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
