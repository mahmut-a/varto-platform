import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { VENDOR_PRODUCT_MODULE } from "../../../modules/vendor-product"
import VendorProductModuleService from "../../../modules/vendor-product/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const service: VendorProductModuleService = req.scope.resolve(VENDOR_PRODUCT_MODULE)
    const filters: any = {}
    if (req.query.vendor_id) {
        filters.vendor_id = req.query.vendor_id
    }
    const products = await service.listVendorProducts(filters, {
        order: { sort_order: "ASC" },
    })
    res.json({ vendor_products: products })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const service: VendorProductModuleService = req.scope.resolve(VENDOR_PRODUCT_MODULE)
    const product = await service.createVendorProducts(req.body as any)
    res.status(201).json({ vendor_product: product })
}
