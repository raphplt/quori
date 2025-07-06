declare module "next-auth" {
  interface Session {
    apiToken?: string;
    user: {
      id: string;
      githubId: string;
      username: string;
      email: string;
      avatarUrl: string;
      name: string;
      createdAt: string;
      updatedAt: string;
      image?: string;
    };
  }

  interface User {
    id: string;
    githubId: string;
    username: string;
    email: string;
    avatarUrl: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    apiToken?: string;
    backendUser?: {
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
}
