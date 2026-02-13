import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260213113001 extends Migration {

    override async up(): Promise<void> {
        // Vendor tablosuna admin_user_id kolonu ekle (Medusa user ile eşleştirme için)
        this.addSql(`ALTER TABLE "vendor" ADD COLUMN IF NOT EXISTS "admin_user_id" text NULL;`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_admin_user_id" ON "vendor" ("admin_user_id");`);
    }

    override async down(): Promise<void> {
        this.addSql(`DROP INDEX IF EXISTS "IDX_vendor_admin_user_id";`);
        this.addSql(`ALTER TABLE "vendor" DROP COLUMN IF EXISTS "admin_user_id";`);
    }
}
