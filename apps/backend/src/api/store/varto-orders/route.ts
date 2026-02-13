import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ORDER_EXTENSION_MODULE } from "../../../modules/order-extension"
import OrderExtensionModuleService from "../../../modules/order-extension/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const orderExtService: OrderExtensionModuleService = req.scope.resolve(ORDER_EXTENSION_MODULE)
        const filters: any = {}

        if (req.query.customer_id) {
            filters.customer_id = req.query.customer_id
        }

        const varto_orders = await orderExtService.listVartoOrders(filters, {
            relations: ["items"],
            order: { created_at: "DESC" },
        })
        res.json({ varto_orders })
    } catch (err: any) {
        console.error("Store list orders error:", err?.message || err)
        res.status(500).json({ message: err?.message || "Siparişler yüklenemedi" })
    }
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const orderExtService: OrderExtensionModuleService = req.scope.resolve(ORDER_EXTENSION_MODULE)
        const body = req.body as any

        // Validasyon
        if (!body.vendor_id) {
            return res.status(400).json({ message: "İşletme (vendor_id) zorunludur" })
        }
        if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
            return res.status(400).json({ message: "En az bir ürün eklemelisiniz" })
        }

        // Sipariş oluştur
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

        // Sipariş kalemlerini oluştur
        for (const item of body.items) {
            if (!item.product_name) continue
            await orderExtService.createVartoOrderItems({
                varto_order_id: varto_order.id,
                product_name: item.product_name,
                quantity: item.quantity || 1,
                unit_price: item.unit_price || 0,
                total_price: (item.unit_price || 0) * (item.quantity || 1),
                notes: item.notes || null,
            })
        }

        // Siparişi kalemlerle birlikte tekrar getir
        const order = await orderExtService.retrieveVartoOrder(varto_order.id, {
            relations: ["items"],
        })

        res.status(201).json({ varto_order: order })
    } catch (err: any) {
        console.error("Store create order error:", err?.message || err)
        res.status(500).json({
            message: err?.message || "Sipariş oluşturulamadı. Lütfen tekrar deneyin.",
            type: "order_create_error",
        })
    }
}
