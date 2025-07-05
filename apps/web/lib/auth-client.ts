import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  socialProviders: {
    github: {
      enabled: true,
    },
  },
});

export type Session = typeof authClient.$Infer.Session;
