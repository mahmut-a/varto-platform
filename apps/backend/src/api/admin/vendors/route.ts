import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { VENDOR_MODULE } from "../../../modules/vendor"
import VendorModuleService from "../../../modules/vendor/service"
import { Modules } from "@medusajs/framework/utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const vendorService: VendorModuleService = req.scope.resolve(VENDOR_MODULE)
    const vendors = await vendorService.listVendors()
    res.json({ vendors })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const vendorService: VendorModuleService = req.scope.resolve(VENDOR_MODULE)

    const { password, ...vendorData } = req.body as any

    // 1. Vendor kaydı oluştur
    const vendor = await vendorService.createVendors(vendorData)

    // 2. Eğer email ve password varsa, Medusa auth user oluştur
    // (Vendor app'ten giriş yapabilmesi için gerekli)
    if (vendorData.email && password) {
        try {
            const userService = req.scope.resolve(Modules.USER) as any
            const authService = req.scope.resolve(Modules.AUTH) as any

            // Medusa user oluştur
            const user = await userService.createUsers({ email: vendorData.email })

            // Auth identity oluştur (emailpass provider ile - şifre otomatik hash'lenir)
            const { authIdentity, error } = await authService.register("emailpass", {
                body: {
                    email: vendorData.email,
                    password,
                },
            })

            if (error) {
                console.error("Auth register hatası:", error)
            } else if (authIdentity) {
                // User ile auth identity arasında bağlantı kur
                await authService.updateAuthIdentities({
                    id: authIdentity.id,
                    app_metadata: {
                        user_id: user.id,
                    },
                })
            }
        } catch (authErr: any) {
            console.error("Vendor auth user oluşturma hatası:", authErr?.message || authErr)
            // Vendor yine de oluşturuldu, sadece auth başarısız oldu - log'a yaz
        }
    }

    res.status(201).json({ vendor })
}
