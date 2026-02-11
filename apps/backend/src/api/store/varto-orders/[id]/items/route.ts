import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ORDER_EXTENSION_MODULE } from "../../../../../modules/order-extension"
import OrderExtensionModuleService from "../../../../../modules/order-extension/service"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const orderExtService: OrderExtensionModuleService = req.scope.resolve(ORDER_EXTENSION_MODULE)
    const body = req.body as any

    const varto_order_item = await orderExtService.createVartoOrderItems({
        varto_order_id: req.params.id,
        product_name: body.product_name,
        quantity: body.quantity || 1,
        unit_price: body.unit_price || 0,
        total_price: (body.unit_price || 0) * (body.quantity || 1),
        notes: body.notes || null,
    })

    res.status(201).json({ varto_order_item })
}
