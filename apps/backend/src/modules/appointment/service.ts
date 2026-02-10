import { MedusaService } from "@medusajs/framework/utils"
import Appointment from "./models/appointment"

class AppointmentModuleService extends MedusaService({
    Appointment,
}) { }

export default AppointmentModuleService
