import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { VENDOR_MODULE } from "../../../modules/vendor"
import VendorModuleService from "../../../modules/vendor/service"

/**
 * GET /store/vendors — Tüm aktif işletmeleri listele (müşteri uygulaması için)
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const vendorService: VendorModuleService = req.scope.resolve(VENDOR_MODULE)
        const vendors = await vendorService.listVendors({ is_active: true })
        res.json({ vendors })
    } catch (err: any) {
        console.error("Store list vendors error:", err?.message || err)
        res.status(500).json({ message: err?.message || "İşletmeler yüklenemedi" })
    }
}
