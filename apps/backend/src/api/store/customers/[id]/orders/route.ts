import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ORDER_EXTENSION_MODULE } from "../../../../../modules/order-extension"
import OrderExtensionModuleService from "../../../../../modules/order-extension/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const orderExtService: OrderExtensionModuleService = req.scope.resolve(ORDER_EXTENSION_MODULE)
    const customerId = req.params.id

    const varto_orders = await orderExtService.listVartoOrders({ customer_id: customerId })

    // Fetch items for each order
    const ordersWithItems = await Promise.all(
        varto_orders.map(async (order: any) => {
            const items = await orderExtService.listVartoOrderItems({ varto_order_id: order.id })
            return { ...order, items }
        })
    )

    res.json({ varto_orders: ordersWithItems })
}
