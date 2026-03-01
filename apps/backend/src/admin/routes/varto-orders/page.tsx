import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ShoppingBag } from "@medusajs/icons"
import { Container, Heading, Table, Badge, Text, Button, FocusModal, Label, Input, Select, Textarea } from "@medusajs/ui"
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

const STATUS_OPTIONS = Object.entries(STATUS_MAP).map(([value, { label }]) => ({ value, label }))

const VartoOrdersPage = () => {
    const [orders, setOrders] = useState<any[]>([])
    const [vendors, setVendors] = useState<any[]>([])
    const [couriers, setCouriers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [detailOpen, setDetailOpen] = useState(false)
    const [selected, setSelected] = useState<any>(null)
    const [items, setItems] = useState<any[]>([])
    const [itemForm, setItemForm] = useState({ product_name: "", quantity: 1, unit_price: 0, notes: "" })
    const [statusForm, setStatusForm] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [search, setSearch] = useState("")

    const fetchOrders = () => {
        setLoading(true)
        fetch("/admin/varto-orders", { credentials: "include" })
            .then((r) => r.json())
            .then((d) => setOrders(d.varto_orders || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }

    const fetchRelated = () => {
        fetch("/admin/vendors", { credentials: "include" }).then((r) => r.json()).then((d) => setVendors(d.vendors || [])).catch(() => { })
        fetch("/admin/couriers", { credentials: "include" }).then((r) => r.json()).then((d) => setCouriers(d.couriers || [])).catch(() => { })
    }

    useEffect(() => { fetchOrders(); fetchRelated() }, [])

    const vendorName = (id: string) => vendors.find((v) => v.id === id)?.name || id?.slice(-6) || "—"
    const courierName = (id: string) => couriers.find((c) => c.id === id)?.name || (id ? id.slice(-6) : "—")

    const openDetail = async (order: any) => {
        setSelected(order)
        setStatusForm(order.varto_status)
        setDetailOpen(true)
        const res = await fetch(`/admin/varto-orders/${order.id}/items`, { credentials: "include" })
        const data = await res.json()
        setItems(data.items || [])
    }

    const updateStatus = async () => {
        await fetch(`/admin/varto-orders/${selected.id}`, {
            method: "POST", credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ varto_status: statusForm }),
        })
        fetchOrders()
        setSelected({ ...selected, varto_status: statusForm })
    }

    const addItem = async () => {
        const body = { ...itemForm, total_price: itemForm.quantity * itemForm.unit_price }
        await fetch(`/admin/varto-orders/${selected.id}/items`, {
            method: "POST", credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        })
        setItemForm({ product_name: "", quantity: 1, unit_price: 0, notes: "" })
        const res = await fetch(`/admin/varto-orders/${selected.id}/items`, { credentials: "include" })
        const data = await res.json()
        setItems(data.items || [])
    }

    const deleteItem = async (itemId: string) => {
        await fetch(`/admin/varto-orders/${selected.id}/items/${itemId}`, { method: "DELETE", credentials: "include" })
        setItems(items.filter((i) => i.id !== itemId))
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bu siparişi silmek istediğinizden emin misiniz?")) return
        await fetch(`/admin/varto-orders/${id}`, { method: "DELETE", credentials: "include" })
        fetchOrders()
    }

    const filtered = orders.filter((o) => {
        if (statusFilter && o.varto_status !== statusFilter) return false
        if (!search) return true
        const q = search.toLowerCase()
        return (o.customer_name?.toLowerCase() || "").includes(q) || (o.customer_phone || "").includes(q) || o.id.toLowerCase().includes(q)
    })

    // Order status summary
    const statusCounts: Record<string, number> = {}
    orders.forEach((o) => { statusCounts[o.varto_status] = (statusCounts[o.varto_status] || 0) + 1 })

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                    <Heading level="h2">Varto Siparişleri</Heading>
                    <Badge color="grey" size="2xsmall">{orders.length} sipariş</Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                    {Object.entries(statusCounts).map(([s, c]) => {
                        const info = STATUS_MAP[s] || { label: s, color: "grey" as const }
                        return <Badge key={s} color={info.color} size="2xsmall">{info.label}: {c}</Badge>
                    })}
                </div>
            </div>
            <div className="px-6 py-3 flex gap-3">
                <div className="flex-1">
                    <Input placeholder="Müşteri adı, telefon veya sipariş ID ile ara..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="w-48">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <Select.Trigger><Select.Value placeholder="Tüm Durumlar" /></Select.Trigger>
                        <Select.Content>
                            <Select.Item value="">Tüm Durumlar</Select.Item>
                            {STATUS_OPTIONS.map((o) => <Select.Item key={o.value} value={o.value}>{o.label}</Select.Item>)}
                        </Select.Content>
                    </Select>
                </div>
            </div>
            <div className="px-6 py-4">
                {loading ? <Text className="text-ui-fg-muted">Yükleniyor...</Text> :
                    filtered.length === 0 ? <Text className="text-ui-fg-muted">Sipariş bulunamadı.</Text> : (
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>No</Table.HeaderCell>
                                    <Table.HeaderCell>Durum</Table.HeaderCell>
                                    <Table.HeaderCell>Müşteri</Table.HeaderCell>
                                    <Table.HeaderCell>İşletme</Table.HeaderCell>
                                    <Table.HeaderCell>Kurye</Table.HeaderCell>
                                    <Table.HeaderCell>Adres</Table.HeaderCell>
                                    <Table.HeaderCell>Ödeme</Table.HeaderCell>
                                    <Table.HeaderCell>Tarih</Table.HeaderCell>
                                    <Table.HeaderCell>İşlemler</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {filtered.map((o: any) => {
                                    const status = STATUS_MAP[o.varto_status] || { label: o.varto_status, color: "grey" as const }
                                    const addr = o.delivery_address || {}
                                    return (
                                        <Table.Row key={o.id}>
                                            <Table.Cell><Text size="small" className="font-mono" weight="plus">#{o.id?.slice(-6).toUpperCase()}</Text></Table.Cell>
                                            <Table.Cell><Badge color={status.color} size="2xsmall">{status.label}</Badge></Table.Cell>
                                            <Table.Cell>
                                                <div>
                                                    <Text size="small" weight="plus">{o.customer_name || "—"}</Text>
                                                    {o.customer_phone && <Text size="xsmall" className="text-ui-fg-muted">{o.customer_phone}</Text>}
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell><Text size="small" className="text-ui-fg-muted">{vendorName(o.vendor_id)}</Text></Table.Cell>
                                            <Table.Cell><Text size="small" className="text-ui-fg-muted">{o.courier_id ? courierName(o.courier_id) : "—"}</Text></Table.Cell>
                                            <Table.Cell><Text size="small" className="text-ui-fg-muted">{[addr.neighborhood, addr.street].filter(Boolean).join(", ")}</Text></Table.Cell>
                                            <Table.Cell><Text size="small">{o.payment_method?.toUpperCase()}</Text></Table.Cell>
                                            <Table.Cell><Text size="small" className="text-ui-fg-muted">{new Date(o.created_at).toLocaleDateString("tr-TR")}</Text></Table.Cell>
                                            <Table.Cell>
                                                <div className="flex gap-2">
                                                    <Button size="small" variant="secondary" onClick={() => openDetail(o)}>Detay</Button>
                                                    <Button size="small" variant="danger" onClick={() => handleDelete(o.id)}>Sil</Button>
                                                </div>
                                            </Table.Cell>
                                        </Table.Row>
                                    )
                                })}
                            </Table.Body>
                        </Table>
                    )}
            </div>

            <FocusModal open={detailOpen} onOpenChange={setDetailOpen}>
                <FocusModal.Content>
                    <FocusModal.Header />
                    <FocusModal.Body className="flex flex-col items-center py-8 overflow-y-auto">
                        {selected && (
                            <div className="flex w-full max-w-2xl flex-col gap-y-6">
                                <Heading>Sipariş #{selected.id?.slice(-6).toUpperCase()}</Heading>

                                {/* Order Info */}
                                <div className="grid grid-cols-2 gap-4 rounded-lg border border-ui-border-base p-4">
                                    <div>
                                        <Text size="xsmall" className="text-ui-fg-muted">Müşteri</Text>
                                        <Text size="small" weight="plus">{selected.customer_name || "—"}</Text>
                                        {selected.customer_phone && <Text size="xsmall" className="text-ui-fg-muted">{selected.customer_phone}</Text>}
                                    </div>
                                    <div>
                                        <Text size="xsmall" className="text-ui-fg-muted">İşletme</Text>
                                        <Text size="small" weight="plus">{vendorName(selected.vendor_id)}</Text>
                                    </div>
                                    <div>
                                        <Text size="xsmall" className="text-ui-fg-muted">Kurye</Text>
                                        <Text size="small" weight="plus">{selected.courier_id ? courierName(selected.courier_id) : "Atanmadı"}</Text>
                                    </div>
                                    <div>
                                        <Text size="xsmall" className="text-ui-fg-muted">Ödeme</Text>
                                        <Text size="small" weight="plus">{selected.payment_method?.toUpperCase()}</Text>
                                    </div>
                                    {selected.delivery_notes && (
                                        <div className="col-span-2">
                                            <Text size="xsmall" className="text-ui-fg-muted">Teslimat Notu</Text>
                                            <Text size="small">{selected.delivery_notes}</Text>
                                        </div>
                                    )}
                                </div>

                                {/* Status Update */}
                                <div className="flex items-end gap-3">
                                    <div className="flex flex-col gap-y-1 flex-1">
                                        <Label>Durum Güncelle</Label>
                                        <Select value={statusForm} onValueChange={setStatusForm}>
                                            <Select.Trigger><Select.Value /></Select.Trigger>
                                            <Select.Content>
                                                {STATUS_OPTIONS.map((o) => <Select.Item key={o.value} value={o.value}>{o.label}</Select.Item>)}
                                            </Select.Content>
                                        </Select>
                                    </div>
                                    <Button size="small" variant="primary" onClick={updateStatus}>Kaydet</Button>
                                </div>

                                {/* Order Items */}
                                <div className="flex flex-col gap-y-3">
                                    <div className="flex items-center justify-between">
                                        <Heading level="h3">Sipariş Kalemleri</Heading>
                                        {items.length > 0 && (
                                            <Text size="small" weight="plus" className="text-ui-fg-muted">
                                                Toplam: ₺{items.reduce((sum: number, i: any) => sum + Number(i.total_price || 0), 0).toFixed(2)}
                                            </Text>
                                        )}
                                    </div>

                                    {items.length > 0 && (
                                        <Table>
                                            <Table.Header>
                                                <Table.Row>
                                                    <Table.HeaderCell>Ürün</Table.HeaderCell>
                                                    <Table.HeaderCell>Adet</Table.HeaderCell>
                                                    <Table.HeaderCell>Birim Fiyat</Table.HeaderCell>
                                                    <Table.HeaderCell>Toplam</Table.HeaderCell>
                                                    <Table.HeaderCell>Not</Table.HeaderCell>
                                                    <Table.HeaderCell></Table.HeaderCell>
                                                </Table.Row>
                                            </Table.Header>
                                            <Table.Body>
                                                {items.map((item: any) => (
                                                    <Table.Row key={item.id}>
                                                        <Table.Cell><Text size="small">{item.product_name}</Text></Table.Cell>
                                                        <Table.Cell><Text size="small">{item.quantity}</Text></Table.Cell>
                                                        <Table.Cell><Text size="small">₺{Number(item.unit_price).toFixed(2)}</Text></Table.Cell>
                                                        <Table.Cell><Text size="small" weight="plus">₺{Number(item.total_price).toFixed(2)}</Text></Table.Cell>
                                                        <Table.Cell><Text size="small" className="text-ui-fg-muted">{item.notes || "—"}</Text></Table.Cell>
                                                        <Table.Cell>
                                                            <Button size="small" variant="danger" onClick={() => deleteItem(item.id)}>Sil</Button>
                                                        </Table.Cell>
                                                    </Table.Row>
                                                ))}
                                            </Table.Body>
                                        </Table>
                                    )}

                                    {/* Add Item Form */}
                                    <div className="border rounded-lg p-4 bg-ui-bg-subtle flex flex-col gap-y-3">
                                        <Text size="small" weight="plus">Yeni Kalem Ekle</Text>
                                        <div className="grid grid-cols-4 gap-3">
                                            <div className="flex flex-col gap-y-1">
                                                <Label>Ürün Adı</Label>
                                                <Input value={itemForm.product_name} onChange={(e) => setItemForm({ ...itemForm, product_name: e.target.value })} placeholder="Ürün" />
                                            </div>
                                            <div className="flex flex-col gap-y-1">
                                                <Label>Adet</Label>
                                                <Input type="number" value={itemForm.quantity} onChange={(e) => setItemForm({ ...itemForm, quantity: Number(e.target.value) })} />
                                            </div>
                                            <div className="flex flex-col gap-y-1">
                                                <Label>Birim Fiyat (₺)</Label>
                                                <Input type="number" value={itemForm.unit_price} onChange={(e) => setItemForm({ ...itemForm, unit_price: Number(e.target.value) })} />
                                            </div>
                                            <div className="flex flex-col gap-y-1">
                                                <Label>Not</Label>
                                                <Input value={itemForm.notes} onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })} placeholder="İsteğe bağlı" />
                                            </div>
                                        </div>
                                        <Button size="small" variant="secondary" onClick={addItem} disabled={!itemForm.product_name}>+ Kalem Ekle</Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </FocusModal.Body>
                </FocusModal.Content>
            </FocusModal>
        </Container>
    )
}

export const config = defineRouteConfig({ label: "Varto Siparişleri", icon: ShoppingBag })
export default VartoOrdersPage
