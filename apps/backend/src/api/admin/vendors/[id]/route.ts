import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { VENDOR_MODULE } from "../../../../modules/vendor"
import VendorModuleService from "../../../../modules/vendor/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const vendorService: VendorModuleService = req.scope.resolve(VENDOR_MODULE)
    const vendor = await vendorService.retrieveVendor(req.params.id)
    res.json({ vendor })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const vendorService: VendorModuleService = req.scope.resolve(VENDOR_MODULE)
    const vendor = await vendorService.updateVendors({
        id: req.params.id,
        ...(req.body as any),
    })
    res.json({ vendor })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
    const vendorService: VendorModuleService = req.scope.resolve(VENDOR_MODULE)
    await vendorService.deleteVendors(req.params.id)
    res.status(200).json({ id: req.params.id, deleted: true })
}
