import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260210225043 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "varto_order" ("id" text not null, "order_id" text null, "vendor_id" text not null, "courier_id" text null, "varto_status" text check ("varto_status" in ('pending', 'confirmed', 'preparing', 'ready', 'assigned', 'accepted', 'delivering', 'delivered', 'cancelled')) not null default 'pending', "delivery_address" jsonb not null, "delivery_notes" text null, "delivery_fee" numeric not null default 0, "payment_method" text check ("payment_method" in ('iban')) not null default 'iban', "iban_info" text null, "verbal_confirmation" boolean not null default false, "metadata" jsonb null, "raw_delivery_fee" jsonb not null default '{"value":"0","precision":20}', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "varto_order_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_varto_order_deleted_at" ON "varto_order" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "varto_order" cascade;`);
  }

}
