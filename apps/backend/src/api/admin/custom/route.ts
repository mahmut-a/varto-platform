import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { VENDOR_MODULE } from "../../../modules/vendor"
import { COURIER_MODULE } from "../../../modules/courier"
import { ORDER_EXTENSION_MODULE } from "../../../modules/order-extension"
import { CUSTOMER_MODULE } from "../../../modules/customer"
import { LISTING_MODULE } from "../../../modules/listing"
import { APPOINTMENT_MODULE } from "../../../modules/appointment"
import { VARTO_NOTIFICATION_MODULE } from "../../../modules/varto-notification"
import VendorModuleService from "../../../modules/vendor/service"
import CourierModuleService from "../../../modules/courier/service"
import OrderExtensionModuleService from "../../../modules/order-extension/service"
import CustomerModuleService from "../../../modules/customer/service"
import ListingModuleService from "../../../modules/listing/service"
import AppointmentModuleService from "../../../modules/appointment/service"
import VartoNotificationModuleService from "../../../modules/varto-notification/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const vendorService: VendorModuleService = req.scope.resolve(VENDOR_MODULE)
    const courierService: CourierModuleService = req.scope.resolve(COURIER_MODULE)
    const orderService: OrderExtensionModuleService = req.scope.resolve(ORDER_EXTENSION_MODULE)
    const customerService: CustomerModuleService = req.scope.resolve(CUSTOMER_MODULE)
    const listingService: ListingModuleService = req.scope.resolve(LISTING_MODULE)
    const appointmentService: AppointmentModuleService = req.scope.resolve(APPOINTMENT_MODULE)
    const notifService: VartoNotificationModuleService = req.scope.resolve(VARTO_NOTIFICATION_MODULE)

    const [vendors, couriers, orders, customers, listings, appointments, notifications] = await Promise.all([
      vendorService.listVendors(),
      courierService.listCouriers(),
      orderService.listVartoOrders({}, { order: { created_at: "DESC" }, take: 100 }),
      customerService.listCustomers(),
      listingService.listListings(),
      appointmentService.listAppointments(),
      notifService.listVartoNotifications({ is_read: false }),
    ])

    // Order status distribution
    const statusDistribution: Record<string, number> = {}
    orders.forEach((o: any) => {
      statusDistribution[o.varto_status] = (statusDistribution[o.varto_status] || 0) + 1
    })

    // Recent orders (last 5)
    const recentOrders = orders.slice(0, 5)

    // Active counts
    const activeVendors = vendors.filter((v: any) => v.is_active).length
    const activeCouriers = couriers.filter((c: any) => c.is_active).length
    const activeCustomers = customers.filter((c: any) => c.is_active).length

    // Pending items
    const pendingListings = listings.filter((l: any) => l.status === "pending").length
    const pendingAppointments = appointments.filter((a: any) => a.status === "pending").length

    res.json({
      stats: {
        vendors: { total: vendors.length, active: activeVendors },
        couriers: { total: couriers.length, active: activeCouriers },
        orders: { total: orders.length, statusDistribution },
        customers: { total: customers.length, active: activeCustomers },
        listings: { total: listings.length, pending: pendingListings },
        appointments: { total: appointments.length, pending: pendingAppointments },
        notifications: { unread: notifications.length },
      },
      recentOrders,
    })
  } catch (err: any) {
    console.error("Dashboard stats error:", err?.message || err)
    res.status(500).json({ message: err?.message || "İstatistikler yüklenemedi" })
  }
}
