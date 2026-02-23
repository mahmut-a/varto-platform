import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { COURIER_MODULE } from "../../../../modules/courier"
import CourierModuleService from "../../../../modules/courier/service"
import { Modules } from "@medusajs/framework/utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const courierService: CourierModuleService = req.scope.resolve(COURIER_MODULE)
    const courier = await courierService.retrieveCourier(req.params.id)
    res.json({ courier })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const courierService: CourierModuleService = req.scope.resolve(COURIER_MODULE)
        const { password, ...updateData } = req.body as any

        // Eğer kurye henüz bir auth hesabına bağlı değilse ve email+password verilmişse
        // yeni auth hesabı oluştur
        if (password && updateData.email) {
            const existing = await courierService.retrieveCourier(req.params.id)
            if (!existing.admin_user_id) {
                try {
                    const userService = req.scope.resolve(Modules.USER) as any
                    const authService = req.scope.resolve(Modules.AUTH) as any

                    const user = await userService.createUsers({ email: updateData.email })
                    updateData.admin_user_id = user.id

                    const authResult = await authService.register("emailpass", {
                        body: {
                            email: updateData.email,
                            password,
                        },
                    })

                    if (authResult.authIdentity) {
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
        }

        const courier = await courierService.updateCouriers({
            id: req.params.id,
            ...updateData,
        })
        res.json({ courier })
    } catch (err: any) {
        console.error("Admin update courier error:", err?.message || err)
        res.status(500).json({ message: err?.message || "Kurye güncellenemedi" })
    }
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
    const courierService: CourierModuleService = req.scope.resolve(COURIER_MODULE)
    await courierService.deleteCouriers(req.params.id)
    res.status(200).json({ id: req.params.id, deleted: true })
}
