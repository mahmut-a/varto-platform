import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ORDER_EXTENSION_MODULE } from "../../../../../modules/order-extension"
import OrderExtensionModuleService from "../../../../../modules/order-extension/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const orderExtService: OrderExtensionModuleService = req.scope.resolve(ORDER_EXTENSION_MODULE)
    const customerId = req.params.id

    const varto_orders = await orderExtService.listVartoOrders(
        { customer_id: customerId },
        { relations: ["items"] }
    )

    res.json({ varto_orders })
}
