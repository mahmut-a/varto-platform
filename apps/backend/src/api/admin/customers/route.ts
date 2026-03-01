import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CUSTOMER_MODULE } from "../../../modules/customer"
import CustomerModuleService from "../../../modules/customer/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const customerService: CustomerModuleService = req.scope.resolve(CUSTOMER_MODULE)
        const filters: any = {}
        if (req.query.is_active !== undefined) {
            filters.is_active = req.query.is_active === "true"
        }
        const customers = await customerService.listCustomers(filters, {
            order: { created_at: "DESC" },
        })
        res.json({ customers })
    } catch (err: any) {
        console.error("Admin list customers error:", err?.message || err)
        res.status(500).json({ message: err?.message || "Müşteriler yüklenemedi" })
    }
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const customerService: CustomerModuleService = req.scope.resolve(CUSTOMER_MODULE)
        const body = req.body as any
        if (!body.phone) {
            return res.status(400).json({ message: "Zorunlu alan: phone" })
        }
        const customer = await customerService.createCustomers(body)
        res.status(201).json({ customer })
    } catch (err: any) {
        console.error("Admin create customer error:", err?.message || err)
        res.status(500).json({ message: err?.message || "Müşteri oluşturulamadı" })
    }
}
