import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { VENDOR_MODULE } from "../../../modules/vendor"
import VendorModuleService from "../../../modules/vendor/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const vendorService: VendorModuleService = req.scope.resolve(VENDOR_MODULE)
    const vendors = await vendorService.listVendors({
        is_active: true,
    })
    res.json({ vendors })
}
