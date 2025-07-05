import { betterAuth } from 'better-auth';

export const auth = betterAuth({
  baseUrl: process.env.BASE_URL || 'http://localhost:3001',
  database: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      scope: ['user:email', 'read:user', 'repo'],
    },
  },
  trustedOrigins: [
    'http://localhost:3000',
    process.env.FRONTEND_URL || 'http://localhost:3000',
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  user: {
    additionalFields: {
      githubUsername: {
        type: 'string',
        required: false,
      },
      avatarUrl: {
        type: 'string',
        required: false,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
