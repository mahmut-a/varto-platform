import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { VENDOR_PRODUCT_MODULE } from "../../../../modules/vendor-product"
import VendorProductModuleService from "../../../../modules/vendor-product/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const service: VendorProductModuleService = req.scope.resolve(VENDOR_PRODUCT_MODULE)
    const product = await service.retrieveVendorProduct(req.params.id)
    res.json({ vendor_product: product })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const service: VendorProductModuleService = req.scope.resolve(VENDOR_PRODUCT_MODULE)
    const product = await service.updateVendorProducts({
        id: req.params.id,
        ...(req.body as any),
    })
    res.json({ vendor_product: product })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
    const service: VendorProductModuleService = req.scope.resolve(VENDOR_PRODUCT_MODULE)
    await service.deleteVendorProducts(req.params.id)
    res.status(200).json({ id: req.params.id, deleted: true })
}
