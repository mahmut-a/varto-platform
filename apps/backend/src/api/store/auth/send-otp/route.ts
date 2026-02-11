import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CUSTOMER_MODULE } from "../../../../modules/customer"
import CustomerModuleService from "../../../../modules/customer/service"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const customerService: CustomerModuleService = req.scope.resolve(CUSTOMER_MODULE)
    const { phone } = req.body as any

    if (!phone) {
        return res.status(400).json({ message: "Telefon numarası zorunludur" })
    }

    // Check if customer exists
    let customers = await customerService.listCustomers({ phone })
    const is_new = !customers || customers.length === 0

    if (is_new) {
        await customerService.createCustomers({ phone })
    }

    // In seed mode, OTP is always 123456 — no actual SMS sent
    res.json({ success: true, is_new, message: is_new ? "Hesabınız oluşturuldu, OTP gönderildi" : "OTP gönderildi" })
}
