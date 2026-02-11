import { model } from "@medusajs/framework/utils"
import VartoOrderItem from "./varto-order-item"

const VartoOrder = model.define("varto_order", {
    id: model.id().primaryKey(),
    order_id: model.text().nullable(),
    customer_id: model.text().nullable(),
    customer_phone: model.text().nullable(),
    vendor_id: model.text(),
    courier_id: model.text().nullable(),
    varto_status: model.enum([
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "assigned",
        "accepted",
        "delivering",
        "delivered",
        "cancelled",
    ]).default("pending"),
    delivery_address: model.json(),
    delivery_notes: model.text().nullable(),
    delivery_fee: model.bigNumber().default(0),
    payment_method: model.enum(["iban"]).default("iban"),
    iban_info: model.text().nullable(),
    verbal_confirmation: model.boolean().default(false),
    metadata: model.json().nullable(),
    items: model.hasMany(() => VartoOrderItem, {
        mappedBy: "varto_order",
    }),
})

export default VartoOrder
