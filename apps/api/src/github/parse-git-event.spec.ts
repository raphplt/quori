import { parseGitEvent } from './parse-git-event';
import { describe, it, expect } from 'vitest';

const repo = { owner: { login: 'test' }, name: 'repo' };

describe('parseGitEvent', () => {
  it('handles push with single commit', async () => {
    const payload = {
      repository: repo,
      after: 'abc',
      head_commit: {
        message: 'feat: add file\n\nlong',
        added: ['a.txt'],
        modified: [],
        removed: [],
      },
    };
    const res = await parseGitEvent(payload, 'push');
    expect(res.title).toBe('feat: add file');
    expect(res.desc).toBe('feat: add file\n\nlong');
    expect(res.filesChanged).toEqual(['a.txt']);
    expect(res.diffStats).toEqual([{ additions: 0, deletions: 0, changes: 0 }]);
  });

  it('handles push with multiple commits', async () => {
    const payload = {
      repository: repo,
      after: 'def',
      commits: [
        { message: 'first', added: ['x'], modified: [], removed: [] },
        {
          message: 'second commit',
          added: ['b.txt'],
          modified: ['c.txt'],
          removed: [],
        },
      ],
    };
    const res = await parseGitEvent(payload, 'push');
    expect(res.title).toBe('second commit');
    expect(res.filesChanged).toEqual(['b.txt', 'c.txt']);
  });

  it('handles pull request payload', async () => {
    const payload = {
      repository: repo,
      pull_request: {
        number: 1,
        title: 'Update',
        body: 'desc',
        files: [{ filename: 'file1.ts' }],
      },
    };
    const res = await parseGitEvent(payload, 'pull_request');
    expect(res.title).toBe('Update');
    expect(res.desc).toBe('desc');
    expect(res.filesChanged).toEqual(['file1.ts']);
    expect(res.diffStats).toEqual([{ additions: 0, deletions: 0, changes: 0 }]);
  });

  it('throws on invalid event type', async () => {
    await expect(parseGitEvent({}, 'issue')).rejects.toThrow('Unsupported event type');
  });

  it('throws on malformed push payload', async () => {
    await expect(parseGitEvent({ repository: repo }, 'push')).rejects.toThrow('Invalid push payload');
  });
});
