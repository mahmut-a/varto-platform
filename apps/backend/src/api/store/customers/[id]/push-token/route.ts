import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CUSTOMER_MODULE } from "../../../../../../modules/customer"
import CustomerModuleService from "../../../../../../modules/customer/service"

/**
 * POST /store/customers/:id/push-token
 * Müşteri Expo push token kaydet
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const customerService: CustomerModuleService = req.scope.resolve(CUSTOMER_MODULE)
        const { push_token } = req.body as { push_token: string }

        if (!push_token) {
            return res.status(400).json({ message: "push_token zorunludur" })
        }

        const customer = await customerService.updateCustomers({
            id: req.params.id,
            push_token,
        })

        res.json({ customer, message: "Push token kaydedildi" })
    } catch (err: any) {
        console.error("Customer push token kaydetme hatası:", err?.message || err)
        res.status(500).json({ message: err?.message || "Push token kaydedilemedi" })
    }
}

/**
 * DELETE /store/customers/:id/push-token
 * Müşteri push token sil (logout)
 */
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const customerService: CustomerModuleService = req.scope.resolve(CUSTOMER_MODULE)

        await customerService.updateCustomers({
            id: req.params.id,
            push_token: null,
        })

        res.json({ message: "Push token silindi" })
    } catch (err: any) {
        console.error("Customer push token silme hatası:", err?.message || err)
        res.status(500).json({ message: err?.message || "Push token silinemedi" })
    }
}
