import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { APPOINTMENT_MODULE } from "../../../modules/appointment"
import AppointmentModuleService from "../../../modules/appointment/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const appointmentService: AppointmentModuleService = req.scope.resolve(APPOINTMENT_MODULE)
    const appointments = await appointmentService.listAppointments()
    res.json({ appointments })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const appointmentService: AppointmentModuleService = req.scope.resolve(APPOINTMENT_MODULE)
    const appointment = await appointmentService.createAppointments(req.body as any)
    res.status(201).json({ appointment })
}
