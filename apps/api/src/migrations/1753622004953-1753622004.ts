import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLinkedinID1753622004953 implements MigrationInterface {
  name = 'AddLinkedinID1753622004953';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "linkedIn_id" text
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "linkedIn_id"
        `);
  }
}
