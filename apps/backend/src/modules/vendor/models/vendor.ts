import { model } from "@medusajs/framework/utils"

const Vendor = model.define("vendor", {
    id: model.id().primaryKey(),
    name: model.text(),
    slug: model.text().unique(),
    description: model.text().nullable(),
    phone: model.text(),
    email: model.text().nullable(),
    address: model.text(),
    category: model.enum(["restaurant", "market", "pharmacy", "stationery", "barber", "other"]),
    iban: model.text(),
    is_active: model.boolean().default(true),
    opening_hours: model.json().nullable(),
    image_url: model.text().nullable(),
    admin_user_id: model.text().nullable(),
    metadata: model.json().nullable(),
})

export default Vendor
