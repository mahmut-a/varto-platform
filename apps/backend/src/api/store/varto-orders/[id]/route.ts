import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ORDER_EXTENSION_MODULE } from "../../../../modules/order-extension"
import OrderExtensionModuleService from "../../../../modules/order-extension/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const orderExtService: OrderExtensionModuleService = req.scope.resolve(ORDER_EXTENSION_MODULE)

    try {
        const varto_order = await orderExtService.retrieveVartoOrder(req.params.id)
        const items = await orderExtService.listVartoOrderItems({ varto_order_id: req.params.id })
        res.json({ varto_order: { ...varto_order, items } })
    } catch {
        res.status(404).json({ message: "Sipariş bulunamadı" })
    }
}
