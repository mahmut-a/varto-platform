import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { COURIER_MODULE } from "../../../modules/courier"
import CourierModuleService from "../../../modules/courier/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const courierService: CourierModuleService = req.scope.resolve(COURIER_MODULE)
    const couriers = await courierService.listCouriers()
    res.json({ couriers })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const courierService: CourierModuleService = req.scope.resolve(COURIER_MODULE)
    const courier = await courierService.createCouriers(req.body as any)
    res.status(201).json({ courier })
}
