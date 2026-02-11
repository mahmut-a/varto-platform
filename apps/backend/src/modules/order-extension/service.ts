import { MedusaService } from "@medusajs/framework/utils"
import VartoOrder from "./models/varto-order"
import VartoOrderItem from "./models/varto-order-item"

class OrderExtensionModuleService extends MedusaService({
    VartoOrder,
    VartoOrderItem,
}) { }

export default OrderExtensionModuleService
