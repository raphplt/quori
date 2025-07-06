import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.interface';
import { randomBytes } from 'crypto';

export interface JwtPayload {
  sub: string;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface GitHubProfile {
  id: string;
  username: string;
  displayName?: string;
  emails?: Array<{ value: string; primary?: boolean }>;
  photos?: Array<{ value: string }>;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  validateGithubUser(profile: GitHubProfile, githubAccessToken?: string): User {
    let user = this.usersService.findByGithubId(profile.id);

    if (!user) {
      user = this.usersService.create(profile, githubAccessToken);
    } else {
      const updateData: Partial<User> = {
        username: profile.username,
        email: profile.emails?.[0]?.value || user.email,
        avatarUrl: profile.photos?.[0]?.value || user.avatarUrl,
        name: profile.displayName || profile.username || user.name,
      };
      if (githubAccessToken) {
        updateData.githubAccessToken = githubAccessToken;
      }
      const updatedUser = this.usersService.update(user.id, updateData);
      if (!updatedUser) {
        throw new Error('Failed to update user');
      }
      user = updatedUser;
    }

    return user;
  }

  validateJwtPayload(payload: JwtPayload): User | null {
    const user = this.usersService.findById(payload.sub);
    return user || null;
  }

  generateJwtToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(): string {
    return randomBytes(32).toString('hex');
  }

  login(user: User): {
    access_token: string;
    refresh_token: string;
    user: User;
  } {
    const access_token = this.generateJwtToken(user);
    const refresh_token = this.generateRefreshToken();
    this.usersService.updateRefreshToken(user.id, refresh_token);

    return {
      access_token,
      refresh_token,
      user,
    };
  }

  refreshTokens(refreshToken: string): {
    access_token: string;
    refresh_token: string;
    user: User;
  } {
    const user = this.usersService.findByRefreshToken(refreshToken);
    if (!user) {
      throw new Error('Invalid refresh token');
    }

    const newAccess = this.generateJwtToken(user);
    const newRefresh = this.generateRefreshToken();
    this.usersService.updateRefreshToken(user.id, newRefresh);

    return {
      access_token: newAccess,
      refresh_token: newRefresh,
      user,
    };
  }

  logout(userId: string): void {
    this.usersService.updateRefreshToken(userId, undefined);
  }
}
