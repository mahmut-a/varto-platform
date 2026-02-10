import { model } from "@medusajs/framework/utils"

const VartoNotification = model.define("varto_notification", {
    id: model.id().primaryKey(),
    title: model.text(),
    message: model.text(),
    type: model.enum(["order", "listing", "appointment", "system"]),
    recipient_type: model.enum(["customer", "vendor", "courier", "admin"]),
    recipient_id: model.text(),
    is_read: model.boolean().default(false),
    reference_id: model.text().nullable(),
    reference_type: model.text().nullable(),
    metadata: model.json().nullable(),
})

export default VartoNotification
