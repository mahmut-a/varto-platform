import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { VENDOR_MODULE } from "../../../../modules/vendor"
import VendorModuleService from "../../../../modules/vendor/service"

/**
 * GET /admin/vendors/by-user — Login olan admin user'ın bağlı olduğu vendor'ı döner
 * Vendor App login akışında kullanılır
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const vendorService: VendorModuleService = req.scope.resolve(VENDOR_MODULE)
        const userId = req.query.user_id as string

        if (!userId) {
            return res.status(400).json({ message: "user_id parametresi zorunludur" })
        }

        const vendors = await vendorService.listVendors({ admin_user_id: userId })

        if (!vendors || vendors.length === 0) {
            return res.status(404).json({ message: "Bu kullanıcıya bağlı işletme bulunamadı" })
        }

        res.json({ vendor: vendors[0] })
    } catch (err: any) {
        console.error("Admin get vendor by user error:", err?.message || err)
        res.status(500).json({ message: err?.message || "İşletme bulunamadı" })
    }
}
