import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { VARTO_NOTIFICATION_MODULE } from "../../../../modules/varto-notification"
import VartoNotificationModuleService from "../../../../modules/varto-notification/service"

/**
 * POST /admin/notifications/:id
 * Bildirimi okundu olarak işaretle
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const notifService: VartoNotificationModuleService = req.scope.resolve(VARTO_NOTIFICATION_MODULE)

        const notification = await notifService.updateVartoNotifications({
            id: req.params.id,
            is_read: true,
        })

        res.json({ notification })
    } catch (err: any) {
        console.error("Notification update error:", err?.message || err)
        res.status(500).json({ message: err?.message || "Bildirim güncellenemedi" })
    }
}
