import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

async function main() {
  const config = new ConfigService();

  const dataSource = new DataSource({
    type: 'postgres',
    url: config.get<string>('DATABASE_URL'),
    synchronize: false,
    logging: true,
    migrations: [path.join(__dirname, '../migrations/*.js')],
  });

  try {
    await dataSource.initialize();
    console.log('✓ DB connectée');

    const executed = await dataSource.runMigrations();
    console.log(`✓ ${executed.length} migration(s) exécutée(s)`);

    await dataSource.destroy();
  } catch (e) {
    console.error('❌ Erreur migrations', e);
    process.exit(1);
  }
}

void main();
