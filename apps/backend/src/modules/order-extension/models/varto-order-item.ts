import { model } from "@medusajs/framework/utils"

const VartoOrderItem = model.define("varto_order_item", {
    id: model.id().primaryKey(),
    varto_order_id: model.text(),
    product_name: model.text(),
    quantity: model.number().default(1),
    unit_price: model.bigNumber().default(0),
    total_price: model.bigNumber().default(0),
    notes: model.text().nullable(),
    metadata: model.json().nullable(),
})

export default VartoOrderItem
