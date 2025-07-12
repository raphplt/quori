import { Octokit } from '@octokit/rest';

export interface ParsedGitEvent {
  title: string;
  desc: string;
  filesChanged: string[];
  diffStats: {
    filePath: string;
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
  if (event === 'push') {
    return parsePushEvent(payload, octokit);
  } else if (event === 'pull_request') {
    return parsePullRequestEvent(payload, octokit);
  } else {
    throw new Error(`Unsupported event type: ${event}`);
  }
}

async function parsePushEvent(
  payload: Record<string, any>,
  octokit?: Octokit,
): Promise<ParsedGitEvent> {
  // DEBUG: Log de l'objet d'entrée
  console.debug('DEBUG ▶ commits:', payload.commits);
  console.debug('DEBUG ▶ compare URL:', payload.compare);
  console.debug('DEBUG ▶ payload complet:', JSON.stringify(payload, null, 2));

  const repo = payload.repository;
  const commitId = payload.after;
  const commits: any[] = payload.commits ?? [];
  const head = payload.head_commit ?? commits[commits.length - 1];

  if (!repo || !commitId || !head) {
    throw new Error(
      'Invalid push payload: missing repository, commit ID, or head commit',
    );
  }

  const repoFullName = repo.full_name ?? '';
  const commitCount = commits.length;
  const timestamp = head.timestamp ?? '';

  // Title = message of the last commit (head_commit)
  const title = head.message?.split('\n')[0] || `Commit ${commitId}`;

  // Description = concatenation of all commit messages with double line breaks
  const desc =
    commits.length > 0
      ? commits
          .map((c: any) => c.message || '')
          .filter(Boolean)
          .join('\n\n')
      : head.message || '';

  // Aggregate file stats across all commits
  const fileStatsMap = new Map<
    string,
    {
      additions: number;
      deletions: number;
      changes: number;
    }
  >();

  let hasValidStats = false;

  // Process each commit to collect file stats
  for (const commit of commits.length ? commits : [head]) {
    console.debug(`DEBUG ▶ Processing commit ${commit.id || 'unknown'}`);
    console.debug(`DEBUG ▶ Commit stats brut:`, commit.stats);
    
    // Add all changed files to the map
    const changedFiles = [
      ...(commit.added || []),
      ...(commit.modified || []),
      ...(commit.removed || []),
    ];

    console.debug(`DEBUG ▶ Changed files for commit:`, changedFiles);

    for (const fileName of changedFiles) {
      if (!fileStatsMap.has(fileName)) {
        fileStatsMap.set(fileName, { additions: 0, deletions: 0, changes: 0 });
      }
    }

    // Process commit stats if available
    if (commit.stats) {
      hasValidStats = true;
      console.debug(`DEBUG ▶ Found stats for commit ${commit.id || 'unknown'}`);

      if (Array.isArray(commit.stats)) {
        console.debug(`DEBUG ▶ Stats is array format:`, commit.stats);
        // stats is an array of file objects
        for (const fileStat of commit.stats) {
          const fileName = fileStat.filename;
          if (!fileName) continue;

          const current = fileStatsMap.get(fileName) ?? {
            additions: 0,
            deletions: 0,
            changes: 0,
          };
          const statsToAdd = {
            additions: fileStat.additions ?? 0,
            deletions: fileStat.deletions ?? 0,
            changes: fileStat.changes ?? (fileStat.additions ?? 0) + (fileStat.deletions ?? 0)
          };
          
          console.debug(`DEBUG ▶ Adding stats for ${fileName}:`, statsToAdd);
          
          current.additions += statsToAdd.additions;
          current.deletions += statsToAdd.deletions;
          current.changes += statsToAdd.changes;
          fileStatsMap.set(fileName, current);
        }
      } else {
        console.debug(`DEBUG ▶ Stats is object format:`, commit.stats);
        // stats is an object with filename as keys
        for (const [fileName, fileStat] of Object.entries(commit.stats)) {
          const current = fileStatsMap.get(fileName) ?? {
            additions: 0,
            deletions: 0,
            changes: 0,
          };
          const fs = fileStat as any;
          const additions = fs.additions ?? 0;
          const deletions = fs.deletions ?? 0;
          const changes = fs.changes ?? additions + deletions;

          console.debug(`DEBUG ▶ Adding object stats for ${fileName}:`, { additions, deletions, changes });

          current.additions += additions;
          current.deletions += deletions;
          current.changes += changes;
          fileStatsMap.set(fileName, current);
        }
      }
    } else {
      console.debug(
        `DEBUG ▶ No stats found for commit ${commit.id || 'unknown'}`,
      );
    }
    
    console.debug(`DEBUG ▶ FileStatsMap after commit ${commit.id || 'unknown'}:`, Object.fromEntries(fileStatsMap));
  }

  console.debug(`DEBUG ▶ hasValidStats after all commits:`, hasValidStats);
  console.debug(`DEBUG ▶ Final fileStatsMap before API fallback:`, Object.fromEntries(fileStatsMap));

  // If no valid stats were found in commits, try GitHub Compare API
  if (!hasValidStats && octokit && payload.compare) {
    console.debug(`DEBUG ▶ Attempting GitHub Compare API fallback with URL:`, payload.compare);
    try {
      const compareMatch = payload.compare.match(
        /repos\/([^/]+)\/([^/]+)\/compare\/(.+)\.\.\.(.+)$/,
      );
      if (!compareMatch) {
        throw new Error(`Invalid compare URL format: ${payload.compare}`);
      }

      const [, owner, repoName, base, headSha] = compareMatch;
      console.debug(`DEBUG ▶ Compare API params:`, { owner, repoName, base, headSha });
      
      const { data } = await octokit.rest.repos.compareCommits({
        owner,
        repo: repoName,
        base,
        head: headSha,
      });

      console.debug('DEBUG ▶ Compare API response data:', data);
      console.debug('DEBUG ▶ Compare API files:', data.files);

      if (!data.files) {
        throw new Error('No files data returned from GitHub Compare API');
      }

      // Clear the map and populate with API data
      fileStatsMap.clear();
      for (const file of data.files) {
        const fileStats = {
          additions: file.additions ?? 0,
          deletions: file.deletions ?? 0,
          changes: file.changes ?? 0,
        };
        console.debug(`DEBUG ▶ Setting API stats for ${file.filename}:`, fileStats);
        fileStatsMap.set(file.filename, fileStats);
      }

      hasValidStats = true;
      console.debug(`DEBUG ▶ Successfully retrieved stats from Compare API`);
    } catch (error) {
      console.error('ERROR ▶ échec du compare API:', error);
      throw new Error(
        `Failed to fetch diff stats from GitHub Compare API: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // If still no stats, throw an error
  if (!hasValidStats && fileStatsMap.size === 0) {
    console.error('ERROR ▶ No file changes or diff stats could be determined');
    console.debug('DEBUG ▶ Final state - hasValidStats:', hasValidStats);
    console.debug('DEBUG ▶ Final state - fileStatsMap size:', fileStatsMap.size);
    throw new Error(
      'No file changes or diff stats could be determined for this push event',
    );
  }

  console.debug('DEBUG ▶ Stats agrégés avant construction finale:', Object.fromEntries(fileStatsMap));

  const filesChanged = Array.from(fileStatsMap.keys());
  const diffStats = Array.from(fileStatsMap.entries()).map(
    ([filePath, stats]) => ({
      filePath,
      ...stats,
    }),
  );

  console.debug('DEBUG ▶ diffStats final:', diffStats);
  console.debug('DEBUG ▶ filesChanged final:', filesChanged);

  const result = {
    title,
    desc,
    filesChanged,
    diffStats,
    repoFullName,
    commitCount,
    timestamp,
  };

  console.debug('DEBUG ▶ Final result object:', result);

  return result;
}

async function parsePullRequestEvent(
  payload: Record<string, any>,
  octokit?: Octokit,
): Promise<ParsedGitEvent> {
  const repo = payload.repository;
  const pr = payload.pull_request;

  if (!repo || !pr) {
    throw new Error(
      'Invalid pull_request payload: missing repository or pull_request data',
    );
  }

  const repoFullName = repo.full_name ?? '';
  const title = pr.title || 'Pull Request';
  const desc = pr.body || '';
  const timestamp = pr.updated_at ?? '';

  let filesChanged: string[] = [];
  let diffStats: {
    filePath: string;
    additions: number;
    deletions: number;
    changes: number;
  }[] = [];

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
        (res) => res.data,
      );

      filesChanged = files.map((f) => f.filename);
      diffStats = files.map((f) => ({
        filePath: f.filename,
        additions: f.additions ?? 0,
        deletions: f.deletions ?? 0,
        changes: f.changes ?? 0,
      }));
    } catch (error) {
      throw new Error(
        `Failed to fetch pull request files: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  } else {
    // Fallback to data from payload if available
    if (pr.files) {
      filesChanged = pr.files.map((f: any) => f.filename);
      diffStats = pr.files.map((f: any) => ({
        filePath: f.filename,
        additions: f.additions ?? 0,
        deletions: f.deletions ?? 0,
        changes: f.changes ?? (f.additions ?? 0) + (f.deletions ?? 0),
      }));
    } else {
      throw new Error(
        'No Octokit instance provided and no files data in pull request payload',
      );
    }
  }

  return {
    title,
    desc,
    filesChanged,
    diffStats,
    repoFullName,
    commitCount: 0, // Pull requests don't have a commit count in the same sense
    timestamp,
  };
}
