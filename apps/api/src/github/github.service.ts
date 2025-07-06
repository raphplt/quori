import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { GitHubRepository } from './interfaces/github-repository.interface';

@Injectable()
export class GithubService {
  private readonly GITHUB_API_BASE = 'https://api.github.com';

  async getUserRepositories(accessToken: string): Promise<GitHubRepository[]> {
    try {
      const response = await fetch(`${this.GITHUB_API_BASE}/user/repos`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Quori-App',
        },
      });

      if (!response.ok) {
        throw new HttpException(
          `GitHub API error: ${response.status}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      return (await response.json()) as GitHubRepository[];
    } catch {
      throw new HttpException(
        'Failed to fetch repositories from GitHub',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getRepository(
    accessToken: string,
    owner: string,
    repo: string,
  ): Promise<GitHubRepository> {
    try {
      const response = await fetch(
        `${this.GITHUB_API_BASE}/repos/${owner}/${repo}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'Quori-App',
          },
        },
      );

      if (!response.ok) {
        throw new HttpException(
          `GitHub API error: ${response.status}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      return (await response.json()) as GitHubRepository;
    } catch {
      throw new HttpException(
        'Failed to fetch repository from GitHub',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  create() {
    return 'This action adds a new github';
  }

  findAll() {
    return `This action returns all github`;
  }

  findOne(id: number) {
    return `This action returns a #${id} github`;
  }

  update(id: number) {
    return `This action updates a #${id} github`;
  }

  remove(id: number) {
    return `This action removes a #${id} github`;
  }
}
