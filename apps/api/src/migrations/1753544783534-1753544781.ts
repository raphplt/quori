import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration17535447811753544783534 implements MigrationInterface {
  name = '17535447811753544783534';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "linkedin_access_token" text
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "linkedin_access_token"
        `);
  }
}
