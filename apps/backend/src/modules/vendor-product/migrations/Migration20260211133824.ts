import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260211133824 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "vendor_product" ("id" text not null, "vendor_id" text not null, "name" text not null, "description" text null, "price" integer not null default 0, "category" text null, "image_url" text null, "is_available" boolean not null default true, "sort_order" integer not null default 0, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vendor_product_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_product_deleted_at" ON "vendor_product" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "vendor_product" cascade;`);
  }

}
