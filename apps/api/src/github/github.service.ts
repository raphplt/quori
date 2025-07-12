import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { GitHubRepository } from './interfaces/github-repository.interface';
import { GitHubRepositoriesPage } from './interfaces/github-repositories-page.interface';

interface RepositoryFilters {
  search?: string;
  language?: string;
  visibility?: 'all' | 'public' | 'private';
  sort?: 'name' | 'stars' | 'forks' | 'updated' | 'created';
  direction?: 'asc' | 'desc';
}

interface CachedUserRepositories {
  repositories: GitHubRepository[];
  lastFetch: number;
  languages: string[];
}

@Injectable()
export class GithubService {
  private readonly GITHUB_API_BASE = 'https://api.github.com';
  private readonly CACHE_TTL = 5 * 60 * 1000;
  private repositoriesCache = new Map<string, CachedUserRepositories>();

  async getUserRepositories(
    accessToken: string,
    page = 1,
    perPage = 100,
    sort: 'name' | 'stars' | 'forks' | 'updated' | 'created' = 'updated',
    direction: 'asc' | 'desc' = 'desc',
    search?: string,
    language?: string,
    visibility: 'all' | 'public' | 'private' = 'all',
  ): Promise<GitHubRepositoriesPage> {
    try {
      // Récupérer tous les repositories (avec cache)
      const allRepositories = await this.getAllUserRepositories(accessToken);

      // Appliquer les filtres
      const filteredRepos = this.applyFilters(allRepositories.repositories, {
        search,
        language,
        visibility,
        sort,
        direction,
      });

      // Calculer la pagination
      const totalCount = filteredRepos.length;
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedRepos = filteredRepos.slice(startIndex, endIndex);

      return {
        repositories: paginatedRepos,
        totalCount,
        availableLanguages: allRepositories.languages,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch repositories from GitHub',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserRepositoriesLength(accessToken: string): Promise<number> {
    const allRepositories = await this.getAllUserRepositories(accessToken);
    return allRepositories.repositories.length;
  }

  private async getAllUserRepositories(
    accessToken: string,
  ): Promise<CachedUserRepositories> {
    const cacheKey = this.getCacheKey(accessToken);
    const cached = this.repositoriesCache.get(cacheKey);

    // Vérifier si le cache est valide
    if (cached && Date.now() - cached.lastFetch < this.CACHE_TTL) {
      return cached;
    }

    // Récupérer tous les repositories depuis GitHub
    const allRepositories: GitHubRepository[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.fetchRepositoriesPage(accessToken, page, 100);
      allRepositories.push(...response.repositories);

      // GitHub retourne moins que perPage si c'est la dernière page
      hasMore = response.repositories.length === 100;
      page++;
    }

    // Extraire les langages uniques
    const languages = [
      ...new Set(
        allRepositories
          .map((repo) => repo.language)
          .filter((lang): lang is string => lang !== null),
      ),
    ].sort();

    const cachedData: CachedUserRepositories = {
      repositories: allRepositories,
      lastFetch: Date.now(),
      languages,
    };

    this.repositoriesCache.set(cacheKey, cachedData);
    return cachedData;
  }

  private async fetchRepositoriesPage(
    accessToken: string,
    page: number,
    perPage: number,
  ): Promise<{ repositories: GitHubRepository[] }> {
    const url = new URL(`${this.GITHUB_API_BASE}/user/repos`);
    url.searchParams.set('page', String(page));
    url.searchParams.set('per_page', String(perPage));
    url.searchParams.set('sort', 'updated');
    url.searchParams.set('direction', 'desc');
    url.searchParams.set('type', 'all');

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
    return { repositories };
  }

  private applyFilters(
    repositories: GitHubRepository[],
    filters: RepositoryFilters,
  ): GitHubRepository[] {
    let filtered = repositories;

    // Filtrage par recherche textuelle
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (repo) =>
          repo.name.toLowerCase().includes(searchLower) ||
          (repo.description?.toLowerCase().includes(searchLower) ?? false),
      );
    }

    // Filtrage par langage
    if (filters.language && filters.language !== 'all') {
      filtered = filtered.filter((repo) => repo.language === filters.language);
    }

    // Filtrage par visibilité
    if (filters.visibility && filters.visibility !== 'all') {
      filtered = filtered.filter((repo) =>
        filters.visibility === 'private' ? repo.private : !repo.private,
      );
    }

    // Tri
    if (filters.sort) {
      filtered.sort((a, b) => {
        let comparison = 0;

        switch (filters.sort) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'stars':
            comparison = a.stargazers_count - b.stargazers_count;
            break;
          case 'forks':
            comparison = a.forks_count - b.forks_count;
            break;
          case 'updated':
            comparison =
              new Date(a.updated_at).getTime() -
              new Date(b.updated_at).getTime();
            break;
          case 'created':
            comparison =
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime();
            break;
        }

        return filters.direction === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }

  private getCacheKey(accessToken: string): string {
    // Utiliser un hash simple du token pour la clé de cache
    return Buffer.from(accessToken).toString('base64').slice(0, 16);
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

  /**
   * Vider le cache des repositories pour un utilisateur
   */
  clearUserCache(accessToken: string): void {
    const cacheKey = this.getCacheKey(accessToken);
    this.repositoriesCache.delete(cacheKey);
  }
}
