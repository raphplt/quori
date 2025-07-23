import { dataSource } from '../data-source';

async function main() {
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
