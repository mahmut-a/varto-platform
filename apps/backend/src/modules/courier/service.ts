import { MedusaService } from "@medusajs/framework/utils"
import Courier from "./models/courier"

class CourierModuleService extends MedusaService({
    Courier,
}) { }

export default CourierModuleService
