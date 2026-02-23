import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { COURIER_MODULE } from "../../../../../modules/courier"
import CourierModuleService from "../../../../../modules/courier/service"

/**
 * POST /admin/couriers/:id/push-token
 * Kurye Expo push token kaydet
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const courierService: CourierModuleService = req.scope.resolve(COURIER_MODULE)
        const { push_token } = req.body as { push_token: string }

        if (!push_token) {
            return res.status(400).json({ message: "push_token zorunludur" })
        }

        const courier = await courierService.updateCouriers({
            id: req.params.id,
            push_token,
        })

        res.json({ courier, message: "Push token kaydedildi" })
    } catch (err: any) {
        console.error("Courier push token kaydetme hatası:", err?.message || err)
        res.status(500).json({ message: err?.message || "Push token kaydedilemedi" })
    }
}

/**
 * DELETE /admin/couriers/:id/push-token
 * Kurye push token sil (logout)
 */
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const courierService: CourierModuleService = req.scope.resolve(COURIER_MODULE)

        await courierService.updateCouriers({
            id: req.params.id,
            push_token: null,
        })

        res.json({ message: "Push token silindi" })
    } catch (err: any) {
        console.error("Courier push token silme hatası:", err?.message || err)
        res.status(500).json({ message: err?.message || "Push token silinemedi" })
    }
}
