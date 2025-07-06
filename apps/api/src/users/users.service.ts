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

  findByGithubId(githubId: string): User | undefined {
    return this.users.find((user) => user.githubId === githubId);
  }

  findById(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
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
