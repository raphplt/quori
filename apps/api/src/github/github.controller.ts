import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { GithubService } from './github.service';
import { CreateGithubDto } from './dto/create-github.dto';
import { UpdateGithubDto } from './dto/update-github.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { GitHubRepository } from './interfaces/github-repository.interface';
import { User } from '../users/user.interface';

interface AuthenticatedRequest {
  user: User;
}

@Controller('github')
export class GithubController {
  constructor(
    private readonly githubService: GithubService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('repositories')
  async getMyRepositories(
    @Request() req: AuthenticatedRequest,
  ): Promise<GitHubRepository[]> {
    const user = req.user;
    if (!user?.githubAccessToken) {
      throw new UnauthorizedException('No GitHub access token found for user');
    }
    return this.githubService.getUserRepositories(user.githubAccessToken);
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

  @Post()
  create(@Body() createGithubDto: CreateGithubDto) {
    return this.githubService.create(createGithubDto);
  }

  @Get()
  findAll() {
    return this.githubService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.githubService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGithubDto: UpdateGithubDto) {
    return this.githubService.update(+id, updateGithubDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.githubService.remove(+id);
  }
}
