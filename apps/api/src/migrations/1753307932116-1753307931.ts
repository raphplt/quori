import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration17533079311753307932116 implements MigrationInterface {
  name = '17533079311753307932116';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) Crée la colonne onboarding_status_id si elle n'existe pas
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "onboarding_status_id" uuid
    `);

    // 2) Crée la table onboarding_status
    await queryRunner.query(`
      CREATE TABLE "onboarding_status" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "step" integer NOT NULL DEFAULT '0',
        "finished" boolean NOT NULL DEFAULT false,
        "startedAt" TIMESTAMP WITH TIME ZONE,
        "completedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_7acdd37ea8d80e587163288ae8b" PRIMARY KEY ("id")
      )
    `);

    // 3) Met à NULL les onboarding_status_id orphelins
    await queryRunner.query(`
      UPDATE "users"
      SET "onboarding_status_id" = NULL
      WHERE "onboarding_status_id" IS NOT NULL
        AND "onboarding_status_id" NOT IN (SELECT "id" FROM "onboarding_status")
    `);

    // 4) Ajoute la contrainte de clé étrangère
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD CONSTRAINT "FK_a02c3217502f8281954ea4e44aa"
        FOREIGN KEY ("onboarding_status_id")
        REFERENCES "onboarding_status"("id")
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1) Supprime la contrainte FK
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP CONSTRAINT "FK_a02c3217502f8281954ea4e44aa"
    `);

    // 2) Supprime la table onboarding_status
    await queryRunner.query(`
      DROP TABLE "onboarding_status"
    `);

    // 3) (Optionnel) Supprime la colonne si besoin
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "onboarding_status_id"
    `);
  }
}
