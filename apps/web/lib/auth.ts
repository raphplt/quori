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

function decodeJwt(token: string): { exp?: number } {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString()
    );
    return payload;
  } catch {
    return {};
  }
}

async function refreshApiToken(
  refreshToken: string
): Promise<SyncResponse | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      return null;
    }
    return (await res.json()) as SyncResponse;
  } catch (err) {
    console.error("Failed to refresh API token", err);
    return null;
  }
}

interface GitHubProfileRaw {
  id: string;
  login: string;
  name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
}

interface SyncResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    githubId: string;
    username: string;
    email: string;
    avatarUrl: string;
    name: string;
    linkedInId?: string;
    linkedinAccessToken?: string;
    createdAt: string;
    updatedAt: string;
  };
}

async function syncWithBackend(
  profile: GitHubProfileRaw,
  accessToken: string
): Promise<SyncResponse | null> {
  try {
    console.log(
      "🔍 Syncing with backend, access token length:",
      accessToken.length
    );

    // Debug: vérifier les scopes du token côté frontend
    try {
      const scopeCheck = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      });
      const scopes = scopeCheck.headers.get("x-oauth-scopes");
      console.log("📋 Frontend OAuth scopes:", scopes);
    } catch (error) {
      console.error("❌ Frontend scope check error:", error);
    }

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
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: ["read:user", "user:email", "read:org", "repo"].join(" "),
        },
      },
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
          linkedInId: u.linkedInId,
          linkedinAccessToken: u.linkedinAccessToken,
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
      const { token, account, profile, trigger } = params;
      if (account && profile && typeof profile.login === "string") {
        const data = await syncWithBackend(
          profile as unknown as GitHubProfileRaw,
          account.access_token as string
        );
        if (data) {
          token.sub = data.user.id;
          token.apiToken = data.access_token;
          token.refreshToken = data.refresh_token;
          const decoded = decodeJwt(data.access_token);
          if (decoded.exp) {
            token.apiTokenExpires = decoded.exp * 1000;
          }
          token.backendUser = data.user;
        }
      } else if (trigger === "update" && token.apiToken) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-user`,
            {
              headers: { Authorization: `Bearer ${token.apiToken}` },
            }
          );
          if (res.ok) {
            const user = (await res.json()) as SyncResponse["user"];
            token.backendUser = user;
          }
        } catch (err) {
          console.error("Failed to refresh user data", err);
        }
      } else if (
        token.refreshToken &&
        token.apiTokenExpires &&
        Date.now() >= Number(token.apiTokenExpires) - 60000
      ) {
        const refreshed = await refreshApiToken(token.refreshToken as string);
        if (refreshed) {
          token.apiToken = refreshed.access_token;
          token.refreshToken = refreshed.refresh_token;
          const decoded = decodeJwt(refreshed.access_token);
          if (decoded.exp) {
            token.apiTokenExpires = decoded.exp * 1000;
          }
          token.backendUser = refreshed.user;
        }
      }
      return token;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
