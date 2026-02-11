import { model } from "@medusajs/framework/utils"
import VartoOrder from "./varto-order"

const VartoOrderItem = model.define("varto_order_item", {
    id: model.id().primaryKey(),
    varto_order: model.belongsTo(() => VartoOrder, {
        mappedBy: "items",
    }),
    product_name: model.text(),
    quantity: model.number().default(1),
    unit_price: model.bigNumber().default(0),
    total_price: model.bigNumber().default(0),
    notes: model.text().nullable(),
    metadata: model.json().nullable(),
})

export default VartoOrderItem
