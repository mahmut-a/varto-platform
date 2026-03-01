import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CUSTOMER_MODULE } from "../../../../modules/customer"
import CustomerModuleService from "../../../../modules/customer/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const customerService: CustomerModuleService = req.scope.resolve(CUSTOMER_MODULE)
    const customer = await customerService.retrieveCustomer(req.params.id)
    res.json({ customer })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const customerService: CustomerModuleService = req.scope.resolve(CUSTOMER_MODULE)
    const customer = await customerService.updateCustomers({
        id: req.params.id,
        ...(req.body as any),
    })
    res.json({ customer })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
    const customerService: CustomerModuleService = req.scope.resolve(CUSTOMER_MODULE)
    await customerService.deleteCustomers(req.params.id)
    res.status(200).json({ id: req.params.id, deleted: true })
}
