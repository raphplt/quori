import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateScheduledPosts1710010000000 implements MigrationInterface {
    name = 'CreateScheduledPosts1710010000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE TYPE "public"."scheduled_posts_status_enum" AS ENUM('pending','scheduled','running','done','failed','canceled')`);
        await queryRunner.query(`CREATE TABLE "scheduled_posts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" text NOT NULL, "post_id" bigint NOT NULL, "scheduled_at" TIMESTAMP WITH TIME ZONE NOT NULL, "status" "public"."scheduled_posts_status_enum" NOT NULL DEFAULT 'scheduled', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_scheduled_posts_id" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "scheduled_posts"`);
        await queryRunner.query(`DROP TYPE "public"."scheduled_posts_status_enum"`);
    }
}
