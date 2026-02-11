import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CUSTOMER_MODULE } from "../../../../modules/customer"
import CustomerModuleService from "../../../../modules/customer/service"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const customerService: CustomerModuleService = req.scope.resolve(CUSTOMER_MODULE)
        const { phone } = req.body as any

        if (!phone) {
            return res.status(400).json({ message: "Telefon numarası zorunludur" })
        }

        // Check if customer exists
        let customers: any[] = []
        try {
            customers = await customerService.listCustomers({ phone })
        } catch (listErr: any) {
            console.error("listCustomers error:", listErr?.message || listErr)
            // Table might not exist yet or filter not supported — try without filter
            const allCustomers = await customerService.listCustomers()
            customers = allCustomers.filter((c: any) => c.phone === phone)
        }

        const is_new = !customers || customers.length === 0

        if (is_new) {
            await customerService.createCustomers({ phone })
        }

        // In seed mode, OTP is always 123456 — no actual SMS sent
        res.json({ success: true, is_new, message: is_new ? "Hesabınız oluşturuldu, OTP gönderildi" : "OTP gönderildi" })
    } catch (err: any) {
        console.error("send-otp error:", err?.message || err)
        res.status(500).json({ message: err?.message || "Sunucu hatası", type: "send_otp_error" })
    }
}
