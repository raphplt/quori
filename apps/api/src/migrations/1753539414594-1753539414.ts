import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration17535394141753539414594 implements MigrationInterface {
  name = '17535394141753539414594';

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
