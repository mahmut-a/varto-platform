import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260211001429 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "varto_order_item" ("id" text not null, "varto_order_id" text not null, "product_name" text not null, "quantity" integer not null default 1, "unit_price" numeric not null default 0, "total_price" numeric not null default 0, "notes" text null, "metadata" jsonb null, "raw_unit_price" jsonb not null default '{"value":"0","precision":20}', "raw_total_price" jsonb not null default '{"value":"0","precision":20}', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "varto_order_item_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_varto_order_item_deleted_at" ON "varto_order_item" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "varto_order_item" cascade;`);
  }

}
