import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260213113000 extends Migration {

    override async up(): Promise<void> {
        // 1. varto_order tablosuna eksik kolonları ekle
        this.addSql(`ALTER TABLE "varto_order" ADD COLUMN IF NOT EXISTS "customer_id" text NULL;`);
        this.addSql(`ALTER TABLE "varto_order" ADD COLUMN IF NOT EXISTS "customer_phone" text NULL;`);

        // 2. varto_order_item tablosuna foreign key ekle
        this.addSql(`DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'varto_order_item_varto_order_id_fkey'
      ) THEN
        ALTER TABLE "varto_order_item"
          ADD CONSTRAINT "varto_order_item_varto_order_id_fkey"
          FOREIGN KEY ("varto_order_id") REFERENCES "varto_order"("id")
          ON DELETE CASCADE;
      END IF;
    END $$;`);

        // 3. Performans için index ekle
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_varto_order_vendor_id" ON "varto_order" ("vendor_id");`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_varto_order_customer_id" ON "varto_order" ("customer_id");`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_varto_order_varto_status" ON "varto_order" ("varto_status");`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_varto_order_item_varto_order_id" ON "varto_order_item" ("varto_order_id");`);
    }

    override async down(): Promise<void> {
        this.addSql(`ALTER TABLE "varto_order" DROP COLUMN IF EXISTS "customer_id";`);
        this.addSql(`ALTER TABLE "varto_order" DROP COLUMN IF EXISTS "customer_phone";`);
        this.addSql(`ALTER TABLE "varto_order_item" DROP CONSTRAINT IF EXISTS "varto_order_item_varto_order_id_fkey";`);
        this.addSql(`DROP INDEX IF EXISTS "IDX_varto_order_vendor_id";`);
        this.addSql(`DROP INDEX IF EXISTS "IDX_varto_order_customer_id";`);
        this.addSql(`DROP INDEX IF EXISTS "IDX_varto_order_varto_status";`);
        this.addSql(`DROP INDEX IF EXISTS "IDX_varto_order_item_varto_order_id";`);
    }
}
