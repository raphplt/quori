import { Octokit } from '@octokit/rest';

export interface ParsedGitEvent {
  title: string;
  desc: string;
  filesChanged: string[];
  diffStats: {
    additions: number;
    deletions: number;
    changes: number;
  }[];
}

export async function parseGitEvent(
  payload: Record<string, any>,
  event: string,
  octokit?: Octokit,
): Promise<ParsedGitEvent> {
  let title = '';
  let desc = '';
  let filesChanged: string[] = [];
  const diffStats: { additions: number; deletions: number; changes: number }[] = [];

  if (event === 'push') {
    const repo = payload.repository;
    const commitId = payload.after;
    const head = payload.head_commit ?? payload.commits?.[payload.commits.length - 1];
    if (!repo || !commitId || !head) {
      throw new Error('Invalid push payload');
    }
    title = head.message?.split('\n')[0] || `Commit ${commitId}`;
    desc = head.message || '';
    if (octokit) {
      try {
        const { data } = await octokit.rest.repos.getCommit({
          owner: repo.owner.login,
          repo: repo.name,
          ref: commitId,
        });
        filesChanged = data.files?.map(f => f.filename) ?? [];
        for (const f of data.files ?? []) {
          diffStats.push({
            additions: f.additions ?? 0,
            deletions: f.deletions ?? 0,
            changes: f.changes ?? 0,
          });
        }
      } catch {
        // fallback to payload info
        filesChanged = [
          ...(head?.added || []),
          ...(head?.modified || []),
          ...(head?.removed || []),
        ];
      }
    } else if (head) {
      filesChanged = [
        ...(head.added || []),
        ...(head.modified || []),
        ...(head.removed || []),
      ];
      diffStats.push(...filesChanged.map(() => ({ additions: 0, deletions: 0, changes: 0 })));
    }
  } else if (event === 'pull_request') {
    const repo = payload.repository;
    const pr = payload.pull_request;
    if (!repo || !pr) {
      throw new Error('Invalid pull_request payload');
    }
    title = pr.title;
    desc = pr.body || '';
    if (octokit) {
      try {
        const files = await octokit.paginate(
          octokit.rest.pulls.listFiles,
          {
            owner: repo.owner.login,
            repo: repo.name,
            pull_number: pr.number,
            per_page: 100,
          },
          res => res.data,
        );
        filesChanged = files.map(f => f.filename);
        diffStats.push(
          ...files.map(f => ({
            additions: f.additions ?? 0,
            deletions: f.deletions ?? 0,
            changes: f.changes ?? 0,
          })),
        );
      } catch {
        filesChanged = [];
      }
    } else {
      filesChanged = pr.files?.map((f: any) => f.filename) ?? [];
      diffStats.push(...filesChanged.map(() => ({ additions: 0, deletions: 0, changes: 0 })));
    }
  }
  else {
    throw new Error(`Unsupported event type: ${event}`);
  }

  return {
    title,
    desc,
    filesChanged,
    diffStats,
  };
}
