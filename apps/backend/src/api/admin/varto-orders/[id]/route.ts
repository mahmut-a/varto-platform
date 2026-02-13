import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ORDER_EXTENSION_MODULE } from "../../../../modules/order-extension"
import OrderExtensionModuleService from "../../../../modules/order-extension/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const orderExtService: OrderExtensionModuleService = req.scope.resolve(ORDER_EXTENSION_MODULE)
        const varto_order = await orderExtService.retrieveVartoOrder(req.params.id, {
            relations: ["items"],
        })
        res.json({ varto_order })
    } catch (err: any) {
        console.error("Admin get order error:", err?.message || err)
        res.status(404).json({ message: "Sipariş bulunamadı" })
    }
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const orderExtService: OrderExtensionModuleService = req.scope.resolve(ORDER_EXTENSION_MODULE)
        const body = req.body as any

        // Sadece izin verilen alanları güncelle
        const updateData: any = { id: req.params.id }
        if (body.varto_status) updateData.varto_status = body.varto_status
        if (body.courier_id !== undefined) updateData.courier_id = body.courier_id
        if (body.verbal_confirmation !== undefined) updateData.verbal_confirmation = body.verbal_confirmation
        if (body.delivery_notes !== undefined) updateData.delivery_notes = body.delivery_notes
        if (body.metadata !== undefined) updateData.metadata = body.metadata

        const varto_order = await orderExtService.updateVartoOrders(updateData)

        // Güncel halini getir
        const updated = await orderExtService.retrieveVartoOrder(req.params.id, {
            relations: ["items"],
        })

        res.json({ varto_order: updated })
    } catch (err: any) {
        console.error("Admin update order error:", err?.message || err)
        res.status(500).json({ message: err?.message || "Sipariş güncellenemedi" })
    }
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const orderExtService: OrderExtensionModuleService = req.scope.resolve(ORDER_EXTENSION_MODULE)
        await orderExtService.deleteVartoOrders(req.params.id)
        res.status(200).json({ id: req.params.id, deleted: true })
    } catch (err: any) {
        console.error("Admin delete order error:", err?.message || err)
        res.status(500).json({ message: err?.message || "Sipariş silinemedi" })
    }
}
