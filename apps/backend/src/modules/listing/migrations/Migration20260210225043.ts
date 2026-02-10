import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260210225043 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "listing" ("id" text not null, "title" text not null, "description" text not null, "category" text check ("category" in ('rental', 'sale', 'job', 'service', 'other')) not null, "price" numeric null, "currency" text not null default 'TRY', "contact_phone" text not null, "contact_name" text not null, "location" text not null, "images" jsonb null, "status" text check ("status" in ('pending', 'approved', 'rejected', 'expired')) not null default 'pending', "rejection_reason" text null, "customer_id" text null, "vendor_id" text null, "expires_at" timestamptz null, "metadata" jsonb null, "raw_price" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "listing_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_listing_deleted_at" ON "listing" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "listing" cascade;`);
  }

}
