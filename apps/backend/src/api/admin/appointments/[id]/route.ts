import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { APPOINTMENT_MODULE } from "../../../../modules/appointment"
import AppointmentModuleService from "../../../../modules/appointment/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const appointmentService: AppointmentModuleService = req.scope.resolve(APPOINTMENT_MODULE)
    const appointment = await appointmentService.retrieveAppointment(req.params.id)
    res.json({ appointment })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const appointmentService: AppointmentModuleService = req.scope.resolve(APPOINTMENT_MODULE)
    const appointment = await appointmentService.updateAppointments({
        id: req.params.id,
        ...(req.body as any),
    })
    res.json({ appointment })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
    const appointmentService: AppointmentModuleService = req.scope.resolve(APPOINTMENT_MODULE)
    await appointmentService.deleteAppointments(req.params.id)
    res.status(200).json({ id: req.params.id, deleted: true })
}
