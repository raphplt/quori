import { Octokit } from '@octokit/rest';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
  .option('token', { type: 'string', demandOption: true })
  .option('installation', { type: 'number', demandOption: true })
  .parseSync();

async function main() {
  const octokit = new Octokit({ auth: argv.token });
  const { data } = await octokit.request('GET /user/repos', {
    per_page: 100,
  });
  for (const repo of data) {
    try {
      await octokit.request(
        'PUT /user/installations/{installation_id}/repositories/{repository_id}',
        {
          installation_id: argv.installation,
          repository_id: repo.id,
        },
      );
      console.log(`Added ${repo.full_name}`);
    } catch (e) {
      console.error(`Failed ${repo.full_name}`, e);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
