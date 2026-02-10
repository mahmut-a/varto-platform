import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { VENDOR_MODULE } from "../../../modules/vendor"
import VendorModuleService from "../../../modules/vendor/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const vendorService: VendorModuleService = req.scope.resolve(VENDOR_MODULE)
    const vendors = await vendorService.listVendors()
    res.json({ vendors })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const vendorService: VendorModuleService = req.scope.resolve(VENDOR_MODULE)
    const vendor = await vendorService.createVendors(req.body as any)
    res.status(201).json({ vendor })
}
