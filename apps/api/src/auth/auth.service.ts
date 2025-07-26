import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.interface';
import { randomBytes } from 'crypto';
import { UnauthorizedException } from '@nestjs/common';

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

  async validateGithubUser(
    profile: GitHubProfile,
    githubAccessToken?: string,
  ): Promise<User> {
    let user = await this.usersService.findByGithubId(profile.id);

    if (!user) {
      user = await this.usersService.create(profile, githubAccessToken);
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
      const updatedUser = await this.usersService.update(user.id, updateData);
      if (!updatedUser) {
        throw new Error('Failed to update user');
      }
      user = updatedUser;
    }

    return user;
  }

  async validateJwtPayload(payload: JwtPayload): Promise<User | null> {
    const user = await this.usersService.findById(payload.sub);
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

  async login(user: User): Promise<{
    access_token: string;
    refresh_token: string;
    user: User;
  }> {
    const access_token = this.generateJwtToken(user);
    const refresh_token = this.generateRefreshToken();
    await this.usersService.updateRefreshToken(user.id, refresh_token);

    return {
      access_token,
      refresh_token,
      user,
    };
  }

  async refreshTokens(refreshToken: string) {
    const user = await this.usersService.findByRefreshToken(refreshToken);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = { username: user.username, sub: user.id };
    const access_token = this.jwtService.sign(payload);
    const newRefreshToken = randomBytes(20).toString('hex');
    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 30);

    await this.usersService.updateRefreshToken(
      user.id,
      newRefreshToken,
      refreshTokenExpires,
    );

    return {
      access_token,
      refresh_token: newRefreshToken,
      user,
    };
  }

  async refreshUserData(userId: string): Promise<User> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, undefined);
  }
}
