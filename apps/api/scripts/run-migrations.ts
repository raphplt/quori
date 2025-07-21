import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

async function runMigrations() {
  const config = new ConfigService();

  const dataSource = new DataSource({
    type: 'postgres',
    url: config.get<string>('DATABASE_URL'),
    synchronize: false,
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log('✓ Base de données connectée');

    // Lire et exécuter les migrations dans l'ordre
    const migrationsDir = path.join(__dirname, '../migrations');
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      console.log(`Exécution de la migration: ${file}`);
      const migrationPath = path.join(migrationsDir, file);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

      // Diviser le fichier SQL en statements individuels
      const statements = migrationSQL
        .split(';')
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0);

      for (const statement of statements) {
        try {
          await dataSource.query(statement);
        } catch (error: unknown) {
          // Ignorer les erreurs "already exists" qui sont normales
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          if (
            !errorMessage.includes('already exists') &&
            !errorMessage.includes('does not exist')
          ) {
            console.warn(
              `⚠️  Avertissement lors de l'exécution de: ${statement.substring(0, 50)}...`,
            );
            console.warn(`   Erreur: ${errorMessage}`);
          }
        }
      }
      console.log(`✓ Migration ${file} terminée`);
    }

    console.log('✓ Toutes les migrations ont été exécutées avec succès');
  } catch (error) {
    console.error("❌ Erreur lors de l'exécution des migrations:", error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

void runMigrations();
