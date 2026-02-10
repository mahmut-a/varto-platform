import { MedusaService } from "@medusajs/framework/utils"
import VartoNotification from "./models/notification"

class VartoNotificationModuleService extends MedusaService({
    VartoNotification,
}) { }

export default VartoNotificationModuleService
