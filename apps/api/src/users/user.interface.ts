export enum UserRoleEnum {
  USER = 'user',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  githubId: string;
  username: string;
  email: string;
  avatarUrl: string;
  name: string;
  role: UserRoleEnum;
  linkedInId?: string;
  linkedinAccessToken?: string;
  githubAccessToken?: string;
  refreshToken?: string;
  refreshTokenExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}
