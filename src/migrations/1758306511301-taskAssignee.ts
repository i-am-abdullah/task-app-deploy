import { MigrationInterface, QueryRunner } from "typeorm";

export class TaskAssignee1758306511301 implements MigrationInterface {
    name = 'TaskAssignee1758306511301'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_5770b28d72ca90c43b1381bf787"`);
        await queryRunner.query(`CREATE TABLE "task_assignees" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "task_id" uuid NOT NULL, "user_id" uuid NOT NULL, "assigned_by" uuid NOT NULL, "assigned_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "metadata" jsonb, CONSTRAINT "UQ_7ae8012667c1cc4ca8266002afc" UNIQUE ("task_id", "user_id"), CONSTRAINT "PK_e23bc1438f7bb32f41e8d493e78" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "assigned_to"`);
        await queryRunner.query(`ALTER TABLE "task_assignees" ADD CONSTRAINT "FK_0141288f2306f20da9a60ec8d69" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_assignees" ADD CONSTRAINT "FK_bb8051e376a2b083e074678cb60" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_assignees" ADD CONSTRAINT "FK_44aef1f0e96ef4afc8d9b1f14df" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_assignees" DROP CONSTRAINT "FK_44aef1f0e96ef4afc8d9b1f14df"`);
        await queryRunner.query(`ALTER TABLE "task_assignees" DROP CONSTRAINT "FK_bb8051e376a2b083e074678cb60"`);
        await queryRunner.query(`ALTER TABLE "task_assignees" DROP CONSTRAINT "FK_0141288f2306f20da9a60ec8d69"`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "assigned_to" uuid`);
        await queryRunner.query(`DROP TABLE "task_assignees"`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_5770b28d72ca90c43b1381bf787" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
