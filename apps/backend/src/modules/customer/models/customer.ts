import { model } from "@medusajs/framework/utils"

const Customer = model.define("varto_customer", {
    id: model.id().primaryKey(),
    phone: model.text().unique(),
    name: model.text().nullable(),
    email: model.text().nullable(),
    address: model.text().nullable(),
    is_active: model.boolean().default(true),
    metadata: model.json().nullable(),
})

export default Customer
