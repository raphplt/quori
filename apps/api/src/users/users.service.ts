import { Injectable } from '@nestjs/common';
import { User } from './user.interface';

export interface GitHubProfile {
  id: string;
  username: string;
  displayName?: string;
  emails?: Array<{ value: string; primary?: boolean }>;
  photos?: Array<{ value: string }>;
}

@Injectable()
export class UsersService {
  private users: User[] = [];

  findByRefreshToken(refreshToken: string): User | undefined {
    return this.users.find((user) => user.refreshToken === refreshToken);
  }

  findByGithubId(githubId: string): User | undefined {
    return this.users.find((user) => user.githubId === githubId);
  }

  findById(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  updateRefreshToken(
    id: string,
    refreshToken: string | undefined,
    refreshTokenExpires?: Date,
  ): void {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) return;
    this.users[userIndex].refreshToken = refreshToken;
    this.users[userIndex].refreshTokenExpires = refreshTokenExpires;
    this.users[userIndex].updatedAt = new Date();
  }

  create(githubProfile: GitHubProfile, githubAccessToken?: string): User {
    const user: User = {
      id: this.generateId(),
      githubId: githubProfile.id,
      username: githubProfile.username,
      email: githubProfile.emails?.[0]?.value || '',
      avatarUrl: githubProfile.photos?.[0]?.value || '',
      name: githubProfile.displayName || githubProfile.username,
      githubAccessToken,
      refreshToken: undefined,
      refreshTokenExpires: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(user);
    return user;
  }

  update(id: string, updateData: Partial<User>): User | undefined {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      return undefined;
    }

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updateData,
      updatedAt: new Date(),
    };

    return this.users[userIndex];
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
