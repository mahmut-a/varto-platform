import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { COURIER_MODULE } from "../../../../modules/courier"
import CourierModuleService from "../../../../modules/courier/service"

/**
 * GET /admin/couriers/by-user — Login olan user'ın bağlı olduğu courier'ı döner
 * Courier App login akışında kullanılır
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const courierService: CourierModuleService = req.scope.resolve(COURIER_MODULE)
        const userId = req.query.user_id as string

        if (!userId) {
            return res.status(400).json({ message: "user_id parametresi zorunludur" })
        }

        const couriers = await courierService.listCouriers({ admin_user_id: userId })

        if (!couriers || couriers.length === 0) {
            return res.status(404).json({ message: "Bu kullanıcıya bağlı kurye bulunamadı" })
        }

        res.json({ courier: couriers[0] })
    } catch (err: any) {
        console.error("Admin get courier by user error:", err?.message || err)
        res.status(500).json({ message: err?.message || "Kurye bulunamadı" })
    }
}
