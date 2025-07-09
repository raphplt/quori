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
    @Query('perPage') perPage = '30',
  ): Promise<GitHubRepositoriesPage> {
    const user = req.user;
    if (!user?.githubAccessToken) {
      throw new UnauthorizedException('No GitHub access token found for user');
    }
    const pageNum = parseInt(page, 10) || 1;
    const perPageNum = parseInt(perPage, 10) || 30;
    return this.githubService.getUserRepositories(
      user.githubAccessToken,
      pageNum,
      perPageNum,
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
    return this.appService.getRecentEvents(num);
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
      console.error('SSE: No token provided');
      throw new UnauthorizedException('Token required');
    }

    try {
      this.jwtService.verify(token);
      console.log('SSE: Token verified successfully');
    } catch (error) {
      console.error(
        'SSE: Token verification failed:',
        error instanceof Error ? error.message : 'Unknown error',
      );
      throw new UnauthorizedException('Invalid token');
    }

    console.log('SSE: Starting event stream');

    return this.appService.getEventStream().pipe(
      map((event) => {
        console.log('SSE: Sending event:', event.delivery_id);
        return {
          data: JSON.stringify(event),
          id: event.delivery_id,
          type: 'event',
        };
      }),
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
}
