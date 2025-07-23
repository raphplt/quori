import { spawnSync } from 'child_process';
import path from 'path';

const name = process.argv[2];
if (!name) {
  console.error('Usage: npm --workspace=api run generate-migration -- <Name>');
  process.exit(1);
}

const dataSource = path.join(__dirname, '../data-source.ts');
const result = spawnSync(
  'npx',
  [
    'typeorm-ts-node-commonjs',
    '-d',
    dataSource,
    'migration:generate',
    path.join('migrations', name),
  ],
  { stdio: 'inherit' },
);
process.exit(result.status === null ? 1 : result.status);
