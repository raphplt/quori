import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLinkedinAccesAndID1753539414594 implements MigrationInterface {
  name = 'AddLinkedinAccessToken1753539414594';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "linkedin_access_token" text; ALTER TABLE "users" ADD "linkedin_id" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "linkedin_access_token"; ALTER TABLE "users" DROP COLUMN "linkedin_id"`,
    );
  }
}
