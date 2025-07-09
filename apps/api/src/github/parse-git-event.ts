import { Octokit } from '@octokit/rest';

export interface ParsedGitEvent {
  title: string;
  desc: string;
  filesChanged: string[];
  diffStats: {
    additions: number;
    deletions: number;
    total: number;
  };
}

export async function parseGitEvent(
  payload: Record<string, any>,
  event: string,
  octokit?: Octokit,
): Promise<ParsedGitEvent> {
  let title = '';
  let desc = '';
  let filesChanged: string[] = [];
  let additions = 0;
  let deletions = 0;

  if (event === 'push') {
    const repo = payload.repository;
    const commitId = payload.after;
    const head = payload.head_commit ?? payload.commits?.[payload.commits.length - 1];
    title = head?.message?.split('\n')[0] || `Commit ${commitId}`;
    desc = head?.message || '';
    if (octokit) {
      try {
        const { data } = await octokit.rest.repos.getCommit({
          owner: repo.owner.login,
          repo: repo.name,
          ref: commitId,
        });
        filesChanged = data.files?.map(f => f.filename) ?? [];
        additions = data.stats?.additions ?? 0;
        deletions = data.stats?.deletions ?? 0;
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
    }
  } else if (event === 'pull_request') {
    const repo = payload.repository;
    const pr = payload.pull_request;
    title = pr.title;
    desc = pr.body || '';
    additions = pr.additions ?? 0;
    deletions = pr.deletions ?? 0;
    if (octokit) {
      try {
        filesChanged = await octokit.paginate(
          octokit.rest.pulls.listFiles,
          {
            owner: repo.owner.login,
            repo: repo.name,
            pull_number: pr.number,
            per_page: 100,
          },
          res => res.data.map(f => f.filename),
        );
      } catch {
        filesChanged = [];
      }
    }
  }

  return {
    title,
    desc,
    filesChanged,
    diffStats: {
      additions,
      deletions,
      total: additions + deletions,
    },
  };
}
