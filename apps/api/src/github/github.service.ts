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

  async getRepositoryDetails(
    accessToken: string,
    owner: string,
    repo: string,
  ): Promise<any> {
    try {
      // Récupérer les détails du repository
      const repository = await this.getRepository(accessToken, owner, repo);

      // Récupérer les languages du repository
      const languagesResponse = await fetch(
        `${this.GITHUB_API_BASE}/repos/${owner}/${repo}/languages`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'Quori-App',
          },
        },
      );
      const languages = languagesResponse.ok
        ? await languagesResponse.json()
        : {};

      // Récupérer les contributeurs
      const contributorsResponse = await fetch(
        `${this.GITHUB_API_BASE}/repos/${owner}/${repo}/contributors?per_page=10`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'Quori-App',
          },
        },
      );
      const contributors = contributorsResponse.ok
        ? await contributorsResponse.json()
        : [];

      // Récupérer les derniers commits
      const commitsResponse = await fetch(
        `${this.GITHUB_API_BASE}/repos/${owner}/${repo}/commits?per_page=10`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'Quori-App',
          },
        },
      );
      const commits = commitsResponse.ok ? await commitsResponse.json() : [];

      // Récupérer les releases
      const releasesResponse = await fetch(
        `${this.GITHUB_API_BASE}/repos/${owner}/${repo}/releases?per_page=5`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'Quori-App',
          },
        },
      );
      const releases = releasesResponse.ok ? await releasesResponse.json() : [];

      // Récupérer les issues ouvertes
      const issuesResponse = await fetch(
        `${this.GITHUB_API_BASE}/repos/${owner}/${repo}/issues?state=open&per_page=10`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'Quori-App',
          },
        },
      );
      const issues = issuesResponse.ok ? await issuesResponse.json() : [];

      // Récupérer les pull requests ouvertes
      const pullRequestsResponse = await fetch(
        `${this.GITHUB_API_BASE}/repos/${owner}/${repo}/pulls?state=open&per_page=10`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'Quori-App',
          },
        },
      );
      const pullRequests = pullRequestsResponse.ok
        ? await pullRequestsResponse.json()
        : [];

      // Récupérer les branches
      const branchesResponse = await fetch(
        `${this.GITHUB_API_BASE}/repos/${owner}/${repo}/branches?per_page=10`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'Quori-App',
          },
        },
      );
      const branches = branchesResponse.ok ? await branchesResponse.json() : [];

      return {
        repository: {
          id: repository.id,
          name: repository.name,
          full_name: repository.full_name,
          description: repository.description,
          private: repository.private,
          html_url: repository.html_url,
          clone_url: repository.clone_url,
          ssh_url: repository.ssh_url,
          language: repository.language,
          stargazers_count: repository.stargazers_count,
          forks_count: repository.forks_count,
          open_issues_count: repository.open_issues_count,
          watchers_count: repository.watchers_count,
          size: repository.size,
          default_branch: repository.default_branch,
          created_at: repository.created_at,
          updated_at: repository.updated_at,
          pushed_at: repository.pushed_at,
          topics: repository.topics || [],
          license: repository.license,
          owner: {
            login: repository.owner.login,
            avatar_url: repository.owner.avatar_url,
            html_url: repository.owner.html_url,
          },
        },
        languages,
        contributors: contributors.map((contributor: any) => ({
          login: contributor.login,
          avatar_url: contributor.avatar_url,
          html_url: contributor.html_url,
          contributions: contributor.contributions,
        })),
        recentCommits: commits.map((commit: any) => ({
          sha: commit.sha,
          message: commit.commit.message,
          author: commit.commit.author,
          date: commit.commit.author?.date,
          html_url: commit.html_url,
        })),
        releases: releases.map((release: any) => ({
          id: release.id,
          tag_name: release.tag_name,
          name: release.name,
          body: release.body,
          published_at: release.published_at,
          html_url: release.html_url,
        })),
        openIssues: issues
          .filter((issue: any) => !issue.pull_request)
          .map((issue: any) => ({
            id: issue.id,
            number: issue.number,
            title: issue.title,
            state: issue.state,
            created_at: issue.created_at,
            html_url: issue.html_url,
            user: issue.user
              ? {
                  login: issue.user.login,
                  avatar_url: issue.user.avatar_url,
                }
              : null,
          })),
        openPullRequests: pullRequests.map((pr: any) => ({
          id: pr.id,
          number: pr.number,
          title: pr.title,
          state: pr.state,
          created_at: pr.created_at,
          html_url: pr.html_url,
          user: pr.user
            ? {
                login: pr.user.login,
                avatar_url: pr.user.avatar_url,
              }
            : null,
        })),
        branches: branches.map((branch: any) => ({
          name: branch.name,
          commit: {
            sha: branch.commit.sha,
          },
          protected: branch.protected,
        })),
      };
    } catch (error) {
      console.error(
        `Failed to get repository details for ${owner}/${repo}:`,
        error,
      );
      throw new HttpException(
        'Failed to fetch repository details from GitHub',
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
