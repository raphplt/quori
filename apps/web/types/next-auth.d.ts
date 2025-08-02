import type { DefaultSession, DefaultUser } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    apiToken?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      githubId?: string;
      username?: string;
      avatarUrl?: string;
      role?: string;
      linkedInId?: string;
      linkedinAccessToken?: string;
      createdAt?: string;
      updatedAt?: string;
    };
  }

  interface User extends DefaultUser {
    id: string;
    githubId: string;
    username: string;
    email: string;
    avatarUrl: string;
    name: string;
    role: string;
    linkedInId?: string;
    linkedinAccessToken?: string;
    createdAt: string;
    updatedAt: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    apiToken?: string;
    backendUser?: {
      id: string;
      githubId: string;
      username: string;
      email: string;
      avatarUrl: string;
      name: string;
      role: string;
      linkedInId?: string;
      linkedinAccessToken?: string;
      createdAt: string;
      updatedAt: string;
    };
  }
}
