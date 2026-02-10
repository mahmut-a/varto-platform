import { MedusaService } from "@medusajs/framework/utils"
import VartoOrder from "./models/varto-order"

class OrderExtensionModuleService extends MedusaService({
    VartoOrder,
}) { }

export default OrderExtensionModuleService
