import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260223180000 extends Migration {

    override async up(): Promise<void> {
        this.addSql(`ALTER TABLE "courier" ADD COLUMN IF NOT EXISTS "admin_user_id" text NULL;`);
        this.addSql(`ALTER TABLE "courier" ADD COLUMN IF NOT EXISTS "push_token" text NULL;`);
    }

    override async down(): Promise<void> {
        this.addSql(`ALTER TABLE "courier" DROP COLUMN IF EXISTS "admin_user_id";`);
        this.addSql(`ALTER TABLE "courier" DROP COLUMN IF EXISTS "push_token";`);
    }

}
