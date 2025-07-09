import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  UnauthorizedException,
  Query,
  Sse,
} from '@nestjs/common';
import { GithubService } from './github.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { GitHubRepository } from './interfaces/github-repository.interface';
import { GitHubRepositoriesPage } from './interfaces/github-repositories-page.interface';
import { User } from '../users/user.interface';
import { GithubAppService } from './github-app.service';

interface AuthenticatedRequest {
  user: User;
}

@Controller('github')
export class GithubController {
  constructor(
    private readonly githubService: GithubService,
    private readonly usersService: UsersService,
    private readonly appService: GithubAppService,
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

  @UseGuards(JwtAuthGuard)
  @Sse('events/stream')
  streamEvents() {
    return this.appService.getEventStream();
  }
}
