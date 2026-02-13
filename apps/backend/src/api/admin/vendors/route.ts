import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { VENDOR_MODULE } from "../../../modules/vendor"
import VendorModuleService from "../../../modules/vendor/service"
import { Modules } from "@medusajs/framework/utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const vendorService: VendorModuleService = req.scope.resolve(VENDOR_MODULE)
        const vendors = await vendorService.listVendors()
        res.json({ vendors })
    } catch (err: any) {
        console.error("Admin list vendors error:", err?.message || err)
        res.status(500).json({ message: err?.message || "İşletmeler yüklenemedi" })
    }
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const vendorService: VendorModuleService = req.scope.resolve(VENDOR_MODULE)

        const { password, ...vendorData } = req.body as any

        // Validasyon
        if (!vendorData.name || !vendorData.slug || !vendorData.phone || !vendorData.address || !vendorData.category || !vendorData.iban) {
            return res.status(400).json({
                message: "Zorunlu alanlar: name, slug, phone, address, category, iban",
            })
        }

        let adminUserId: string | null = null

        // Eğer email ve password varsa, Medusa auth user oluştur
        if (vendorData.email && password) {
            try {
                const userService = req.scope.resolve(Modules.USER) as any
                const authService = req.scope.resolve(Modules.AUTH) as any

                // Medusa user oluştur
                const user = await userService.createUsers({ email: vendorData.email })
                adminUserId = user.id

                // Auth identity oluştur (emailpass provider ile)
                const authResult = await authService.register("emailpass", {
                    body: {
                        email: vendorData.email,
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
                console.error("Vendor auth user oluşturma hatası:", authErr?.message || authErr)
                // Auth user oluşturulamazsa yine de vendor oluştur
            }
        }

        // Vendor kaydı oluştur
        const vendor = await vendorService.createVendors({
            ...vendorData,
            admin_user_id: adminUserId,
        })

        res.status(201).json({ vendor })
    } catch (err: any) {
        console.error("Admin create vendor error:", err?.message || err)
        res.status(500).json({ message: err?.message || "İşletme oluşturulamadı" })
    }
}