import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { VARTO_NOTIFICATION_MODULE } from "../../../modules/varto-notification"
import VartoNotificationModuleService from "../../../modules/varto-notification/service"

/**
 * GET /admin/notifications
 * Bildirimleri listele (vendor_id ile filtrelenebilir)
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const notifService: VartoNotificationModuleService = req.scope.resolve(VARTO_NOTIFICATION_MODULE)
        const filters: any = {}

        if (req.query.recipient_id) {
            filters.recipient_id = req.query.recipient_id
        }
        if (req.query.recipient_type) {
            filters.recipient_type = req.query.recipient_type
        }
        if (req.query.is_read !== undefined) {
            filters.is_read = req.query.is_read === "true"
        }

        const notifications = await notifService.listVartoNotifications(filters, {
            order: { created_at: "DESC" },
            take: Number(req.query.limit) || 50,
        })

        res.json({ notifications })
    } catch (err: any) {
        console.error("Notifications list error:", err?.message || err)
        res.status(500).json({ message: err?.message || "Bildirimler yüklenemedi" })
    }
}
