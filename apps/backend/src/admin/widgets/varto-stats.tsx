import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

interface Stats {
    vendors: number
    couriers: number
    orders: number
    listings: number
    appointments: number
}

const VartoStatsWidget = () => {
    const [stats, setStats] = useState<Stats>({ vendors: 0, couriers: 0, orders: 0, listings: 0, appointments: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            fetch("/admin/vendors", { credentials: "include" }).then((r) => r.json()).catch(() => ({ vendors: [] })),
            fetch("/admin/couriers", { credentials: "include" }).then((r) => r.json()).catch(() => ({ couriers: [] })),
            fetch("/admin/varto-orders", { credentials: "include" }).then((r) => r.json()).catch(() => ({ varto_orders: [] })),
            fetch("/admin/listings", { credentials: "include" }).then((r) => r.json()).catch(() => ({ listings: [] })),
            fetch("/admin/appointments", { credentials: "include" }).then((r) => r.json()).catch(() => ({ appointments: [] })),
        ]).then(([v, c, o, l, a]) => {
            setStats({
                vendors: v.vendors?.length || 0,
                couriers: c.couriers?.length || 0,
                orders: o.varto_orders?.length || 0,
                listings: l.listings?.length || 0,
                appointments: a.appointments?.length || 0,
            })
        }).finally(() => setLoading(false))
    }, [])

    if (loading) return null

    const items = [
        { label: "İşletme", count: stats.vendors },
        { label: "Kurye", count: stats.couriers },
        { label: "Sipariş", count: stats.orders },
        { label: "İlan", count: stats.listings },
        { label: "Randevu", count: stats.appointments },
    ]

    return (
        <Container className="divide-y p-0">
            <div className="px-6 py-4">
                <Heading level="h2">Varto Platform</Heading>
            </div>
            <div className="grid grid-cols-5 divide-x">
                {items.map((item) => (
                    <div key={item.label} className="flex flex-col items-center py-4 gap-1">
                        <Text size="xlarge" weight="plus">{item.count}</Text>
                        <Text size="small" className="text-ui-fg-muted">{item.label}</Text>
                    </div>
                ))}
            </div>
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "order.list.before",
})

export default VartoStatsWidget
