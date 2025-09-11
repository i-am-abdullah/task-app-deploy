import { MigrationInterface, QueryRunner } from "typeorm";

export class Phase1Migration1757614394428 implements MigrationInterface {
    name = 'Phase1Migration1757614394428'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "username" character varying NOT NULL, "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "fullName" character varying NOT NULL, "phoneNumber" character varying, "role" character varying, "lastLogin" TIMESTAMP, CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "board_members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "board_id" uuid NOT NULL, "user_id" uuid NOT NULL, "role" character varying NOT NULL DEFAULT 'member', "added_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_ccffe02a46548d0d74eea66d798" PRIMARY KEY ("id", "board_id", "user_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."boards_status_enum" AS ENUM('active', 'archived')`);
        await queryRunner.query(`CREATE TABLE "boards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying NOT NULL, "project_id" uuid NOT NULL, "status" "public"."boards_status_enum" NOT NULL DEFAULT 'active', "created_by" uuid NOT NULL, "description" character varying, "metadata" jsonb, CONSTRAINT "PK_606923b0b068ef262dfdcd18f44" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "project_team_leads" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "project_id" uuid NOT NULL, "user_id" uuid NOT NULL, "role" character varying NOT NULL DEFAULT 'team_lead', CONSTRAINT "PK_6c8f9b3cc4117b0411f202c7589" PRIMARY KEY ("id", "project_id", "user_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."projects_status_enum" AS ENUM('active', 'archived')`);
        await queryRunner.query(`CREATE TABLE "projects" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "workspace_id" uuid NOT NULL, "title" character varying NOT NULL, "description" character varying, "status" "public"."projects_status_enum" NOT NULL DEFAULT 'active', "created_by" uuid NOT NULL, CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "workspaces" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "description" character varying, "created_by" uuid NOT NULL, CONSTRAINT "PK_098656ae401f3e1a4586f47fd8e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "board_members" ADD CONSTRAINT "FK_ca2c72a39c80199717012df3932" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "board_members" ADD CONSTRAINT "FK_a9989bac63c51805e59ce91a541" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "boards" ADD CONSTRAINT "FK_1542ae826c0dfeaf4c79e07fc57" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "boards" ADD CONSTRAINT "FK_8156e1b3bd94cb1812a6d55375c" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "project_team_leads" ADD CONSTRAINT "FK_2d1c5fbf666a01e3eb32b7fdc4e" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "project_team_leads" ADD CONSTRAINT "FK_1ea99c0e2e1f35f22fc25b0b8b4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_af78b8fc6857fe0a10d1bb1699e" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_8a7ccdb94bcc8635f933c8f8080" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workspaces" ADD CONSTRAINT "FK_62422395ad425ffda42e4104056" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workspaces" DROP CONSTRAINT "FK_62422395ad425ffda42e4104056"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_8a7ccdb94bcc8635f933c8f8080"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_af78b8fc6857fe0a10d1bb1699e"`);
        await queryRunner.query(`ALTER TABLE "project_team_leads" DROP CONSTRAINT "FK_1ea99c0e2e1f35f22fc25b0b8b4"`);
        await queryRunner.query(`ALTER TABLE "project_team_leads" DROP CONSTRAINT "FK_2d1c5fbf666a01e3eb32b7fdc4e"`);
        await queryRunner.query(`ALTER TABLE "boards" DROP CONSTRAINT "FK_8156e1b3bd94cb1812a6d55375c"`);
        await queryRunner.query(`ALTER TABLE "boards" DROP CONSTRAINT "FK_1542ae826c0dfeaf4c79e07fc57"`);
        await queryRunner.query(`ALTER TABLE "board_members" DROP CONSTRAINT "FK_a9989bac63c51805e59ce91a541"`);
        await queryRunner.query(`ALTER TABLE "board_members" DROP CONSTRAINT "FK_ca2c72a39c80199717012df3932"`);
        await queryRunner.query(`DROP TABLE "workspaces"`);
        await queryRunner.query(`DROP TABLE "projects"`);
        await queryRunner.query(`DROP TYPE "public"."projects_status_enum"`);
        await queryRunner.query(`DROP TABLE "project_team_leads"`);
        await queryRunner.query(`DROP TABLE "boards"`);
        await queryRunner.query(`DROP TYPE "public"."boards_status_enum"`);
        await queryRunner.query(`DROP TABLE "board_members"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
