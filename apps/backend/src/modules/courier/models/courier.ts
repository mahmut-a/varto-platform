import { model } from "@medusajs/framework/utils"

const Courier = model.define("courier", {
    id: model.id().primaryKey(),
    name: model.text(),
    phone: model.text(),
    email: model.text().nullable(),
    is_active: model.boolean().default(true),
    is_available: model.boolean().default(true),
    vehicle_type: model.enum(["motorcycle", "bicycle", "car", "on_foot"]),
    metadata: model.json().nullable(),
})

export default Courier
