import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Octokit } from '@octokit/rest';
import { parseGitEvent } from './parse-git-event';

describe('parseGitEvent', () => {
  let mockOctokit: Partial<Octokit>;

  beforeEach(() => {
    mockOctokit = {
      rest: {
        repos: {
          compareCommits: vi.fn(),
        },
        pulls: {
          listFiles: vi.fn(),
        },
      },
      paginate: vi.fn(),
    } as any;
  });

  describe('Push events', () => {
    it('should parse a single commit push with stats in commit', async () => {
      const payload = {
        repository: {
          full_name: 'owner/repo',
        },
        after: 'abc123',
        head_commit: {
          message: 'Add new feature\n\nThis is a detailed description',
          timestamp: '2023-01-01T00:00:00Z',
          added: ['src/feature.ts'],
          modified: ['README.md'],
          removed: [],
        },
        commits: [
          {
            message: 'Add new feature',
            added: ['src/feature.ts'],
            modified: ['README.md'],
            removed: [],
            stats: [
              {
                filename: 'src/feature.ts',
                additions: 50,
                deletions: 0,
                changes: 50,
              },
              {
                filename: 'README.md',
                additions: 5,
                deletions: 2,
                changes: 7,
              },
            ],
          },
        ],
      };

      const result = await parseGitEvent(payload, 'push');

      expect(result).toEqual({
        title: 'Add new feature',
        desc: 'Add new feature',
        filesChanged: ['src/feature.ts', 'README.md'],
        diffStats: [
          {
            filePath: 'src/feature.ts',
            additions: 50,
            deletions: 0,
            changes: 50,
          },
          {
            filePath: 'README.md',
            additions: 5,
            deletions: 2,
            changes: 7,
          },
        ],
        repoFullName: 'owner/repo',
        commitCount: 1,
        timestamp: '2023-01-01T00:00:00Z',
      });
    });

    it('should parse multiple commits and aggregate stats', async () => {
      const payload = {
        repository: {
          full_name: 'owner/repo',
        },
        after: 'def456',
        head_commit: {
          message: 'Third commit\n\nFinal changes',
          timestamp: '2023-01-03T00:00:00Z',
          added: [],
          modified: ['src/feature.ts'],
          removed: [],
        },
        commits: [
          {
            message: 'First commit',
            added: ['src/feature.ts'],
            modified: [],
            removed: [],
            stats: [
              {
                filename: 'src/feature.ts',
                additions: 30,
                deletions: 0,
                changes: 30,
              },
            ],
          },
          {
            message: 'Second commit',
            added: ['test/feature.spec.ts'],
            modified: ['src/feature.ts'],
            removed: [],
            stats: [
              {
                filename: 'src/feature.ts',
                additions: 20,
                deletions: 5,
                changes: 25,
              },
              {
                filename: 'test/feature.spec.ts',
                additions: 40,
                deletions: 0,
                changes: 40,
              },
            ],
          },
          {
            message: 'Third commit',
            added: [],
            modified: ['src/feature.ts'],
            removed: [],
            stats: [
              {
                filename: 'src/feature.ts',
                additions: 10,
                deletions: 3,
                changes: 13,
              },
            ],
          },
        ],
      };

      const result = await parseGitEvent(payload, 'push');

      expect(result).toEqual({
        title: 'Third commit',
        desc: 'First commit\n\nSecond commit\n\nThird commit',
        filesChanged: ['src/feature.ts', 'test/feature.spec.ts'],
        diffStats: [
          {
            filePath: 'src/feature.ts',
            additions: 60, // 30 + 20 + 10
            deletions: 8, // 0 + 5 + 3
            changes: 68, // 30 + 25 + 13
          },
          {
            filePath: 'test/feature.spec.ts',
            additions: 40,
            deletions: 0,
            changes: 40,
          },
        ],
        repoFullName: 'owner/repo',
        commitCount: 3,
        timestamp: '2023-01-03T00:00:00Z',
      });
    });

    it('should use GitHub Compare API when commit stats are missing', async () => {
      const payload = {
        repository: {
          full_name: 'owner/repo',
        },
        after: 'ghi789',
        head_commit: {
          message: 'Commit without stats',
          timestamp: '2023-01-01T00:00:00Z',
          added: ['src/new-file.ts'],
          modified: [],
          removed: [],
        },
        commits: [
          {
            message: 'Commit without stats',
            added: ['src/new-file.ts'],
            modified: [],
            removed: [],
            // No stats property
          },
        ],
        compare: 'https://github.com/owner/repo/compare/old123...ghi789',
      };

      const mockCompareResponse = {
        data: {
          files: [
            {
              filename: 'src/new-file.ts',
              additions: 100,
              deletions: 0,
              changes: 100,
            },
          ],
        },
      };

      (mockOctokit.rest!.repos!.compareCommits as any).mockResolvedValue(
        mockCompareResponse,
      );

      const result = await parseGitEvent(
        payload,
        'push',
        mockOctokit as Octokit,
      );

      expect(mockOctokit.rest!.repos!.compareCommits).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        base: 'old123',
        head: 'ghi789',
      });

      expect(result.diffStats).toEqual([
        {
          filePath: 'src/new-file.ts',
          additions: 100,
          deletions: 0,
          changes: 100,
        },
      ]);
    });

    it('should handle commit stats as object format', async () => {
      const payload = {
        repository: {
          full_name: 'owner/repo',
        },
        after: 'jkl012',
        head_commit: {
          message: 'Commit with object stats',
          timestamp: '2023-01-01T00:00:00Z',
          added: ['file1.ts'],
          modified: ['file2.ts'],
          removed: [],
        },
        commits: [
          {
            message: 'Commit with object stats',
            added: ['file1.ts'],
            modified: ['file2.ts'],
            removed: [],
            stats: {
              'file1.ts': {
                additions: 25,
                deletions: 0,
                changes: 25,
              },
              'file2.ts': {
                additions: 10,
                deletions: 5,
                changes: 15,
              },
            },
          },
        ],
      };

      const result = await parseGitEvent(payload, 'push');

      expect(result.diffStats).toEqual([
        {
          filePath: 'file1.ts',
          additions: 25,
          deletions: 0,
          changes: 25,
        },
        {
          filePath: 'file2.ts',
          additions: 10,
          deletions: 5,
          changes: 15,
        },
      ]);
    });

    it('should throw error when push payload is invalid', async () => {
      const invalidPayload = {
        // Missing repository
        after: 'abc123',
      };

      await expect(parseGitEvent(invalidPayload, 'push')).rejects.toThrow(
        'Invalid push payload: missing repository, commit ID, or head commit',
      );
    });

    it('should throw error when compare URL is invalid', async () => {
      const payload = {
        repository: {
          full_name: 'owner/repo',
        },
        after: 'abc123',
        head_commit: {
          message: 'Test commit',
          timestamp: '2023-01-01T00:00:00Z',
          added: ['file.ts'],
          modified: [],
          removed: [],
        },
        commits: [
          {
            message: 'Test commit',
            added: ['file.ts'],
            modified: [],
            removed: [],
            // No stats
          },
        ],
        compare: 'invalid-url-format',
      };

      await expect(
        parseGitEvent(payload, 'push', mockOctokit as Octokit),
      ).rejects.toThrow('Invalid compare URL format: invalid-url-format');
    });

    it('should throw error when GitHub Compare API fails', async () => {
      const payload = {
        repository: {
          full_name: 'owner/repo',
        },
        after: 'abc123',
        head_commit: {
          message: 'Test commit',
          timestamp: '2023-01-01T00:00:00Z',
          added: ['file.ts'],
          modified: [],
          removed: [],
        },
        commits: [
          {
            message: 'Test commit',
            added: ['file.ts'],
            modified: [],
            removed: [],
            // No stats
          },
        ],
        compare: 'https://github.com/owner/repo/compare/old123...abc123',
      };

      (mockOctokit.rest!.repos!.compareCommits as any).mockRejectedValue(
        new Error('API rate limit exceeded'),
      );

      await expect(
        parseGitEvent(payload, 'push', mockOctokit as Octokit),
      ).rejects.toThrow(
        'Failed to fetch diff stats from GitHub Compare API: API rate limit exceeded',
      );
    });

    it('should throw error when no file changes can be determined', async () => {
      const payload = {
        repository: {
          full_name: 'owner/repo',
        },
        after: 'abc123',
        head_commit: {
          message: 'Empty commit',
          timestamp: '2023-01-01T00:00:00Z',
          added: [],
          modified: [],
          removed: [],
        },
        commits: [
          {
            message: 'Empty commit',
            added: [],
            modified: [],
            removed: [],
            // No stats
          },
        ],
        // No compare URL
      };

      await expect(parseGitEvent(payload, 'push')).rejects.toThrow(
        'No file changes or diff stats could be determined for this push event',
      );
    });
  });

  describe('Pull Request events', () => {
    it('should parse pull request with Octokit', async () => {
      const payload = {
        repository: {
          full_name: 'owner/repo',
          owner: { login: 'owner' },
          name: 'repo',
        },
        pull_request: {
          number: 123,
          title: 'Add new feature',
          body: 'This PR adds a new feature',
          updated_at: '2023-01-01T00:00:00Z',
        },
      };

      const mockFiles = [
        {
          filename: 'src/feature.ts',
          additions: 50,
          deletions: 0,
          changes: 50,
        },
        {
          filename: 'test/feature.spec.ts',
          additions: 30,
          deletions: 0,
          changes: 30,
        },
      ];

      (mockOctokit.paginate as any).mockResolvedValue(mockFiles);

      const result = await parseGitEvent(
        payload,
        'pull_request',
        mockOctokit as Octokit,
      );

      expect(mockOctokit.paginate).toHaveBeenCalledWith(
        expect.any(Function),
        {
          owner: 'owner',
          repo: 'repo',
          pull_number: 123,
          per_page: 100,
        },
        expect.any(Function),
      );

      expect(result).toEqual({
        title: 'Add new feature',
        desc: 'This PR adds a new feature',
        filesChanged: ['src/feature.ts', 'test/feature.spec.ts'],
        diffStats: [
          {
            filePath: 'src/feature.ts',
            additions: 50,
            deletions: 0,
            changes: 50,
          },
          {
            filePath: 'test/feature.spec.ts',
            additions: 30,
            deletions: 0,
            changes: 30,
          },
        ],
        repoFullName: 'owner/repo',
        commitCount: 0,
        timestamp: '2023-01-01T00:00:00Z',
      });
    });

    it('should parse pull request with files in payload when no Octokit', async () => {
      const payload = {
        repository: {
          full_name: 'owner/repo',
        },
        pull_request: {
          title: 'Add new feature',
          body: 'This PR adds a new feature',
          updated_at: '2023-01-01T00:00:00Z',
          files: [
            {
              filename: 'src/feature.ts',
              additions: 50,
              deletions: 0,
              changes: 50,
            },
          ],
        },
      };

      const result = await parseGitEvent(payload, 'pull_request');

      expect(result.diffStats).toEqual([
        {
          filePath: 'src/feature.ts',
          additions: 50,
          deletions: 0,
          changes: 50,
        },
      ]);
    });

    it('should throw error when pull request payload is invalid', async () => {
      const invalidPayload = {
        // Missing repository or pull_request
      };

      await expect(
        parseGitEvent(invalidPayload, 'pull_request'),
      ).rejects.toThrow(
        'Invalid pull_request payload: missing repository or pull_request data',
      );
    });

    it('should throw error when Octokit API fails for pull request', async () => {
      const payload = {
        repository: {
          full_name: 'owner/repo',
          owner: { login: 'owner' },
          name: 'repo',
        },
        pull_request: {
          number: 123,
          title: 'Add new feature',
          body: 'This PR adds a new feature',
          updated_at: '2023-01-01T00:00:00Z',
        },
      };

      (mockOctokit.paginate as any).mockRejectedValue(new Error('API error'));

      await expect(
        parseGitEvent(payload, 'pull_request', mockOctokit as Octokit),
      ).rejects.toThrow('Failed to fetch pull request files: API error');
    });

    it('should throw error when no Octokit and no files in payload', async () => {
      const payload = {
        repository: {
          full_name: 'owner/repo',
        },
        pull_request: {
          title: 'Add new feature',
          body: 'This PR adds a new feature',
          updated_at: '2023-01-01T00:00:00Z',
          // No files property
        },
      };

      await expect(parseGitEvent(payload, 'pull_request')).rejects.toThrow(
        'No Octokit instance provided and no files data in pull request payload',
      );
    });
  });

  describe('Unsupported events', () => {
    it('should throw error for unsupported event types', async () => {
      const payload = {};

      await expect(parseGitEvent(payload, 'unsupported_event')).rejects.toThrow(
        'Unsupported event type: unsupported_event',
      );
    });
  });
});
