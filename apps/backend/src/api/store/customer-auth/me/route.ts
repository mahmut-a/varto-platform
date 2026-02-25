import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import jwt from "jsonwebtoken"
import { CUSTOMER_MODULE } from "../../../../modules/customer"
import CustomerModuleService from "../../../../modules/customer/service"

const getCustomerFromToken = (req: MedusaRequest): { customer_id: string; phone: string } | null => {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith("Bearer ")) return null
    try {
        const jwtSecret = process.env.JWT_SECRET || "supersecret"
        return jwt.verify(authHeader.slice(7), jwtSecret) as any
    } catch {
        return null
    }
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const decoded = getCustomerFromToken(req)
    if (!decoded) {
        return res.status(401).json({ message: "Giriş yapmanız gerekiyor" })
    }

    const customerService: CustomerModuleService = req.scope.resolve(CUSTOMER_MODULE)
    try {
        const customer = await customerService.retrieveCustomer(decoded.customer_id)
        res.json({ customer })
    } catch {
        res.status(404).json({ message: "Kullanıcı bulunamadı" })
    }
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const decoded = getCustomerFromToken(req)
    if (!decoded) {
        return res.status(401).json({ message: "Giriş yapmanız gerekiyor" })
    }

    const customerService: CustomerModuleService = req.scope.resolve(CUSTOMER_MODULE)
    const body = req.body as any

    const customer = await (customerService as any).updateCustomers({
        id: decoded.customer_id,
        ...(body.name !== undefined && { name: body.name }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.address !== undefined && { address: body.address }),
    })

    res.json({ customer })
}
