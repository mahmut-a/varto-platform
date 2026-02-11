import { model } from "@medusajs/framework/utils"

const VendorProduct = model.define("vendor_product", {
    id: model.id().primaryKey(),
    vendor_id: model.text(),
    name: model.text(),
    description: model.text().nullable(),
    price: model.number().default(0),
    category: model.text().nullable(),
    image_url: model.text().nullable(),
    is_available: model.boolean().default(true),
    sort_order: model.number().default(0),
    metadata: model.json().nullable(),
})

export default VendorProduct
