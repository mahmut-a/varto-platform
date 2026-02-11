import { MedusaService } from "@medusajs/framework/utils"
import VendorProduct from "./models/vendor-product"

class VendorProductModuleService extends MedusaService({
    VendorProduct,
}) { }

export default VendorProductModuleService
