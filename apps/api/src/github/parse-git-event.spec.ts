import { parseGitEvent } from './parse-git-event';
import { describe, it, expect } from 'vitest';

const repo = { owner: { login: 'test' }, name: 'repo', full_name: 'test/repo' };

describe('parseGitEvent', () => {
  it('handles push with single commit', async () => {
    const commit = {
      message: 'feat: add file\n\nlong',
      timestamp: '2024-01-01T00:00:00Z',
      added: ['a.txt'],
      modified: [],
      removed: [],
      stats: [
        { filename: 'a.txt', additions: 1, deletions: 0, changes: 1 },
      ],
    };
    const payload = {
      repository: repo,
      after: 'abc',
      head_commit: commit,
      commits: [commit],
    };
    const res = await parseGitEvent(payload, 'push');
    expect(res.title).toBe('feat: add file');
    expect(res.desc).toBe('feat: add file\n\nlong');
    expect(res.filesChanged).toEqual(['a.txt']);
    expect(res.diffStats).toEqual([{ additions: 1, deletions: 0, changes: 1 }]);
    expect(res.repoFullName).toBe('test/repo');
    expect(res.commitCount).toBe(1);
    expect(res.timestamp).toBe('2024-01-01T00:00:00Z');
  });

  it('handles push with multiple commits', async () => {
    const commits = [
      {
        message: 'c1',
        timestamp: '2024-01-01T00:00:00Z',
        added: ['fileA.txt'],
        modified: [],
        removed: [],
        stats: [
          { filename: 'fileA.txt', additions: 1, deletions: 0, changes: 1 },
        ],
      },
      {
        message: 'c2',
        timestamp: '2024-01-02T00:00:00Z',
        added: ['fileB.txt'],
        modified: [],
        removed: [],
        stats: [
          { filename: 'fileB.txt', additions: 2, deletions: 1, changes: 3 },
        ],
      },
      {
        message: 'c3',
        timestamp: '2024-01-03T00:00:00Z',
        added: [],
        modified: ['fileA.txt'],
        removed: [],
        stats: [
          { filename: 'fileA.txt', additions: 1, deletions: 1, changes: 2 },
          { filename: 'fileC.txt', additions: 5, deletions: 0, changes: 5 },
        ],
      },
    ];
    const payload = {
      repository: repo,
      after: 'def',
      commits,
      head_commit: commits[2],
    };
    const res = await parseGitEvent(payload, 'push');
    expect(res.title).toBe('c3');
    expect(res.desc).toBe('c1\nc2\nc3');
    expect(res.filesChanged).toEqual(['fileA.txt', 'fileB.txt', 'fileC.txt']);
    expect(res.diffStats).toEqual([
      { additions: 2, deletions: 1, changes: 3 },
      { additions: 2, deletions: 1, changes: 3 },
      { additions: 5, deletions: 0, changes: 5 },
    ]);
    expect(res.commitCount).toBe(3);
    expect(res.timestamp).toBe('2024-01-03T00:00:00Z');
  });

  it('handles pull request payload', async () => {
    const payload = {
      repository: repo,
      pull_request: {
        number: 1,
        title: 'Update',
        body: 'desc',
        files: [
          { filename: 'file1.ts', additions: 4, deletions: 1, changes: 5 },
        ],
        updated_at: '2024-05-01T00:00:00Z',
      },
    };
    const res = await parseGitEvent(payload, 'pull_request');
    expect(res.title).toBe('Update');
    expect(res.desc).toBe('desc');
    expect(res.filesChanged).toEqual(['file1.ts']);
    expect(res.diffStats).toEqual([
      { additions: 4, deletions: 1, changes: 5 },
    ]);
    expect(res.repoFullName).toBe('test/repo');
    expect(res.commitCount).toBe(0);
    expect(res.timestamp).toBe('2024-05-01T00:00:00Z');
  });

  it('throws on malformed push payload', async () => {
    await expect(parseGitEvent({ repository: repo }, 'push')).rejects.toThrow(
      'Invalid push payload',
    );
  });
});
