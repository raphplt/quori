import { Injectable } from '@nestjs/common';

export interface User {
  id: string;
  name: string;
  email: string;
  githubUsername?: string;
  avatarUrl?: string;
}

export interface Session {
  user: User;
  token: string;
}

@Injectable()
export class AuthService {
  // Pour le moment, on va simuler l'authentification
  // Better Auth sera intégré directement dans le frontend

  async getSession(token: string): Promise<Session | null> {
    // Cette méthode sera implémentée avec Better Auth
    return null;
  }

  async validateUser(githubUser: any): Promise<User> {
    return {
      id: githubUser.id.toString(),
      name: githubUser.name || githubUser.login,
      email: githubUser.email,
      githubUsername: githubUser.login,
      avatarUrl: githubUser.avatar_url,
    };
  }
}
