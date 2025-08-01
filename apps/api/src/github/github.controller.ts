import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  UnauthorizedException,
  Query,
  Sse,
  Res,
  Options,
  Delete,
  Headers,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { GithubService } from './github.service';
import { Installation } from './entities/installation.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GitHubRepository } from './interfaces/github-repository.interface';
import { GitHubRepositoriesPage } from './interfaces/github-repositories-page.interface';
import { User } from '../users/user.interface';
import { GithubAppService } from './github-app.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DEFAULT_JWT_SECRET } from '../common/constants';
import { GenerateService } from './services/generate.service';
import { GenerateDto, GenerateResultDto } from './dto/generate.dto';
import { UpdatePostStatusDto } from './dto/post.dto';
import { Event } from './entities/event.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTestEventDto } from './dto/create-test-event.dto';

interface AuthenticatedRequest {
  user: User;
}

@Controller('github')
export class GithubController {
  constructor(
    private readonly githubService: GithubService,
    private readonly appService: GithubAppService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly generateService: GenerateService,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  private verifyToken(token?: string, authHeader?: string): any {
    // Le token peut arriver avec ou sans le préfixe "Bearer "
    const authToken =
      token ||
      (authHeader?.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : authHeader); // Si pas de préfixe, prendre directement le header

    if (!authToken) {
      throw new UnauthorizedException('Token required');
    }

    try {
      const jwtSecret =
        this.configService.get<string>('JWT_SECRET') || DEFAULT_JWT_SECRET;
      return this.jwtService.verify(authToken, { secret: jwtSecret });
    } catch (error) {
      console.error('JWT verification failed:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

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
  @Get('repositories/length')
  async getRepositoriesLength(
    @Request() req: AuthenticatedRequest,
  ): Promise<number> {
    const user = req.user;
    if (!user?.githubAccessToken) {
      throw new UnauthorizedException('No GitHub access token found for user');
    }
    return this.githubService.getUserRepositoriesLength(user.githubAccessToken);
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

  @UseGuards(JwtAuthGuard)
  @Get('events/length')
  async getEventsLength() {
    const count = await this.appService.getEventsCount();
    return { count };
  }

  @UseGuards(JwtAuthGuard)
  @Get('events/paginated')
  async getEventsPaginated(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return this.appService.getEventsPaginated(pageNum, limitNum);
  }

  @UseGuards(JwtAuthGuard)
  @Get('events/:id')
  async getEventById(@Param('id') id: string) {
    const event = await this.appService.getEventById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  // Récupération des events traités le mois actuel
  @UseGuards(JwtAuthGuard)
  @Get('events/current-month')
  async getCurrentMonthEvents() {
    const events = await this.appService.getCurrentMonthEvents();
    return events;
  }

  @Sse('events/length/stream')
  streamEventsLength(
    @Headers('authorization') authHeader: string,
    @Res({ passthrough: true }) res: Response,
  ): Observable<{ data: string; type: string }> {
    // Configuration CORS spécifique pour les SSE
    res.setHeader(
      'Access-Control-Allow-Origin',
      process.env.FRONTEND_URL || 'http://localhost:3000',
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Cache-Control, Last-Event-ID',
    );
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');

    // Vérifier le token
    this.verifyToken(undefined, authHeader);

    return this.appService.getEventsCountStream().pipe(
      map((count) => ({
        data: JSON.stringify({ count }),
        type: 'count',
      })),
    );
  }

  @Options('events/length/stream')
  handleEventsLengthStreamOptions(@Res() res: Response) {
    res.setHeader(
      'Access-Control-Allow-Origin',
      process.env.FRONTEND_URL || 'http://localhost:3000',
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Cache-Control, Last-Event-ID',
    );
    res.status(200).send();
  }

  @Sse('posts/stats/stream')
  streamPostsStats(
    @Headers('authorization') authHeader: string,
    @Res({ passthrough: true }) res: Response,
  ): Observable<{ data: string; type: string }> {
    // Configuration CORS spécifique pour les SSE
    res.setHeader(
      'Access-Control-Allow-Origin',
      process.env.FRONTEND_URL || 'http://localhost:3000',
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Cache-Control, Last-Event-ID',
    );
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');

    // Vérifier le token
    this.verifyToken(undefined, authHeader);

    return this.appService.getPostsStatsStream().pipe(
      map((data) => ({
        data: JSON.stringify(data),
        type: data.type,
      })),
    );
  }

  @Options('posts/stats/stream')
  handlePostsStatsStreamOptions(@Res() res: Response) {
    res.setHeader(
      'Access-Control-Allow-Origin',
      process.env.FRONTEND_URL || 'http://localhost:3000',
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Cache-Control, Last-Event-ID',
    );
    res.status(200).send();
  }

  @Sse('events/stream')
  streamEventsWithUpdates(
    @Headers('authorization') authHeader: string,
    @Res({ passthrough: true }) res: Response,
  ): Observable<{ data: string; type: string }> {
    // Configuration CORS spécifique pour les SSE
    res.setHeader(
      'Access-Control-Allow-Origin',
      process.env.FRONTEND_URL || 'http://localhost:3000',
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Cache-Control, Last-Event-ID',
    );
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');

    // Vérifier le token
    this.verifyToken(undefined, authHeader);

    return this.appService.getEventsStreamWithUpdates().pipe(
      map((data) => ({
        data: JSON.stringify(data),
        type: data.type,
      })),
    );
  }

  @Options('events/stream')
  handleEventsStreamOptions(@Res() res: Response) {
    res.setHeader(
      'Access-Control-Allow-Origin',
      process.env.FRONTEND_URL || 'http://localhost:3000',
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Cache-Control, Last-Event-ID',
    );
    res.status(200).send();
  }

  @UseGuards(JwtAuthGuard)
  @Get('app/test-api')
  async testGitHubAppApi(@Request() req: AuthenticatedRequest) {
    const user = req.user;

    console.log('=== TEST GITHUB APP API ===');
    console.log('User ID:', user.id);
    console.log('User GitHub ID:', user.githubId);
    console.log('User has GitHub Token:', !!user.githubAccessToken);

    if (!user.githubAccessToken) {
      return { error: 'No GitHub access token' };
    }

    try {
      // Test direct avec l'API GitHub
      const response = await fetch(
        'https://api.github.com/user/installations',
        {
          headers: {
            Authorization: `token ${user.githubAccessToken}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'Quori-App',
          },
        },
      );

      const scopes = response.headers.get('x-oauth-scopes');
      console.log('🔑 Scopes from direct API call:', scopes);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Direct API call failed:', response.status, errorText);
        return {
          error: 'API_CALL_FAILED',
          status: response.status,
          message: errorText,
          scopes,
        };
      }

      const data = await response.json();
      console.log(
        '✅ Direct API call successful, installations:',
        data.installations?.length || 0,
      );

      return {
        success: true,
        scopes,
        installationsCount: data.installations?.length || 0,
        installations: data.installations || [],
      };
    } catch (error) {
      console.error('💥 Error in direct API test:', error);
      return {
        error: 'EXCEPTION',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('app/debug')
  async debugAppInstallations(
    @Request() req: AuthenticatedRequest,
    @Query('code') code?: string,
  ) {
    const user = req.user;

    console.log('=== DEBUG APP INSTALLATIONS ===');
    console.log('User ID:', user.id);
    console.log(
      'User GitHub ID:',
      user.githubId,
      'Type:',
      typeof user.githubId,
    );

    // Récupérer toutes les installations
    const allInstallations = await this.appService.getAllInstallations();
    console.log('All installations in DB:', allInstallations);

    // Récupérer les installations de l'utilisateur
    const userInstallations = await this.appService.getUserInstallations(
      user.githubId,
    );
    console.log('User installations:', userInstallations);

    // Essayer de récupérer depuis GitHub si un code est fourni
    let githubInstallations: Installation[] = [];
    if (code) {
      try {
        const token = await this.appService.exchangeCodeForUserToken(code);
        githubInstallations =
          await this.appService.syncUserInstallationsFromGitHub(token);
        console.log('GitHub installations:', githubInstallations);
      } catch (error) {
        console.error('Error fetching from GitHub:', error);
      }
    }

    return {
      user: {
        id: user.id,
        githubId: user.githubId,
      },
      allInstallations,
      userInstallations,
      githubInstallations,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('app/status')
  async getAppInstallationStatus(
    @Request() req: AuthenticatedRequest,
    @Query('code') code?: string,
  ) {
    const user = req.user;

    console.error('userid:', user.id);
    console.log('user.githubId:', user.githubId, typeof user.githubId);

    let installations = await this.appService.getUserInstallations(
      user.githubId,
    );

    console.log(
      `🔄 Found ${installations.length} installations in DB for user ${user.githubId}`,
    );

    if (installations.length === 0 && code) {
      console.log('🔄 No installations found in DB, syncing from GitHub...');

      try {
        const token = await this.appService.exchangeCodeForUserToken(code);
        installations = await this.appService.syncUserInstallationsFromGitHub(
          token,
        );

        console.log(
          `✅ Synced ${installations.length} installations from GitHub`,
        );
      } catch (error: any) {
        // Gérer spécifiquement l'erreur d'authentification GitHub App
        if (error?.status === 403) {
          console.warn(
            '⚠️ GitHub token does not have GitHub App permissions. User needs to re-authenticate with proper scopes.',
          );
          // On peut retourner une erreur spécifique pour informer le frontend
          return {
            installed: false,
            installations: [],
            installUrl: this.appService.getInstallationUrl(),
            error: 'INSUFFICIENT_PERMISSIONS',
            message:
              "Veuillez vous reconnecter pour autoriser l'accès aux GitHub Apps",
          };
        } else {
          console.error('❌ Failed to sync installations from GitHub:', error);
        }
      }
    }

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

    this.githubService.clearUserCache(user.githubAccessToken);
    return { message: 'Cache cleared successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('generate')
  async generatePost(
    @Request() req: AuthenticatedRequest,
    @Body() body: GenerateDto,
    @Query('installationId') installationId?: string,
    @Query('eventDeliveryId') eventDeliveryId?: string,
  ): Promise<GenerateResultDto> {
    const user = req.user;
    const userId = user.id;

    const installationIdNum = installationId
      ? parseInt(installationId, 10)
      : undefined;

    return this.generateService.generate(
      userId,
      body,
      installationIdNum,
      eventDeliveryId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('posts')
  async getPosts(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('status') status?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return await this.generateService.getPosts(pageNum, limitNum, status);
  }

  @UseGuards(JwtAuthGuard)
  @Get('posts/:id')
  async getPostById(@Param('id') id: string) {
    const postId = parseInt(id, 10);
    const post = await this.generateService.getPostById(postId);
    if (!post) {
      throw new UnauthorizedException('Post not found');
    }
    return post;
  }

  @UseGuards(JwtAuthGuard)
  @Post('posts/:id/status')
  async updatePostStatus(
    @Param('id') id: string,
    @Body() body: UpdatePostStatusDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const postId = parseInt(id, 10);
    const user = req.user;

    // Si le statut passe à "published", publier sur LinkedIn
    if (body.status === 'published') {
      return await this.generateService.publishToLinkedIn(postId, user.id);
    }

    return await this.generateService.updatePostStatus(postId, body.status);
  }

  @UseGuards(JwtAuthGuard)
  @Post('posts/:id/publish-linkedin')
  async publishToLinkedIn(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const postId = parseInt(id, 10);
    const user = req.user;

    await this.generateService.updatePostStatus(postId, 'published');

    return await this.generateService.publishToLinkedIn(postId, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('app/sync')
  async syncInstallations(
    @Request() req: AuthenticatedRequest,
    @Body('code') code: string,
  ) {
    const user = req.user;

    console.log(`🔄 Manual sync requested for user ${user.githubId}`);

    if (!code) {
      throw new UnauthorizedException('Missing GitHub OAuth code');
    }

    try {
      const token = await this.appService.exchangeCodeForUserToken(code);
      const syncedInstallations =
        await this.appService.syncUserInstallationsFromGitHub(token);

      return {
        message: 'Installations synchronized successfully',
        count: syncedInstallations.length,
        installations: syncedInstallations.map((install) => ({
          id: install.id,
          account_login: install.account_login,
          repos: install.repos || [],
          created_at: install.created_at,
        })),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new UnauthorizedException(
        `Failed to sync installations: ${errorMessage}`,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('app/force-sync')
  async forceSync(@Request() req: AuthenticatedRequest) {
    const user = req.user;
    console.log(`🔄 Force syncing installations for user ${user.githubId}...`);

    try {
      const allInstallations =
        await this.appService.forceSyncAllInstallations();

      const userInstallations = allInstallations.filter(
        (installation) => installation.account_id.toString() === user.githubId,
      );

      console.log(
        `✅ Force sync completed. Found ${userInstallations.length} installations for user ${user.githubId}`,
      );

      return {
        message: 'Force sync completed successfully',
        allCount: allInstallations.length,
        userCount: userInstallations.length,
        userInstallations: userInstallations.map((install) => ({
          id: install.id,
          account_login: install.account_login,
          repos: install.repos || [],
          created_at: install.created_at,
        })),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new UnauthorizedException(
        `Failed to force sync installations: ${errorMessage}`,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('events/scan')
  async scanUserEvents(@Request() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user?.githubAccessToken) {
      throw new UnauthorizedException('No GitHub access token found for user');
    }
    const reposPage = await this.githubService.getUserRepositories(
      user.githubAccessToken,
      1,
      100,
    );
    const repos = reposPage.repositories;
    const installations = await this.appService.getUserInstallations(
      user.githubId,
    );
    let totalImported = 0;
    let totalFetched = 0;
    const errors: string[] = [];
    for (const repo of repos) {
      try {
        const installation = installations.find((inst) =>
          inst.repos.includes(repo.full_name),
        );
        const installationId = installation?.id || 0;
        const [owner, repoName] = repo.full_name.split('/');
        const eventsRes = await fetch(
          `https://api.github.com/repos/${owner}/${repoName}/events`,
          {
            headers: {
              Authorization: `Bearer ${user.githubAccessToken}`,
              Accept: 'application/vnd.github.v3+json',
              'User-Agent': 'Quori-App',
            },
          },
        );
        if (!eventsRes.ok) continue;
        const events = await eventsRes.json();
        totalFetched += Array.isArray(events) ? events.length : 0;
        for (const event of events) {
          try {
            const deliveryId =
              event.id || `${repo.full_name}-${event.type}-${event.created_at}`;
            await this.appService.recordEvent(
              deliveryId,
              installationId,
              event.type,
              event,
            );
            totalImported++;
          } catch (e) {
            errors.push(
              `Event import error for ${repo.full_name}: ${e instanceof Error ? e.message : e}`,
            );
          }
        }
      } catch (e) {
        errors.push(
          `Repo scan error for ${repo.full_name}: ${e instanceof Error ? e.message : e}`,
        );
      }
    }
    return {
      message: 'Scan terminé',
      totalRepos: repos.length,
      totalFetched,
      totalImported,
      errors,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('posts/:id')
  async deletePost(@Param('id') id: string) {
    const postId = parseInt(id, 10);
    return await this.generateService.deletePost(postId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('events/test')
  async createTestEvent(
    @Request() req: AuthenticatedRequest,
    @Body() body: CreateTestEventDto,
  ): Promise<Event> {
    // Créer l'événement de test
    const event = new Event();
    event.delivery_id = body.delivery_id;
    event.event = body.event;
    event.event_type = body.event_type;
    event.payload = body.payload;
    event.repo_full_name = body.repo_full_name;
    event.author_login = body.author_login;
    event.author_avatar_url = body.author_avatar_url;
    event.metadata = body.metadata;
    event.status = body.status || 'pending';
    event.error_message = body.error_message;
    event.received_at = new Date();

    // Si un installation_id est fourni, l'associer
    if (body.installation_id) {
      const installation = await this.appService.getInstallationById(
        body.installation_id,
      );
      if (installation) {
        event.installation = installation;
      }
    }

    return this.eventRepository.save(event);
  }
}
