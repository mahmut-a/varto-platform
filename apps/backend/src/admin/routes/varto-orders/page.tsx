import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ShoppingBag } from "@medusajs/icons"
import { Container, Heading, Table, Badge, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

const STATUS_MAP: Record<string, { label: string; color: "green" | "blue" | "orange" | "red" | "grey" | "purple" }> = {
    pending: { label: "Bekliyor", color: "orange" },
    confirmed: { label: "Onaylandı", color: "blue" },
    preparing: { label: "Hazırlanıyor", color: "purple" },
    ready: { label: "Hazır", color: "blue" },
    assigned: { label: "Atandı", color: "purple" },
    accepted: { label: "Kabul Edildi", color: "blue" },
    delivering: { label: "Teslimatta", color: "orange" },
    delivered: { label: "Teslim Edildi", color: "green" },
    cancelled: { label: "İptal", color: "red" },
}

const VartoOrdersPage = () => {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/admin/varto-orders", { credentials: "include" })
            .then((r) => r.json())
            .then((d) => setOrders(d.varto_orders || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <Heading level="h2">Varto Siparişleri</Heading>
                <Text size="small" className="text-ui-fg-muted">
                    {orders.length} sipariş
                </Text>
            </div>
            <div className="px-6 py-4">
                {loading ? (
                    <Text className="text-ui-fg-muted">Yükleniyor...</Text>
                ) : orders.length === 0 ? (
                    <Text className="text-ui-fg-muted">Henüz sipariş yok.</Text>
                ) : (
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Sipariş No</Table.HeaderCell>
                                <Table.HeaderCell>Durum</Table.HeaderCell>
                                <Table.HeaderCell>Teslimat Adresi</Table.HeaderCell>
                                <Table.HeaderCell>Ödeme</Table.HeaderCell>
                                <Table.HeaderCell>Notlar</Table.HeaderCell>
                                <Table.HeaderCell>Tarih</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {orders.map((o: any) => {
                                const status = STATUS_MAP[o.varto_status] || { label: o.varto_status, color: "grey" as const }
                                const addr = o.delivery_address || {}
                                return (
                                    <Table.Row key={o.id}>
                                        <Table.Cell>
                                            <Text size="small" className="font-mono" weight="plus">
                                                #{o.id?.slice(-6).toUpperCase()}
                                            </Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Badge color={status.color} size="2xsmall">{status.label}</Badge>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Text size="small" className="text-ui-fg-muted">
                                                {[addr.neighborhood, addr.street, addr.building].filter(Boolean).join(", ")}
                                            </Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Text size="small">{o.payment_method?.toUpperCase()}</Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Text size="small" className="text-ui-fg-muted max-w-[200px] truncate">
                                                {o.delivery_notes || "—"}
                                            </Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Text size="small" className="text-ui-fg-muted">
                                                {new Date(o.created_at).toLocaleDateString("tr-TR")}
                                            </Text>
                                        </Table.Cell>
                                    </Table.Row>
                                )
                            })}
                        </Table.Body>
                    </Table>
                )}
            </div>
        </Container>
    )
}

export const config = defineRouteConfig({
    label: "Varto Siparişleri",
    icon: ShoppingBag,
})

export default VartoOrdersPage
