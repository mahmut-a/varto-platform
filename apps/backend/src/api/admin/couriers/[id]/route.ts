import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { COURIER_MODULE } from "../../../../modules/courier"
import CourierModuleService from "../../../../modules/courier/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const courierService: CourierModuleService = req.scope.resolve(COURIER_MODULE)
    const courier = await courierService.retrieveCourier(req.params.id)
    res.json({ courier })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const courierService: CourierModuleService = req.scope.resolve(COURIER_MODULE)
    const courier = await courierService.updateCouriers(req.params.id, req.body as any)
    res.json({ courier })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
    const courierService: CourierModuleService = req.scope.resolve(COURIER_MODULE)
    await courierService.deleteCouriers(req.params.id)
    res.status(200).json({ id: req.params.id, deleted: true })
}
