import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ORDER_EXTENSION_MODULE } from "../../../modules/order-extension"
import OrderExtensionModuleService from "../../../modules/order-extension/service"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const orderExtService: OrderExtensionModuleService = req.scope.resolve(ORDER_EXTENSION_MODULE)
    const body = req.body as any

    const varto_order = await orderExtService.createVartoOrders({
        vendor_id: body.vendor_id,
        customer_id: body.customer_id || null,
        customer_phone: body.customer_phone || null,
        delivery_address: body.delivery_address || {},
        delivery_notes: body.delivery_notes || null,
        delivery_fee: body.delivery_fee || 0,
        payment_method: body.payment_method || "iban",
        iban_info: body.iban_info || null,
        varto_status: "pending",
    })

    // Auto-create order items if provided
    if (body.items && Array.isArray(body.items)) {
        for (const item of body.items) {
            await orderExtService.createVartoOrderItems({
                varto_order_id: varto_order.id,
                product_name: item.product_name,
                quantity: item.quantity || 1,
                unit_price: item.unit_price || 0,
                total_price: (item.unit_price || 0) * (item.quantity || 1),
                notes: item.notes || null,
            })
        }
    }

    // Re-fetch with items
    const order = await orderExtService.retrieveVartoOrder(varto_order.id, {
        relations: ["items"],
    })

    res.status(201).json({ varto_order: order })
}
