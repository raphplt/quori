import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  UnauthorizedException,
  Query,
  Sse,
  Res,
  Options,
  Delete,
} from '@nestjs/common';
import { Response } from 'express';
import { map } from 'rxjs/operators';
import { GithubService } from './github.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { GitHubRepository } from './interfaces/github-repository.interface';
import { GitHubRepositoriesPage } from './interfaces/github-repositories-page.interface';
import { User } from '../users/user.interface';
import { GithubAppService } from './github-app.service';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedRequest {
  user: User;
}

@Controller('github')
export class GithubController {
  constructor(
    private readonly githubService: GithubService,
    private readonly usersService: UsersService,
    private readonly appService: GithubAppService,
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('repositories')
  async getMyRepositories(
    @Request() req: AuthenticatedRequest,
    @Query('page') page = '1',
    @Query('perPage') perPage = '6',
    @Query('sort')
    sort: 'name' | 'stars' | 'forks' | 'updated' | 'created' = 'updated',
    @Query('direction') direction: 'asc' | 'desc' = 'desc',
    @Query('search') search?: string,
    @Query('language') language?: string,
    @Query('visibility') visibility: 'all' | 'public' | 'private' = 'all',
  ): Promise<GitHubRepositoriesPage> {
    const user = req.user;
    if (!user?.githubAccessToken) {
      throw new UnauthorizedException('No GitHub access token found for user');
    }
    const pageNum = parseInt(page, 10) || 1;
    const perPageNum = parseInt(perPage, 10) || 6;

    return this.githubService.getUserRepositories(
      user.githubAccessToken,
      pageNum,
      perPageNum,
      sort,
      direction,
      search,
      language,
      visibility,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('repositories/:owner/:repo')
  async getRepository(
    @Request() req: AuthenticatedRequest,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ): Promise<GitHubRepository> {
    const user = req.user;
    if (!user?.githubAccessToken) {
      throw new UnauthorizedException('No GitHub access token found for user');
    }
    return this.githubService.getRepository(
      user.githubAccessToken,
      owner,
      repo,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('events')
  async getEvents(@Query('limit') limit = '20') {
    const num = parseInt(limit, 10) || 20;
    const events = await this.appService.getRecentEvents(num);
    return events;
  }

  @Sse('events/stream')
  streamEvents(
    @Query('token') token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Configuration CORS spécifique pour les SSE
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Cache-Control, Last-Event-ID',
    );
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');

    // Validate JWT token manually
    if (!token) {
      throw new UnauthorizedException('Token required');
    }

    try {
      this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    return this.appService.getEventStream().pipe(
      map((event) => ({
        data: JSON.stringify(event),
        id: event.delivery_id,
        type: 'event',
      })),
    );
  }

  @Options('events/stream')
  handleEventStreamOptions(@Res() res: Response) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Cache-Control, Last-Event-ID',
    );
    res.status(200).send();
  }

  @Get('test-event')
  async createTestEvent() {
    const saved = await this.appService.createTestEvent();
    return { message: 'Test event created', event: saved };
  }

  @Get('installations')
  async getInstallations() {
    // This is a debug endpoint - in production you'd want auth and proper filtering
    const installations = await this.appService.getAllInstallations();
    return installations;
  }

  @UseGuards(JwtAuthGuard)
  @Get('app/status')
  async getAppInstallationStatus(@Request() req: AuthenticatedRequest) {
    const user = req.user;
    // Rechercher les installations liées au compte GitHub de l'utilisateur
    const installations = await this.appService.getUserInstallations(
      user.githubId,
    );
    return {
      installed: installations.length > 0,
      installations: installations.map((install) => ({
        id: install.id,
        account_login: install.account_login,
        repos: install.repos || [],
        created_at: install.created_at,
      })),
      installUrl: this.appService.getInstallationUrl(),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('app/installation/:id')
  async revokeInstallation(
    @Request() req: AuthenticatedRequest,
    @Param('id') installationId: string,
  ) {
    const user = req.user;
    const id = parseInt(installationId, 10);

    try {
      // Vérifier que l'installation appartient bien à l'utilisateur
      const installation = await this.appService.getInstallationById(id);
      if (
        !installation ||
        installation.account_id.toString() !== user.githubId
      ) {
        throw new UnauthorizedException(
          'Installation not found or unauthorized',
        );
      }

      await this.appService.removeInstallation(id);
      return {
        message: 'Installation revoked successfully',
        installationId: id,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new UnauthorizedException(
        `Failed to revoke installation: ${errorMessage}`,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('repositories/cache')
  clearRepositoriesCache(@Request() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user?.githubAccessToken) {
      throw new UnauthorizedException('No GitHub access token found for user');
    }

    // Vider le cache pour cet utilisateur
    this.githubService.clearUserCache(user.githubAccessToken);
    return { message: 'Cache cleared successfully' };
  }
}
