import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ArrowPath } from "@medusajs/icons"
import { Container, Heading, Table, Badge, Text, Button, FocusModal, Label, Input, Select, Switch } from "@medusajs/ui"
import { useEffect, useState } from "react"

const VEHICLE_OPTIONS = [
    { value: "motorcycle", label: "Motosiklet" },
    { value: "bicycle", label: "Bisiklet" },
    { value: "car", label: "Araba" },
    { value: "on_foot", label: "Yaya" },
]
const VEHICLE_MAP = Object.fromEntries(VEHICLE_OPTIONS.map((o) => [o.value, o.label]))

const emptyCourier = { name: "", phone: "", email: "", vehicle_type: "motorcycle", is_active: true, is_available: true }

const CouriersPage = () => {
    const [couriers, setCouriers] = useState<any[]>([])
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<any>(null)
    const [form, setForm] = useState({ ...emptyCourier })
    const [search, setSearch] = useState("")

    const fetchCouriers = () => {
        setLoading(true)
        fetch("/admin/couriers", { credentials: "include" })
            .then((r) => r.json())
            .then((d) => setCouriers(d.couriers || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }

    const fetchOrders = () => {
        fetch("/admin/varto-orders", { credentials: "include" })
            .then((r) => r.json())
            .then((d) => setOrders(d.varto_orders || []))
            .catch(() => { })
    }

    useEffect(() => { fetchCouriers(); fetchOrders() }, [])

    const getDeliveredCount = (courierId: string) => orders.filter((o) => o.courier_id === courierId && o.varto_status === "delivered").length
    const getActiveCount = (courierId: string) => orders.filter((o) => o.courier_id === courierId && !["delivered", "cancelled"].includes(o.varto_status)).length

    const openCreate = () => { setEditing(null); setForm({ ...emptyCourier }); setModalOpen(true) }
    const openEdit = (c: any) => {
        setEditing(c)
        setForm({ name: c.name, phone: c.phone || "", email: c.email || "", vehicle_type: c.vehicle_type || "motorcycle", is_active: c.is_active ?? true, is_available: c.is_available ?? true })
        setModalOpen(true)
    }

    const handleSave = async () => {
        const url = editing ? `/admin/couriers/${editing.id}` : "/admin/couriers"
        const res = await fetch(url, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
        if (!res.ok) { const err = await res.json().catch(() => ({})); alert(err.message || "Hata oluştu"); return }
        setModalOpen(false)
        fetchCouriers()
    }

    const toggleField = async (id: string, field: string, value: boolean) => {
        const res = await fetch(`/admin/couriers/${id}`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [field]: value }) })
        if (res.ok) setCouriers((prev) => prev.map((c) => c.id === id ? { ...c, [field]: value } : c))
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bu kuryeyi silmek istediğinizden emin misiniz?")) return
        await fetch(`/admin/couriers/${id}`, { method: "DELETE", credentials: "include" })
        fetchCouriers()
    }

    const filtered = couriers.filter((c) => {
        if (!search) return true
        const q = search.toLowerCase()
        return c.name.toLowerCase().includes(q) || (c.phone || "").includes(q) || (c.email?.toLowerCase() || "").includes(q)
    })

    const activeCount = couriers.filter((c) => c.is_active).length
    const availableCount = couriers.filter((c) => c.is_available).length

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                    <Heading level="h2">Kuryeler</Heading>
                    <Badge color="grey" size="2xsmall">{couriers.length} toplam · {activeCount} aktif · {availableCount} müsait</Badge>
                </div>
                <Button size="small" variant="primary" onClick={openCreate}>+ Yeni Kurye</Button>
            </div>
            <div className="px-6 py-3">
                <Input placeholder="İsim, telefon veya e-posta ile ara..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="px-6 py-4">
                {loading ? <Text className="text-ui-fg-muted">Yükleniyor...</Text> :
                    filtered.length === 0 ? <Text className="text-ui-fg-muted">Kurye bulunamadı.</Text> : (
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>İsim</Table.HeaderCell>
                                    <Table.HeaderCell>Telefon</Table.HeaderCell>
                                    <Table.HeaderCell>E-posta</Table.HeaderCell>
                                    <Table.HeaderCell>Araç</Table.HeaderCell>
                                    <Table.HeaderCell>Teslim</Table.HeaderCell>
                                    <Table.HeaderCell>Aktif Sipariş</Table.HeaderCell>
                                    <Table.HeaderCell>Aktif</Table.HeaderCell>
                                    <Table.HeaderCell>Müsait</Table.HeaderCell>
                                    <Table.HeaderCell>Kayıt</Table.HeaderCell>
                                    <Table.HeaderCell>İşlemler</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {filtered.map((c: any) => (
                                    <Table.Row key={c.id}>
                                        <Table.Cell><Text size="small" weight="plus">{c.name}</Text></Table.Cell>
                                        <Table.Cell><Text size="small" className="text-ui-fg-muted">{c.phone}</Text></Table.Cell>
                                        <Table.Cell><Text size="small" className="text-ui-fg-muted">{c.email || "—"}</Text></Table.Cell>
                                        <Table.Cell><Badge color="blue" size="2xsmall">{VEHICLE_MAP[c.vehicle_type] || c.vehicle_type}</Badge></Table.Cell>
                                        <Table.Cell><Badge color="green" size="2xsmall">{getDeliveredCount(c.id)}</Badge></Table.Cell>
                                        <Table.Cell><Badge color={getActiveCount(c.id) > 0 ? "orange" : "grey"} size="2xsmall">{getActiveCount(c.id)}</Badge></Table.Cell>
                                        <Table.Cell>
                                            <Switch checked={c.is_active} onCheckedChange={(v) => toggleField(c.id, "is_active", v)} />
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Switch checked={c.is_available} onCheckedChange={(v) => toggleField(c.id, "is_available", v)} />
                                        </Table.Cell>
                                        <Table.Cell><Text size="small" className="text-ui-fg-muted">{new Date(c.created_at).toLocaleDateString("tr-TR")}</Text></Table.Cell>
                                        <Table.Cell>
                                            <div className="flex gap-2">
                                                <Button size="small" variant="secondary" onClick={() => openEdit(c)}>Düzenle</Button>
                                                <Button size="small" variant="danger" onClick={() => handleDelete(c.id)}>Sil</Button>
                                            </div>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    )}
            </div>

            <FocusModal open={modalOpen} onOpenChange={setModalOpen}>
                <FocusModal.Content>
                    <FocusModal.Header>
                        <Button variant="primary" onClick={handleSave}>{editing ? "Güncelle" : "Oluştur"}</Button>
                    </FocusModal.Header>
                    <FocusModal.Body className="flex flex-col items-center py-16">
                        <div className="flex w-full max-w-lg flex-col gap-y-4">
                            <Heading>{editing ? "Kurye Düzenle" : "Yeni Kurye"}</Heading>
                            <div className="flex flex-col gap-y-1">
                                <Label>İsim *</Label>
                                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Kurye adı" />
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label>Telefon *</Label>
                                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0555 123 4567" />
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label>E-posta</Label>
                                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="kurye@example.com" />
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label>Araç Tipi *</Label>
                                <Select value={form.vehicle_type} onValueChange={(val) => setForm({ ...form, vehicle_type: val })}>
                                    <Select.Trigger><Select.Value placeholder="Araç seçin" /></Select.Trigger>
                                    <Select.Content>
                                        {VEHICLE_OPTIONS.map((o) => <Select.Item key={o.value} value={o.value}>{o.label}</Select.Item>)}
                                    </Select.Content>
                                </Select>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-ui-border-base p-3">
                                <Label>Aktif</Label>
                                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-ui-border-base p-3">
                                <Label>Müsait</Label>
                                <Switch checked={form.is_available} onCheckedChange={(v) => setForm({ ...form, is_available: v })} />
                            </div>
                        </div>
                    </FocusModal.Body>
                </FocusModal.Content>
            </FocusModal>
        </Container>
    )
}

export const config = defineRouteConfig({ label: "Kuryeler", icon: ArrowPath })
export default CouriersPage
