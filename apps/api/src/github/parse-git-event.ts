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
  repoFullName: string;
  commitCount: number;
  timestamp: string;
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
  let repoFullName = '';
  let commitCount = 0;
  let timestamp = '';

  if (event === 'push') {
    const repo = payload.repository;
    const commitId = payload.after;
    const commits: any[] = payload.commits ?? [];
    const head = payload.head_commit ?? commits[commits.length - 1];
    if (!repo || !commitId || !head) {
      throw new Error('Invalid push payload');
    }
    repoFullName = repo.full_name ?? '';
    commitCount = commits.length;
    timestamp = head.timestamp ?? '';

    title = head.message?.split('\n')[0] || `Commit ${commitId}`;
    desc = commits.length > 0 ? commits.map(c => c.message).join('\n') : head.message || '';

    const fileMap = new Map<string, { additions: number; deletions: number; changes: number }>();

    for (const commit of commits.length ? commits : [head]) {
      for (const name of [...(commit.added || []), ...(commit.modified || []), ...(commit.removed || [])]) {
        if (!fileMap.has(name)) {
          fileMap.set(name, { additions: 0, deletions: 0, changes: 0 });
        }
      }

      if (commit.stats) {
        if (Array.isArray(commit.stats)) {
          for (const fs of commit.stats) {
            const current = fileMap.get(fs.filename) ?? { additions: 0, deletions: 0, changes: 0 };
            current.additions += fs.additions ?? 0;
            current.deletions += fs.deletions ?? 0;
            current.changes += fs.changes ?? ((fs.additions ?? 0) + (fs.deletions ?? 0));
            fileMap.set(fs.filename, current);
          }
        } else {
          for (const [fname, fs] of Object.entries(commit.stats)) {
            const fileStat = fileMap.get(fname) ?? { additions: 0, deletions: 0, changes: 0 };
            const adds = (fs as any).additions ?? 0;
            const dels = (fs as any).deletions ?? 0;
            const chgs = (fs as any).changes ?? adds + dels;
            fileStat.additions += adds;
            fileStat.deletions += dels;
            fileStat.changes += chgs;
            fileMap.set(fname, fileStat);
          }
        }
      }
    }

    filesChanged = Array.from(fileMap.keys());
    if (filesChanged.length) {
      diffStats.push(...filesChanged.map(f => fileMap.get(f)!));
    }

    // fallback to GitHub compare API if we have no stats
    if (!diffStats.length && octokit && payload.compare) {
      try {
        const compareMatch = payload.compare.match(/repos\/([^/]+)\/([^/]+)\/compare\/(.+)\.\.\.(.+)$/);
        if (compareMatch) {
          const [, owner, repoName, base, headSha] = compareMatch;
          const { data } = await octokit.rest.repos.compareCommits({
            owner,
            repo: repoName,
            base,
            head: headSha,
          });
          filesChanged = data.files?.map(f => f.filename) ?? filesChanged;
          diffStats.push(
            ...(data.files ?? []).map(f => ({
              additions: f.additions ?? 0,
              deletions: f.deletions ?? 0,
              changes: f.changes ?? 0,
            })),
          );
        }
      } catch {
        // ignored, keep whatever we have
      }
    }

    if (!filesChanged.length) {
      filesChanged = [
        ...(head.added || []),
        ...(head.modified || []),
        ...(head.removed || []),
      ];
    }
    if (!diffStats.length) {
      diffStats.push(...filesChanged.map(() => ({ additions: 0, deletions: 0, changes: 0 })));
    }
  } else if (event === 'pull_request') {
    const repo = payload.repository;
    const pr = payload.pull_request;
    if (!repo || !pr) {
      throw new Error('Invalid pull_request payload');
    }
    repoFullName = repo.full_name ?? '';
    title = pr.title;
    desc = pr.body || '';
    timestamp = pr.updated_at ?? '';
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
      if (pr.files) {
        diffStats.push(
          ...pr.files.map((f: any) => ({
            additions: f.additions ?? 0,
            deletions: f.deletions ?? 0,
            changes: f.changes ?? ((f.additions ?? 0) + (f.deletions ?? 0)),
          })),
        );
      } else {
        diffStats.push(...filesChanged.map(() => ({ additions: 0, deletions: 0, changes: 0 })));
      }
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
    repoFullName,
    commitCount,
    timestamp,
  };
}
