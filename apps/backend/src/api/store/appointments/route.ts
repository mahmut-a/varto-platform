import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { APPOINTMENT_MODULE } from "../../../modules/appointment"
import AppointmentModuleService from "../../../modules/appointment/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const appointmentService: AppointmentModuleService = req.scope.resolve(APPOINTMENT_MODULE)
    const filters: Record<string, any> = {}
    if (req.query.customer_id) {
        filters.customer_id = req.query.customer_id
    }
    if (req.query.vendor_id) {
        filters.vendor_id = req.query.vendor_id
    }
    const appointments = await appointmentService.listAppointments(filters)
    res.json({ appointments })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const appointmentService: AppointmentModuleService = req.scope.resolve(APPOINTMENT_MODULE)
    const appointment = await appointmentService.createAppointments({
        ...(req.body as any),
        status: "pending",
    })
    res.status(201).json({ appointment })
}
