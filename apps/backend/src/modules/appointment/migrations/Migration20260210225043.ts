import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260210225043 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "appointment" ("id" text not null, "vendor_id" text not null, "customer_id" text not null, "service_name" text not null, "date" timestamptz not null, "duration_minutes" integer not null default 30, "status" text check ("status" in ('pending', 'confirmed', 'rejected', 'cancelled', 'completed')) not null default 'pending', "notes" text null, "rejection_reason" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "appointment_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_appointment_deleted_at" ON "appointment" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "appointment" cascade;`);
  }

}
