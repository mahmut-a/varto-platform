import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260223200000 extends Migration {

    override async up(): Promise<void> {
        // Courier tablosuna admin_user_id kolonu ekle (Medusa user ile eşleştirme için)
        this.addSql(`ALTER TABLE "courier" ADD COLUMN IF NOT EXISTS "admin_user_id" text NULL;`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_courier_admin_user_id" ON "courier" ("admin_user_id");`);
    }

    override async down(): Promise<void> {
        this.addSql(`DROP INDEX IF EXISTS "IDX_courier_admin_user_id";`);
        this.addSql(`ALTER TABLE "courier" DROP COLUMN IF EXISTS "admin_user_id";`);
    }

}
