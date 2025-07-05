import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.interface';

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

  validateGithubUser(profile: GitHubProfile): User {
    let user = this.usersService.findByGithubId(profile.id);

    if (!user) {
      user = this.usersService.create(profile);
    } else {
      // Update user info from GitHub
      const updatedUser = this.usersService.update(user.id, {
        username: profile.username,
        email: profile.emails?.[0]?.value || user.email,
        avatarUrl: profile.photos?.[0]?.value || user.avatarUrl,
        name: profile.displayName || profile.username || user.name,
      });
      
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

  login(user: User): { access_token: string; user: User } {
    const access_token = this.generateJwtToken(user);

    return {
      access_token,
      user,
    };
  }
}
