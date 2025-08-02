import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration17541714431754171443852 implements MigrationInterface {
  name = '17541714431754171443852';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "users" (
                "id" text NOT NULL,
                "github_id" text NOT NULL,
                "linkedIn_id" text,
                "linkedin_access_token" text,
                "username" text NOT NULL,
                "email" text NOT NULL,
                "avatar_url" text NOT NULL,
                "name" text NOT NULL,
                "role" text NOT NULL DEFAULT 'user',
                "github_access_token" text,
                "refresh_token" text,
                "refresh_token_expires" TIMESTAMP WITH TIME ZONE,
                "onboarding_status_id" uuid,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "REL_a02c3217502f8281954ea4e44a" UNIQUE ("onboarding_status_id"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
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
    await queryRunner.query(`
            CREATE TABLE "preferences" (
                "id" BIGSERIAL NOT NULL,
                "userId" text NOT NULL,
                "favoriteTone" character varying(32) NOT NULL,
                "customContext" text,
                "preferredLanguage" character varying(16),
                "defaultOutputs" text array,
                "hashtagPreferences" text array,
                "modelSettings" jsonb,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_17f8855e4145192bbabd91a51be" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_eb2de5fbaa61832e982f53d971" ON "preferences" ("userId")
        `);
    await queryRunner.query(`
            CREATE TABLE "installations" (
                "id" bigint NOT NULL,
                "account_login" text NOT NULL,
                "account_id" bigint NOT NULL,
                "repos" text array NOT NULL DEFAULT '{}',
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_21c7fb94d81eca7a66e64bd2b7f" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "templates" (
                "id" BIGSERIAL NOT NULL,
                "name" character varying(64) NOT NULL,
                "description" text NOT NULL,
                "promptModifier" text NOT NULL,
                "installation_id" bigint,
                CONSTRAINT "PK_515948649ce0bbbe391de702ae5" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "events" (
                "delivery_id" text NOT NULL,
                "event" text NOT NULL,
                "event_type" character varying(32) NOT NULL,
                "payload" jsonb NOT NULL,
                "repo_full_name" text NOT NULL,
                "author_login" text,
                "author_avatar_url" text,
                "metadata" jsonb,
                "received_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "status" character varying(16) NOT NULL DEFAULT 'pending',
                "processed_at" TIMESTAMP WITH TIME ZONE,
                "error_message" text,
                "retry_count" integer NOT NULL DEFAULT '0',
                "installation_id" bigint,
                CONSTRAINT "PK_6cd92f52b9e3f5d95e34717cfc3" PRIMARY KEY ("delivery_id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_670519e3f32a57a63f0d7ba7b4" ON "events" ("event")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_2411ea245f7bb91d20d940793f" ON "events" ("event_type")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_b805212dfb3ddc5e4f72a431ab" ON "events" ("repo_full_name")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_03dcebc1ab44daa177ae9479c4" ON "events" ("status")
        `);
    await queryRunner.query(`
            CREATE TABLE "posts" (
                "id" BIGSERIAL NOT NULL,
                "summary" text NOT NULL,
                "postContent" text NOT NULL,
                "rawResponse" jsonb NOT NULL,
                "status" character varying(16) NOT NULL DEFAULT 'draft',
                "status_linkedin" character varying(16) NOT NULL DEFAULT 'pending',
                "feedbackRate" character varying DEFAULT '0',
                "feedbackComment" text,
                "scheduledAt" TIMESTAMP WITH TIME ZONE,
                "externalId" text,
                "publishedAt" TIMESTAMP WITH TIME ZONE,
                "impressions" integer NOT NULL DEFAULT '0',
                "likes" integer NOT NULL DEFAULT '0',
                "comments" integer NOT NULL DEFAULT '0',
                "template" character varying(32),
                "tone" character varying(32),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "installation_id" bigint,
                "event_delivery_id" text,
                CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_a69d9e2ae78ef7d100f8317ae0" ON "posts" ("status")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."scheduled_posts_status_enum" AS ENUM(
                'pending',
                'scheduled',
                'running',
                'done',
                'failed',
                'canceled'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "scheduled_posts" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" text NOT NULL,
                "post_id" bigint NOT NULL,
                "scheduled_at" TIMESTAMP WITH TIME ZONE NOT NULL,
                "status" "public"."scheduled_posts_status_enum" NOT NULL DEFAULT 'scheduled',
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_0408d38eae4ccb97d9bbb148da1" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_a02c3217502f8281954ea4e44aa" FOREIGN KEY ("onboarding_status_id") REFERENCES "onboarding_status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "preferences"
            ADD CONSTRAINT "FK_eb2de5fbaa61832e982f53d9716" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "templates"
            ADD CONSTRAINT "FK_14f3cd77b55f8bfaa7cc25032be" FOREIGN KEY ("installation_id") REFERENCES "installations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "events"
            ADD CONSTRAINT "FK_0360c22b65ad20dfa3784845bb3" FOREIGN KEY ("installation_id") REFERENCES "installations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "posts"
            ADD CONSTRAINT "FK_3a34c5c3046b9dbc600c9505a29" FOREIGN KEY ("installation_id") REFERENCES "installations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "posts"
            ADD CONSTRAINT "FK_6f87d726b8b9a5a951554787c5d" FOREIGN KEY ("event_delivery_id") REFERENCES "events"("delivery_id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "scheduled_posts"
            ADD CONSTRAINT "FK_83cbdfc52c73171cdff3b55e090" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "scheduled_posts"
            ADD CONSTRAINT "FK_65bf627ecc4ac3effa1e745acaf" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "scheduled_posts" DROP CONSTRAINT "FK_65bf627ecc4ac3effa1e745acaf"
        `);
    await queryRunner.query(`
            ALTER TABLE "scheduled_posts" DROP CONSTRAINT "FK_83cbdfc52c73171cdff3b55e090"
        `);
    await queryRunner.query(`
            ALTER TABLE "posts" DROP CONSTRAINT "FK_6f87d726b8b9a5a951554787c5d"
        `);
    await queryRunner.query(`
            ALTER TABLE "posts" DROP CONSTRAINT "FK_3a34c5c3046b9dbc600c9505a29"
        `);
    await queryRunner.query(`
            ALTER TABLE "events" DROP CONSTRAINT "FK_0360c22b65ad20dfa3784845bb3"
        `);
    await queryRunner.query(`
            ALTER TABLE "templates" DROP CONSTRAINT "FK_14f3cd77b55f8bfaa7cc25032be"
        `);
    await queryRunner.query(`
            ALTER TABLE "preferences" DROP CONSTRAINT "FK_eb2de5fbaa61832e982f53d9716"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_a02c3217502f8281954ea4e44aa"
        `);
    await queryRunner.query(`
            DROP TABLE "scheduled_posts"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."scheduled_posts_status_enum"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_a69d9e2ae78ef7d100f8317ae0"
        `);
    await queryRunner.query(`
            DROP TABLE "posts"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_03dcebc1ab44daa177ae9479c4"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_b805212dfb3ddc5e4f72a431ab"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_2411ea245f7bb91d20d940793f"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_670519e3f32a57a63f0d7ba7b4"
        `);
    await queryRunner.query(`
            DROP TABLE "events"
        `);
    await queryRunner.query(`
            DROP TABLE "templates"
        `);
    await queryRunner.query(`
            DROP TABLE "installations"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_eb2de5fbaa61832e982f53d971"
        `);
    await queryRunner.query(`
            DROP TABLE "preferences"
        `);
    await queryRunner.query(`
            DROP TABLE "onboarding_status"
        `);
    await queryRunner.query(`
            DROP TABLE "users"
        `);
  }
}
