import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260210225042 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "vendor" drop constraint if exists "vendor_slug_unique";`);
    this.addSql(`create table if not exists "vendor" ("id" text not null, "name" text not null, "slug" text not null, "description" text null, "phone" text not null, "email" text null, "address" text not null, "category" text check ("category" in ('restaurant', 'market', 'pharmacy', 'stationery', 'barber', 'other')) not null, "iban" text not null, "is_active" boolean not null default true, "opening_hours" jsonb null, "image_url" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vendor_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_vendor_slug_unique" ON "vendor" ("slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_deleted_at" ON "vendor" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "vendor" cascade;`);
  }

}
