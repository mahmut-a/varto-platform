import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ORDER_EXTENSION_MODULE } from "../../../../modules/order-extension"
import OrderExtensionModuleService from "../../../../modules/order-extension/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const orderExtService: OrderExtensionModuleService = req.scope.resolve(ORDER_EXTENSION_MODULE)
    const varto_order = await orderExtService.retrieveVartoOrder(req.params.id)
    res.json({ varto_order })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const orderExtService: OrderExtensionModuleService = req.scope.resolve(ORDER_EXTENSION_MODULE)
    const varto_order = await orderExtService.updateVartoOrders({
        id: req.params.id,
        ...(req.body as any),
    })
    res.json({ varto_order })
}
