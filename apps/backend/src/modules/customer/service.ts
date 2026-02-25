import { MedusaService } from "@medusajs/framework/utils"
import Customer from "./models/customer"

class CustomerModuleService extends MedusaService({
    Customer,
}) { }

export default CustomerModuleService

