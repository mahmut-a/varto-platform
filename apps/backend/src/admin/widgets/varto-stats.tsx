import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge } from "@medusajs/ui"
import { useEffect, useState } from "react"

interface Stats {
    vendors: { total: number; active: number }
    couriers: { total: number; active: number }
    orders: { total: number; statusDistribution: Record<string, number> }
    customers: { total: number; active: number }
    listings: { total: number; pending: number }
    appointments: { total: number; pending: number }
    notifications: { unread: number }
}

const STATUS_LABELS: Record<string, string> = {
    pending: "Bekliyor",
    confirmed: "Onaylandı",
    preparing: "Hazırlanıyor",
    ready: "Hazır",
    assigned: "Atandı",
    accepted: "Kabul Edildi",
    delivering: "Teslimatta",
    delivered: "Teslim Edildi",
    cancelled: "İptal",
}

const VartoStatsWidget = () => {
    const [stats, setStats] = useState<Stats | null>(null)
    const [recentOrders, setRecentOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/admin/custom", { credentials: "include" })
            .then((r) => r.json())
            .then((d) => {
                setStats(d.stats || null)
                setRecentOrders(d.recentOrders || [])
            })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    if (loading || !stats) return null

    const cards = [
        { label: "İşletme", total: stats.vendors.total, sub: `${stats.vendors.active} aktif`, color: "bg-blue-50 border-blue-200" },
        { label: "Kurye", total: stats.couriers.total, sub: `${stats.couriers.active} aktif`, color: "bg-green-50 border-green-200" },
        { label: "Sipariş", total: stats.orders.total, sub: Object.keys(stats.orders.statusDistribution).length + " farklı durum", color: "bg-orange-50 border-orange-200" },
        { label: "Müşteri", total: stats.customers.total, sub: `${stats.customers.active} aktif`, color: "bg-purple-50 border-purple-200" },
        { label: "İlan", total: stats.listings.total, sub: `${stats.listings.pending} bekliyor`, color: "bg-yellow-50 border-yellow-200" },
        { label: "Randevu", total: stats.appointments.total, sub: `${stats.appointments.pending} bekliyor`, color: "bg-pink-50 border-pink-200" },
    ]

    return (
        <Container className="divide-y p-0">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                    <Heading level="h2">Varto Platform</Heading>
                    {stats.notifications.unread > 0 && (
                        <Badge color="orange" size="2xsmall">{stats.notifications.unread} okunmamış bildirim</Badge>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-6 divide-x">
                {cards.map((card) => (
                    <div key={card.label} className="flex flex-col items-center py-4 gap-1">
                        <Text size="xlarge" weight="plus">{card.total}</Text>
                        <Text size="small" weight="plus">{card.label}</Text>
                        <Text size="xsmall" className="text-ui-fg-muted">{card.sub}</Text>
                    </div>
                ))}
            </div>

            {/* Order Status Distribution */}
            {Object.keys(stats.orders.statusDistribution).length > 0 && (
                <div className="px-6 py-4">
                    <Text size="small" weight="plus" className="mb-3 block">Sipariş Durumu Dağılımı</Text>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(stats.orders.statusDistribution).map(([status, count]) => (
                            <Badge key={status} color={status === "delivered" ? "green" : status === "cancelled" ? "red" : status === "pending" ? "orange" : "blue"} size="2xsmall">
                                {STATUS_LABELS[status] || status}: {count}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Orders */}
            {recentOrders.length > 0 && (
                <div className="px-6 py-4">
                    <Text size="small" weight="plus" className="mb-3 block">Son Siparişler</Text>
                    <div className="flex flex-col gap-2">
                        {recentOrders.map((o: any) => (
                            <div key={o.id} className="flex items-center justify-between rounded-lg border border-ui-border-base p-3">
                                <div className="flex items-center gap-3">
                                    <Text size="small" className="font-mono" weight="plus">#{o.id?.slice(-6).toUpperCase()}</Text>
                                    <Badge color={o.varto_status === "delivered" ? "green" : o.varto_status === "cancelled" ? "red" : o.varto_status === "pending" ? "orange" : "blue"} size="2xsmall">
                                        {STATUS_LABELS[o.varto_status] || o.varto_status}
                                    </Badge>
                                    {o.customer_name && <Text size="small" className="text-ui-fg-muted">{o.customer_name}</Text>}
                                </div>
                                <div className="flex items-center gap-3">
                                    <Text size="small" className="text-ui-fg-muted">{o.payment_method?.toUpperCase()}</Text>
                                    <Text size="small" className="text-ui-fg-muted">{new Date(o.created_at).toLocaleDateString("tr-TR")}</Text>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Links */}
            <div className="px-6 py-4">
                <Text size="small" weight="plus" className="mb-3 block">Hızlı Erişim</Text>
                <div className="flex flex-wrap gap-2">
                    <a href="/app/vendors" className="inline-flex items-center gap-1 rounded-md bg-ui-bg-subtle px-3 py-1.5 text-sm text-ui-fg-base hover:bg-ui-bg-subtle-hover transition-colors">İşletmeler</a>
                    <a href="/app/couriers" className="inline-flex items-center gap-1 rounded-md bg-ui-bg-subtle px-3 py-1.5 text-sm text-ui-fg-base hover:bg-ui-bg-subtle-hover transition-colors">Kuryeler</a>
                    <a href="/app/varto-orders" className="inline-flex items-center gap-1 rounded-md bg-ui-bg-subtle px-3 py-1.5 text-sm text-ui-fg-base hover:bg-ui-bg-subtle-hover transition-colors">Siparişler</a>
                    <a href="/app/customers" className="inline-flex items-center gap-1 rounded-md bg-ui-bg-subtle px-3 py-1.5 text-sm text-ui-fg-base hover:bg-ui-bg-subtle-hover transition-colors">Müşteriler</a>
                    <a href="/app/listings" className="inline-flex items-center gap-1 rounded-md bg-ui-bg-subtle px-3 py-1.5 text-sm text-ui-fg-base hover:bg-ui-bg-subtle-hover transition-colors">İlanlar</a>
                    <a href="/app/appointments" className="inline-flex items-center gap-1 rounded-md bg-ui-bg-subtle px-3 py-1.5 text-sm text-ui-fg-base hover:bg-ui-bg-subtle-hover transition-colors">Randevular</a>
                    <a href="/app/vendor-products" className="inline-flex items-center gap-1 rounded-md bg-ui-bg-subtle px-3 py-1.5 text-sm text-ui-fg-base hover:bg-ui-bg-subtle-hover transition-colors">Ürünler</a>
                    <a href="/app/notifications" className="inline-flex items-center gap-1 rounded-md bg-ui-bg-subtle px-3 py-1.5 text-sm text-ui-fg-base hover:bg-ui-bg-subtle-hover transition-colors">Bildirimler</a>
                </div>
            </div>
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "order.list.before",
})

export default VartoStatsWidget
