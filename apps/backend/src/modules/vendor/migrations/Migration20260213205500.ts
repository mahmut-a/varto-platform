import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260213205500 extends Migration {

    override async up(): Promise<void> {
        // Vendor tablosuna push_token kolonu ekle (Expo push notification için)
        this.addSql(`ALTER TABLE "vendor" ADD COLUMN IF NOT EXISTS "push_token" text NULL;`);
    }

    override async down(): Promise<void> {
        this.addSql(`ALTER TABLE "vendor" DROP COLUMN IF EXISTS "push_token";`);
    }
}
