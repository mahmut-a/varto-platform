import { ExecArgs } from "@medusajs/framework/types"
import { VENDOR_MODULE } from "../modules/vendor"
import { COURIER_MODULE } from "../modules/courier"
import { LISTING_MODULE } from "../modules/listing"
import { APPOINTMENT_MODULE } from "../modules/appointment"
import { ORDER_EXTENSION_MODULE } from "../modules/order-extension"
import { VARTO_NOTIFICATION_MODULE } from "../modules/varto-notification"
import VendorModuleService from "../modules/vendor/service"
import CourierModuleService from "../modules/courier/service"
import ListingModuleService from "../modules/listing/service"
import AppointmentModuleService from "../modules/appointment/service"
import OrderExtensionModuleService from "../modules/order-extension/service"
import VartoNotificationModuleService from "../modules/varto-notification/service"

export default async function seedVarto({ container }: ExecArgs) {
    console.log("🌱 Varto seed data yükleniyor...")

    // ── Vendors (İşletmeler) ──
    const vendorService: VendorModuleService = container.resolve(VENDOR_MODULE)

    const vendors = await vendorService.createVendors([
        {
            name: "Varto Kebap Salonu",
            slug: "varto-kebap",
            description: "Varto'nun en meşhur kebap salonu. Geleneksel Muş kebabı.",
            phone: "0555-111-2233",
            email: "info@vartokebap.com",
            address: "Cumhuriyet Mah. Atatürk Cad. No:15, Varto/Muş",
            category: "restaurant",
            iban: "TR33 0006 1005 1978 6457 8413 26",
            is_active: true,
            opening_hours: {
                mon: { open: "08:00", close: "22:00" },
                tue: { open: "08:00", close: "22:00" },
                wed: { open: "08:00", close: "22:00" },
                thu: { open: "08:00", close: "22:00" },
                fri: { open: "08:00", close: "23:00" },
                sat: { open: "09:00", close: "23:00" },
                sun: { open: "09:00", close: "21:00" },
            },
        },
        {
            name: "Varto Market",
            slug: "varto-market",
            description: "Günlük taze gıda ve market ürünleri.",
            phone: "0555-222-3344",
            address: "Yeni Mah. İstasyon Cad. No:8, Varto/Muş",
            category: "market",
            iban: "TR76 0001 0012 3456 7890 1234 56",
            is_active: true,
            opening_hours: {
                mon: { open: "07:00", close: "21:00" },
                tue: { open: "07:00", close: "21:00" },
                wed: { open: "07:00", close: "21:00" },
                thu: { open: "07:00", close: "21:00" },
                fri: { open: "07:00", close: "21:00" },
                sat: { open: "07:00", close: "21:00" },
                sun: { open: "08:00", close: "20:00" },
            },
        },
        {
            name: "Varto Eczanesi",
            slug: "varto-eczanesi",
            description: "Reçeteli ve reçetesiz ilaçlar, kozmetik ürünleri.",
            phone: "0555-333-4455",
            address: "Cumhuriyet Mah. Hastane Sok. No:3, Varto/Muş",
            category: "pharmacy",
            iban: "TR12 0006 2000 0006 2000 1234 56",
            is_active: true,
            opening_hours: {
                mon: { open: "08:30", close: "19:00" },
                tue: { open: "08:30", close: "19:00" },
                wed: { open: "08:30", close: "19:00" },
                thu: { open: "08:30", close: "19:00" },
                fri: { open: "08:30", close: "19:00" },
                sat: { open: "09:00", close: "17:00" },
                sun: null,
            },
        },
    ])

    console.log(`✅ ${vendors.length} işletme oluşturuldu`)

    // ── Couriers (Kuryeler) ──
    const courierService: CourierModuleService = container.resolve(COURIER_MODULE)

    const couriers = await courierService.createCouriers([
        {
            name: "Ahmet Yılmaz",
            phone: "0555-444-5566",
            email: "ahmet@varto.com",
            is_active: true,
            is_available: true,
            vehicle_type: "motorcycle",
        },
        {
            name: "Mehmet Demir",
            phone: "0555-555-6677",
            is_active: true,
            is_available: true,
            vehicle_type: "car",
        },
    ])

    console.log(`✅ ${couriers.length} kurye oluşturuldu`)

    // ── Listings (İlanlar) ──
    const listingService: ListingModuleService = container.resolve(LISTING_MODULE)

    const listings = await listingService.createListings([
        {
            title: "Kiralık 2+1 Daire - Merkez",
            description: "Cumhuriyet Mahallesinde 2+1 kombili daire. 3. kat, asansörlü.",
            category: "rental",
            price: 5000,
            currency: "TRY",
            contact_phone: "0555-666-7788",
            contact_name: "Ali Kaya",
            location: "Cumhuriyet Mah., Varto/Muş",
            status: "approved",
        },
        {
            title: "Satılık Arsa - 500m²",
            description: "Yeni Mahallede imarlı 500m² arsa. Yola cepheli.",
            category: "sale",
            price: 250000,
            currency: "TRY",
            contact_phone: "0555-777-8899",
            contact_name: "Hasan Çelik",
            location: "Yeni Mah., Varto/Muş",
            status: "approved",
        },
        {
            title: "Garson Aranıyor",
            description: "Varto Kebap Salonuna deneyimli garson aranmaktadır. Yemek + yol dahil.",
            category: "job",
            contact_phone: "0555-111-2233",
            contact_name: "Varto Kebap",
            location: "Cumhuriyet Mah., Varto/Muş",
            status: "pending",
        },
    ])

    console.log(`✅ ${listings.length} ilan oluşturuldu`)

    // ── Appointments (Randevular) ──
    const appointmentService: AppointmentModuleService = container.resolve(APPOINTMENT_MODULE)

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)

    const dayAfter = new Date()
    dayAfter.setDate(dayAfter.getDate() + 2)
    dayAfter.setHours(14, 30, 0, 0)

    const appointments = await appointmentService.createAppointments([
        {
            vendor_id: vendors[0].id,
            customer_id: "test-customer-1",
            service_name: "Saç Kesimi",
            date: tomorrow,
            duration_minutes: 30,
            status: "confirmed",
        },
        {
            vendor_id: vendors[0].id,
            customer_id: "test-customer-2",
            service_name: "Sakal Tıraşı",
            date: dayAfter,
            duration_minutes: 20,
            status: "pending",
        },
    ])

    console.log(`✅ ${appointments.length} randevu oluşturuldu`)

    // ── VartoOrders (Siparişler) ──
    const orderExtService: OrderExtensionModuleService = container.resolve(ORDER_EXTENSION_MODULE)

    const orders = await orderExtService.createVartoOrders([
        {
            vendor_id: vendors[0].id,
            courier_id: couriers[0].id,
            varto_status: "delivering",
            delivery_address: {
                neighborhood: "Cumhuriyet Mah.",
                street: "Atatürk Cad.",
                building: "No:25",
                apartment: "Daire 3",
            },
            delivery_notes: "Kapıda ödeme, zile 2 kez basın.",
            payment_method: "iban",
            iban_info: "TR33 0006 1005 1978 6457 8413 26",
        },
        {
            vendor_id: vendors[1].id,
            varto_status: "pending",
            delivery_address: {
                neighborhood: "Yeni Mah.",
                street: "İstasyon Cad.",
                building: "No:12",
                apartment: "Daire 1",
            },
            payment_method: "iban",
            iban_info: "TR76 0001 0012 3456 7890 1234 56",
        },
    ])

    console.log(`✅ ${orders.length} sipariş oluşturuldu`)

    // ── Notifications (Bildirimler) ──
    const notifService: VartoNotificationModuleService = container.resolve(VARTO_NOTIFICATION_MODULE)

    const notifications = await notifService.createVartoNotifications([
        {
            title: "Yeni Sipariş",
            message: "Varto Kebap Salonundan yeni bir sipariş geldi!",
            type: "order",
            recipient_type: "vendor",
            recipient_id: vendors[0].id,
            is_read: false,
            reference_id: orders[0].id,
            reference_type: "varto_order",
        },
        {
            title: "Siparişiniz Yolda",
            message: "Kurye Ahmet siparişinizi teslim etmek üzere yola çıktı.",
            type: "order",
            recipient_type: "customer",
            recipient_id: "test-customer-1",
            is_read: false,
            reference_id: orders[0].id,
            reference_type: "varto_order",
        },
    ])

    console.log(`✅ ${notifications.length} bildirim oluşturuldu`)

    console.log("\n🎉 Varto seed data başarıyla yüklendi!")
    console.log("   - 3 İşletme")
    console.log("   - 2 Kurye")
    console.log("   - 3 İlan")
    console.log("   - 2 Randevu")
    console.log("   - 2 Sipariş")
    console.log("   - 2 Bildirim")
}
