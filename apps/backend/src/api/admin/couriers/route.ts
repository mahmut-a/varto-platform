import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { COURIER_MODULE } from "../../../modules/courier"
import CourierModuleService from "../../../modules/courier/service"
import { Modules } from "@medusajs/framework/utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const courierService: CourierModuleService = req.scope.resolve(COURIER_MODULE)
    const couriers = await courierService.listCouriers()
    res.json({ couriers })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const courierService: CourierModuleService = req.scope.resolve(COURIER_MODULE)

        const { password, ...courierData } = req.body as any

        // Validasyon
        if (!courierData.name || !courierData.phone || !courierData.vehicle_type) {
            return res.status(400).json({
                message: "Zorunlu alanlar: name, phone, vehicle_type",
            })
        }

        let adminUserId: string | null = null

        // Eğer email ve password varsa, Medusa auth user oluştur
        if (courierData.email && password) {
            try {
                const userService = req.scope.resolve(Modules.USER) as any
                const authService = req.scope.resolve(Modules.AUTH) as any

                // Medusa user oluştur
                const user = await userService.createUsers({ email: courierData.email })
                adminUserId = user.id

                // Auth identity oluştur (emailpass provider ile)
                const authResult = await authService.register("emailpass", {
                    body: {
                        email: courierData.email,
                        password,
                    },
                })

                if (authResult.error) {
                    console.error("Auth register hatası:", authResult.error)
                } else if (authResult.authIdentity) {
                    // User ile auth identity arasında bağlantı kur
                    await authService.updateAuthIdentities({
                        id: authResult.authIdentity.id,
                        app_metadata: {
                            user_id: user.id,
                        },
                    })
                }
            } catch (authErr: any) {
                console.error("Courier auth user oluşturma hatası:", authErr?.message || authErr)
            }
        }

        // Courier kaydı oluştur
        const courier = await courierService.createCouriers({
            ...courierData,
            admin_user_id: adminUserId,
        })

        res.status(201).json({ courier })
    } catch (err: any) {
        console.error("Admin create courier error:", err?.message || err)
        res.status(500).json({ message: err?.message || "Kurye oluşturulamadı" })
    }
}
