import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260210225042 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "courier" ("id" text not null, "name" text not null, "phone" text not null, "email" text null, "is_active" boolean not null default true, "is_available" boolean not null default true, "vehicle_type" text check ("vehicle_type" in ('motorcycle', 'bicycle', 'car', 'on_foot')) not null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "courier_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_courier_deleted_at" ON "courier" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "courier" cascade;`);
  }

}
