import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { VENDOR_MODULE } from "../../../../modules/vendor"
import VendorModuleService from "../../../../modules/vendor/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const vendorService: VendorModuleService = req.scope.resolve(VENDOR_MODULE)
    const vendors = await vendorService.listVendors({ is_active: true })
    const vendor = vendors.find((v: any) => v.slug === req.params.slug)
    if (!vendor) {
        return res.status(404).json({ message: "İşletme bulunamadı" })
    }
    res.json({ vendor })
}
