import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ORDER_EXTENSION_MODULE } from "../../../../modules/order-extension"
import OrderExtensionModuleService from "../../../../modules/order-extension/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const orderExtService: OrderExtensionModuleService = req.scope.resolve(ORDER_EXTENSION_MODULE)

    try {
        const varto_order = await orderExtService.retrieveVartoOrder(req.params.id, {
            relations: ["items"],
        })
        res.json({ varto_order })
    } catch {
        res.status(404).json({ message: "Sipariş bulunamadı" })
    }
}
