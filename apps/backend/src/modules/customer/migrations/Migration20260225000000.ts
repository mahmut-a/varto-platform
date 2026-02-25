import { Migration } from "@mikro-orm/migrations"

export class Migration20260225000000 extends Migration {
    async up(): Promise<void> {
        this.addSql(`ALTER TABLE "varto_customer" ADD COLUMN IF NOT EXISTS "push_token" text NULL;`);
    }

    async down(): Promise<void> {
        this.addSql(`ALTER TABLE "varto_customer" DROP COLUMN IF EXISTS "push_token";`);
    }
}
