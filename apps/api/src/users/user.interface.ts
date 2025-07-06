export interface User {
  id: string;
  githubId: string;
  username: string;
  email: string;
  avatarUrl: string;
  name: string;
  githubAccessToken?: string; // Token pour accéder à l'API GitHub
  refreshToken?: string;
  refreshTokenExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}
