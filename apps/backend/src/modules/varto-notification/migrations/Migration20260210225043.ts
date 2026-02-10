import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260210225043 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "varto_notification" ("id" text not null, "title" text not null, "message" text not null, "type" text check ("type" in ('order', 'listing', 'appointment', 'system')) not null, "recipient_type" text check ("recipient_type" in ('customer', 'vendor', 'courier', 'admin')) not null, "recipient_id" text not null, "is_read" boolean not null default false, "reference_id" text null, "reference_type" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "varto_notification_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_varto_notification_deleted_at" ON "varto_notification" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "varto_notification" cascade;`);
  }

}
