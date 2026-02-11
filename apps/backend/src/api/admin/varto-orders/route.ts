import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ORDER_EXTENSION_MODULE } from "../../../modules/order-extension"
import OrderExtensionModuleService from "../../../modules/order-extension/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const orderExtService: OrderExtensionModuleService = req.scope.resolve(ORDER_EXTENSION_MODULE)
    const filters: any = {}
    if (req.query.vendor_id) {
        filters.vendor_id = req.query.vendor_id
    }
    const varto_orders = await orderExtService.listVartoOrders(filters, {
        relations: ["items"],
    })
    res.json({ varto_orders })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const orderExtService: OrderExtensionModuleService = req.scope.resolve(ORDER_EXTENSION_MODULE)
    const varto_order = await orderExtService.createVartoOrders(req.body as any)
    res.status(201).json({ varto_order })
}
