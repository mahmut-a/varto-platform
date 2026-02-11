import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260211000000 extends Migration {

    override async up(): Promise<void> {
        this.addSql(`create table if not exists "varto_customer" ("id" text not null, "phone" text not null, "name" text null, "email" text null, "address" text null, "is_active" boolean not null default true, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "varto_customer_pkey" primary key ("id"));`);
        this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_varto_customer_phone_unique" ON "varto_customer" ("phone") WHERE deleted_at IS NULL;`);
        this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_varto_customer_deleted_at" ON "varto_customer" ("deleted_at") WHERE deleted_at IS NULL;`);
    }

    override async down(): Promise<void> {
        this.addSql(`drop table if exists "varto_customer" cascade;`);
    }

}
