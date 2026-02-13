import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { VENDOR_MODULE } from "../../../../../modules/vendor"
import VendorModuleService from "../../../../../modules/vendor/service"

/**
 * POST /admin/vendors/:id/push-token
 * Vendor'ın Expo push token'ını kaydet
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const vendorService: VendorModuleService = req.scope.resolve(VENDOR_MODULE)
        const { push_token } = req.body as { push_token: string }

        if (!push_token) {
            return res.status(400).json({ message: "push_token zorunludur" })
        }

        const vendor = await vendorService.updateVendors({
            id: req.params.id,
            push_token,
        })

        res.json({ vendor, message: "Push token kaydedildi" })
    } catch (err: any) {
        console.error("Push token kaydetme hatası:", err?.message || err)
        res.status(500).json({ message: err?.message || "Push token kaydedilemedi" })
    }
}

/**
 * DELETE /admin/vendors/:id/push-token
 * Vendor'ın push token'ını sil (logout'ta)
 */
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const vendorService: VendorModuleService = req.scope.resolve(VENDOR_MODULE)

        await vendorService.updateVendors({
            id: req.params.id,
            push_token: null,
        })

        res.json({ message: "Push token silindi" })
    } catch (err: any) {
        console.error("Push token silme hatası:", err?.message || err)
        res.status(500).json({ message: err?.message || "Push token silinemedi" })
    }
}
