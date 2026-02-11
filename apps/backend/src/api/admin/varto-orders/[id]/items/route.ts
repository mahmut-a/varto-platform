import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ORDER_EXTENSION_MODULE } from "../../../../../modules/order-extension"
import OrderExtensionModuleService from "../../../../../modules/order-extension/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const orderExtService: OrderExtensionModuleService = req.scope.resolve(ORDER_EXTENSION_MODULE)
    const items = await orderExtService.listVartoOrderItems({
        varto_order_id: req.params.id,
    })
    res.json({ items })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const orderExtService: OrderExtensionModuleService = req.scope.resolve(ORDER_EXTENSION_MODULE)
    const item = await orderExtService.createVartoOrderItems({
        varto_order_id: req.params.id,
        ...(req.body as any),
    })
    res.status(201).json({ item })
}
