import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ORDER_EXTENSION_MODULE } from "../../../modules/order-extension"
import OrderExtensionModuleService from "../../../modules/order-extension/service"
import { VENDOR_MODULE } from "../../../modules/vendor"
import VendorModuleService from "../../../modules/vendor/service"
import { VARTO_NOTIFICATION_MODULE } from "../../../modules/varto-notification"
import VartoNotificationModuleService from "../../../modules/varto-notification/service"

// ── Expo Push Notification gönderici ──
async function sendExpoPushNotification(pushToken: string, title: string, body: string, data?: any) {
    try {
        const response = await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Accept-Encoding": "gzip, deflate",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                to: pushToken,
                sound: "notification_sound",
                title,
                body,
                data: data || {},
                priority: "high",
                channelId: "orders",
            }),
        })
        const result = await response.json()
        console.log("Expo push notification gönderildi:", result)
        return result
    } catch (err: any) {
        console.error("Expo push notification hatası:", err?.message || err)
        return null
    }
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const orderExtService: OrderExtensionModuleService = req.scope.resolve(ORDER_EXTENSION_MODULE)
        const filters: any = {}

        if (req.query.customer_id) {
            filters.customer_id = req.query.customer_id
        }

        const varto_orders = await orderExtService.listVartoOrders(filters, {
            relations: ["items"],
            order: { created_at: "DESC" },
        })
        res.json({ varto_orders })
    } catch (err: any) {
        console.error("Store list orders error:", err?.message || err)
        res.status(500).json({ message: err?.message || "Siparişler yüklenemedi" })
    }
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const orderExtService: OrderExtensionModuleService = req.scope.resolve(ORDER_EXTENSION_MODULE)
        const body = req.body as any

        // Validasyon
        if (!body.vendor_id) {
            return res.status(400).json({ message: "İşletme (vendor_id) zorunludur" })
        }
        if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
            return res.status(400).json({ message: "En az bir ürün eklemelisiniz" })
        }

        // Sipariş oluştur
        const varto_order = await orderExtService.createVartoOrders({
            vendor_id: body.vendor_id,
            customer_id: body.customer_id || null,
            customer_phone: body.customer_phone || null,
            delivery_address: body.delivery_address || {},
            delivery_notes: body.delivery_notes || null,
            delivery_fee: body.delivery_fee || 0,
            payment_method: body.payment_method || "iban",
            iban_info: body.iban_info || null,
            varto_status: "pending",
        })

        // Sipariş kalemlerini oluştur
        for (const item of body.items) {
            if (!item.product_name) continue
            await orderExtService.createVartoOrderItems({
                varto_order_id: varto_order.id,
                product_name: item.product_name,
                quantity: item.quantity || 1,
                unit_price: item.unit_price || 0,
                total_price: (item.unit_price || 0) * (item.quantity || 1),
                notes: item.notes || null,
            })
        }

        // Siparişi kalemlerle birlikte tekrar getir
        const order = await orderExtService.retrieveVartoOrder(varto_order.id, {
            relations: ["items"],
        })

        // ── Satıcıya bildirim gönder ──
        try {
            const vendorService: VendorModuleService = req.scope.resolve(VENDOR_MODULE)
            const notificationService: VartoNotificationModuleService = req.scope.resolve(VARTO_NOTIFICATION_MODULE)

            // Vendor bilgilerini getir (push_token için)
            const vendor = await vendorService.retrieveVendor(body.vendor_id)

            // Fiyat ve içerik hesaplamalarını body.items'dan yap
            const itemCount = body.items.length
            const itemsTotal = body.items.reduce((sum: number, i: any) =>
                sum + (Number(i.unit_price) || 0) * (Number(i.quantity) || 1), 0)
            const deliveryFee = Number(body.delivery_fee) || 0
            const grandTotal = itemsTotal + deliveryFee

            // Ürün isimlerini listele (maks 3 ürün göster)
            const itemNames = body.items
                .slice(0, 3)
                .map((i: any) => `${i.product_name} x${i.quantity || 1}`)
                .join(", ")
            const moreText = body.items.length > 3 ? ` +${body.items.length - 3} ürün daha` : ""

            const notificationTitle = "🛒 Yeni Sipariş!"
            const notificationBody = `${itemNames}${moreText}\n💰 Toplam: ₺${grandTotal.toFixed(2)} — Sipariş onayınızı bekliyor`

            // Expo Push Notification gönder (DB kaydından BAĞIMSIZ)
            if (vendor.push_token) {
                try {
                    await sendExpoPushNotification(
                        vendor.push_token,
                        notificationTitle,
                        notificationBody,
                        {
                            type: "new_order",
                            order_id: order.id,
                            item_count: itemCount,
                            total: grandTotal,
                        }
                    )
                } catch (pushErr: any) {
                    console.error("Push notification gönderme hatası:", pushErr?.message || pushErr)
                }
            } else {
                console.log(`Vendor ${body.vendor_id} için push_token bulunamadı`)
            }

            // Veritabanına bildirim kaydet (Push gönderiminden BAĞIMSIZ)
            try {
                await notificationService.createVartoNotifications({
                    title: notificationTitle,
                    message: notificationBody,
                    type: "order",
                    recipient_type: "vendor",
                    recipient_id: body.vendor_id,
                    is_read: false,
                    reference_id: order.id,
                    reference_type: "varto_order",
                })
            } catch (dbErr: any) {
                console.error("Bildirim DB kayıt hatası:", dbErr?.message || dbErr)
            }
        } catch (notifErr: any) {
            // Genel hata — sipariş oluşturmayı etkilemez
            console.error("Bildirim gönderme hatası:", notifErr?.message || notifErr)
        }

        res.status(201).json({ varto_order: order })
    } catch (err: any) {
        console.error("Store create order error:", err?.message || err)
        res.status(500).json({
            message: err?.message || "Sipariş oluşturulamadı. Lütfen tekrar deneyin.",
            type: "order_create_error",
        })
    }
}
