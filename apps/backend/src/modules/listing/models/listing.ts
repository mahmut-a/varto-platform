import { model } from "@medusajs/framework/utils"

const Listing = model.define("listing", {
    id: model.id().primaryKey(),
    title: model.text(),
    description: model.text(),
    category: model.enum(["rental", "sale", "job", "service", "other"]),
    price: model.bigNumber().nullable(),
    currency: model.text().default("TRY"),
    contact_phone: model.text(),
    contact_name: model.text(),
    location: model.text(),
    images: model.json().nullable(),
    status: model.enum(["pending", "approved", "rejected", "expired"]).default("pending"),
    rejection_reason: model.text().nullable(),
    customer_id: model.text().nullable(),
    vendor_id: model.text().nullable(),
    expires_at: model.dateTime().nullable(),
    metadata: model.json().nullable(),
})

export default Listing
