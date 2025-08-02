export interface User {
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

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}
