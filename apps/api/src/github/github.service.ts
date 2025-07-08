import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { GitHubRepository } from './interfaces/github-repository.interface';
import { GitHubRepositoriesPage } from './interfaces/github-repositories-page.interface';

@Injectable()
export class GithubService {
  private readonly GITHUB_API_BASE = 'https://api.github.com';

  async getUserRepositories(
    accessToken: string,
    page = 1,
    perPage = 30,
  ): Promise<GitHubRepositoriesPage> {
    try {
      const url = new URL(`${this.GITHUB_API_BASE}/user/repos`);
      url.searchParams.set('page', String(page));
      url.searchParams.set('per_page', String(perPage));
      const response = await fetch(url, {
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

      const repositories = (await response.json()) as GitHubRepository[];
      const link = response.headers.get('link');
      let totalCount = (page - 1) * perPage + repositories.length;
      if (link && /rel="last"/.test(link)) {
        const match = link.match(/page=(\d+)>; rel="last"/);
        if (match) {
          const lastPage = parseInt(match[1], 10);
          totalCount = lastPage * perPage;
        }
      }
      return { repositories, totalCount };
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
}
