import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import jwt from "jsonwebtoken"
import { CUSTOMER_MODULE } from "../../../../modules/customer"
import CustomerModuleService from "../../../../modules/customer/service"

const SEED_OTP = "123456"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const customerService: CustomerModuleService = req.scope.resolve(CUSTOMER_MODULE)
    const { phone, otp } = req.body as any

    if (!phone || !otp) {
        return res.status(400).json({ message: "Telefon ve OTP zorunludur" })
    }

    // Seed mode: only 123456 is valid
    if (otp !== SEED_OTP) {
        return res.status(401).json({ message: "Geçersiz OTP kodu" })
    }

    // Find customer
    const customers = await customerService.listCustomers({ phone })
    if (!customers || customers.length === 0) {
        return res.status(404).json({ message: "Bu numaraya kayıtlı kullanıcı bulunamadı" })
    }

    const customer = customers[0]

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET || "supersecret"
    const token = jwt.sign(
        { customer_id: customer.id, phone: customer.phone },
        jwtSecret,
        { expiresIn: "30d" }
    )

    res.json({ token, customer })
}
