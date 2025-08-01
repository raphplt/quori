import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { AuthService, GitHubProfile } from '../auth.service';
import { User } from '../../users/user.interface';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID:
        configService.get<string>('GITHUB_CLIENT_ID') || 'default-client-id',
      clientSecret:
        configService.get<string>('GITHUB_CLIENT_SECRET') ||
        'default-client-secret',
      callbackURL:
        configService.get<string>('GITHUB_CALLBACK_URL') ||
        'http://localhost:3001/api/auth/github/callback',
      scope: ['user:email', 'read:user', 'read:org', 'repo'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GitHubProfile,
  ): Promise<User> {
    console.log('🔑 GitHub OAuth - Access Token received');
    console.log('🔍 Profile ID:', profile.id);
    console.log('👤 Profile username:', profile.username);

    // Debug: vérifier les scopes du token
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      const scopes = response.headers.get('x-oauth-scopes');
      console.log('📋 OAuth scopes reçus:', scopes);
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des scopes:', error);
    }

    return this.authService.validateGithubUser(profile, accessToken);
  }
}
