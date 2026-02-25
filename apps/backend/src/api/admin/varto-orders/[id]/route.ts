import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ORDER_EXTENSION_MODULE } from "../../../../modules/order-extension"
import OrderExtensionModuleService from "../../../../modules/order-extension/service"
import { COURIER_MODULE } from "../../../../modules/courier"
import CourierModuleService from "../../../../modules/courier/service"
import { VENDOR_MODULE } from "../../../../modules/vendor"
import VendorModuleService from "../../../../modules/vendor/service"
import { VARTO_NOTIFICATION_MODULE } from "../../../../modules/varto-notification"
import VartoNotificationModuleService from "../../../../modules/varto-notification/service"
import { CUSTOMER_MODULE } from "../../../../modules/customer"
import CustomerModuleService from "../../../../modules/customer/service"

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
        const varto_order = await orderExtService.retrieveVartoOrder(req.params.id, {
            relations: ["items"],
        })
        res.json({ varto_order })
    } catch (err: any) {
        console.error("Admin get order error:", err?.message || err)
        res.status(404).json({ message: "Sipariş bulunamadı" })
    }
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const orderExtService: OrderExtensionModuleService = req.scope.resolve(ORDER_EXTENSION_MODULE)
        const body = req.body as any

        // Mevcut siparişi al (önceki durumu kontrol etmek için)
        const existingOrder = await orderExtService.retrieveVartoOrder(req.params.id, {
            relations: ["items"],
        })
        const previousStatus = existingOrder?.varto_status

        // Sadece izin verilen alanları güncelle
        const updateData: any = { id: req.params.id }
        if (body.varto_status) updateData.varto_status = body.varto_status
        if (body.courier_id !== undefined) updateData.courier_id = body.courier_id
        if (body.verbal_confirmation !== undefined) updateData.verbal_confirmation = body.verbal_confirmation
        if (body.delivery_notes !== undefined) updateData.delivery_notes = body.delivery_notes
        if (body.metadata !== undefined) updateData.metadata = body.metadata

        const varto_order = await orderExtService.updateVartoOrders(updateData)

        // Güncel halini getir
        const updated = await orderExtService.retrieveVartoOrder(req.params.id, {
            relations: ["items"],
        })

        // ── Sipariş onaylandığında kuryeye bildirim gönder ──
        if (body.varto_status === "confirmed" && previousStatus !== "confirmed") {
            try {
                const courierService: CourierModuleService = req.scope.resolve(COURIER_MODULE)
                const vendorService: VendorModuleService = req.scope.resolve(VENDOR_MODULE)
                const notificationService: VartoNotificationModuleService = req.scope.resolve(VARTO_NOTIFICATION_MODULE)

                // Vendor bilgisini al
                let vendorName = "İşletme"
                try {
                    const vendor = await vendorService.retrieveVendor(updated.vendor_id)
                    vendorName = vendor.name || "İşletme"
                } catch (_) { }

                // Fiyat hesapla
                const itemsTotal = (updated.items || []).reduce(
                    (sum: number, i: any) => sum + (Number(i.total_price) || 0), 0
                )
                const deliveryFee = Number(updated.delivery_fee) || 0
                const grandTotal = itemsTotal + deliveryFee
                const itemCount = (updated.items || []).length

                // Ürün isimleri
                const itemNames = (updated.items || [])
                    .slice(0, 3)
                    .map((i: any) => `${i.product_name} x${i.quantity || 1}`)
                    .join(", ")
                const moreText = itemCount > 3 ? ` +${itemCount - 3} ürün daha` : ""

                // Teslimat adresi
                const addr: string = typeof updated.delivery_address === "object"
                    ? ((updated.delivery_address as any)?.address || "")
                    : (updated.delivery_address as string || "")
                const shortAddr = addr.length > 50 ? addr.substring(0, 50) + "..." : addr

                const notificationTitle = "🚀 Yeni Teslimat!"
                const notificationBody = `${vendorName} — ${itemNames}${moreText}\n📍 ${shortAddr}\n💰 Toplam: ₺${grandTotal.toFixed(2)}`

                // Tüm aktif kuryeları al
                const couriers = await courierService.listCouriers({
                    is_active: true,
                })

                // Her kuryeye bildirim gönder
                for (const courier of couriers) {
                    // Push notification gönder
                    if (courier.push_token) {
                        try {
                            await sendExpoPushNotification(
                                courier.push_token,
                                notificationTitle,
                                notificationBody,
                                {
                                    type: "order_confirmed",
                                    order_id: updated.id,
                                    vendor_name: vendorName,
                                    item_count: itemCount,
                                    total: grandTotal,
                                }
                            )
                        } catch (pushErr: any) {
                            console.error(`Courier ${courier.id} push hatası:`, pushErr?.message || pushErr)
                        }
                    }

                    // DB'ye bildirim kaydet
                    try {
                        await notificationService.createVartoNotifications({
                            title: notificationTitle,
                            message: notificationBody,
                            type: "order",
                            recipient_type: "courier",
                            recipient_id: courier.id,
                            is_read: false,
                            reference_id: updated.id,
                            reference_type: "varto_order",
                        })
                    } catch (dbErr: any) {
                        console.error(`Courier ${courier.id} bildirim DB hatası:`, dbErr?.message || dbErr)
                    }
                }

                console.log(`Sipariş ${updated.id} onaylandı, ${couriers.length} kuryeye bildirim gönderildi`)
            } catch (notifErr: any) {
                console.error("Kurye bildirim hatası:", notifErr?.message || notifErr)
            }
        }

        res.json({ varto_order: updated })

        // ── Teslimat başladığında müşteriye bildirim gönder ──
        if (body.varto_status === "delivering" && previousStatus !== "delivering") {
            try {
                const customerService: CustomerModuleService = req.scope.resolve(CUSTOMER_MODULE)
                const courierService: CourierModuleService = req.scope.resolve(COURIER_MODULE)
                const notificationService: VartoNotificationModuleService = req.scope.resolve(VARTO_NOTIFICATION_MODULE)

                if (updated.customer_id) {
                    const customer = await customerService.retrieveCustomer(updated.customer_id)
                    let courierName = "Kurye"
                    if (updated.courier_id) {
                        try {
                            const courier = await courierService.retrieveCourier(updated.courier_id)
                            courierName = courier.name || "Kurye"
                        } catch (_) { }
                    }

                    const notifTitle = "🛵 Siparişiniz Yolda!"
                    const notifBody = `${courierName} siparişinizi teslim etmek üzere yola çıktı.`

                    // Push notification gönder
                    if (customer.push_token) {
                        try {
                            await sendExpoPushNotification(
                                customer.push_token,
                                notifTitle,
                                notifBody,
                                {
                                    type: "delivery_started",
                                    order_id: updated.id,
                                    courier_name: courierName,
                                }
                            )
                        } catch (pushErr: any) {
                            console.error(`Customer ${customer.id} push hatası:`, pushErr?.message || pushErr)
                        }
                    }

                    // DB'ye bildirim kaydet
                    try {
                        await notificationService.createVartoNotifications({
                            title: notifTitle,
                            message: notifBody,
                            type: "order",
                            recipient_type: "customer",
                            recipient_id: customer.id,
                            is_read: false,
                            reference_id: updated.id,
                            reference_type: "varto_order",
                        })
                    } catch (dbErr: any) {
                        console.error(`Customer bildirim DB hatası:`, dbErr?.message || dbErr)
                    }

                    console.log(`Sipariş ${updated.id} teslimat başladı, müşteriye bildirim gönderildi`)
                }
            } catch (notifErr: any) {
                console.error("Müşteri bildirim hatası:", notifErr?.message || notifErr)
            }
        }

        // ── Sipariş teslim edildiğinde müşteriye bildirim gönder ──
        if (body.varto_status === "delivered" && previousStatus !== "delivered") {
            try {
                const customerService: CustomerModuleService = req.scope.resolve(CUSTOMER_MODULE)
                const notificationService: VartoNotificationModuleService = req.scope.resolve(VARTO_NOTIFICATION_MODULE)

                if (updated.customer_id) {
                    const customer = await customerService.retrieveCustomer(updated.customer_id)

                    const notifTitle = "✅ Siparişiniz Teslim Edildi!"
                    const notifBody = "Siparişiniz başarıyla teslim edildi. Afiyet olsun!"

                    if (customer.push_token) {
                        try {
                            await sendExpoPushNotification(
                                customer.push_token,
                                notifTitle,
                                notifBody,
                                {
                                    type: "delivery_completed",
                                    order_id: updated.id,
                                }
                            )
                        } catch (pushErr: any) {
                            console.error(`Customer ${customer.id} teslim push hatası:`, pushErr?.message || pushErr)
                        }
                    }

                    try {
                        await notificationService.createVartoNotifications({
                            title: notifTitle,
                            message: notifBody,
                            type: "order",
                            recipient_type: "customer",
                            recipient_id: customer.id,
                            is_read: false,
                            reference_id: updated.id,
                            reference_type: "varto_order",
                        })
                    } catch (dbErr: any) {
                        console.error(`Customer teslim bildirim DB hatası:`, dbErr?.message || dbErr)
                    }

                    console.log(`Sipariş ${updated.id} teslim edildi, müşteriye bildirim gönderildi`)
                }
            } catch (notifErr: any) {
                console.error("Müşteri teslim bildirim hatası:", notifErr?.message || notifErr)
            }
        }
    } catch (err: any) {
        console.error("Admin update order error:", err?.message || err)
        res.status(500).json({ message: err?.message || "Sipariş güncellenemedi" })
    }
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const orderExtService: OrderExtensionModuleService = req.scope.resolve(ORDER_EXTENSION_MODULE)
        await orderExtService.deleteVartoOrders(req.params.id)
        res.status(200).json({ id: req.params.id, deleted: true })
    } catch (err: any) {
        console.error("Admin delete order error:", err?.message || err)
        res.status(500).json({ message: err?.message || "Sipariş silinemedi" })
    }
}
