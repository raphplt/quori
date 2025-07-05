import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';

interface GitHubSyncDto {
  githubProfile: {
    id: number;
    login: string;
    name: string;
    email: string;
    avatar_url: string;
  };
  accessToken: string;
}

@Controller('auth')
export class AuthSyncController {
  constructor(private readonly authService: AuthService) {}

  @Post('github/sync')
  @HttpCode(200)
  async syncGitHubUser(@Body() body: GitHubSyncDto) {
    // Convertir le profil GitHub au format attendu
    const profile = {
      id: body.githubProfile.id.toString(),
      username: body.githubProfile.login,
      displayName: body.githubProfile.name,
      emails: body.githubProfile.email ? [{ value: body.githubProfile.email }] : [],
      photos: [{ value: body.githubProfile.avatar_url }],
    };

    // Créer ou mettre à jour l'utilisateur
    const user = this.authService.validateGithubUser(profile);
    
    // Générer le token JWT
    const access_token = this.authService.generateJwtToken(user);

    return {
      access_token,
      user,
    };
  }
}
