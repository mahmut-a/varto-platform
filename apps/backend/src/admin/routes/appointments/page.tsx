import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Calendar } from "@medusajs/icons"
import { Container, Heading, Table, Badge, Text, Button, FocusModal, Label, Input, Select, Textarea } from "@medusajs/ui"
import { useEffect, useState } from "react"

const STATUS_MAP: Record<string, { label: string; color: "green" | "blue" | "orange" | "red" | "grey" }> = {
    pending: { label: "Bekliyor", color: "orange" },
    confirmed: { label: "Onaylandı", color: "green" },
    rejected: { label: "Reddedildi", color: "red" },
    cancelled: { label: "İptal", color: "grey" },
    completed: { label: "Tamamlandı", color: "blue" },
}
const STATUS_OPTIONS = Object.entries(STATUS_MAP).map(([value, { label }]) => ({ value, label }))

const emptyAppointment = { vendor_id: "", customer_id: "", service_name: "", date: "", duration_minutes: 30, status: "pending", notes: "" }

const AppointmentsPage = () => {
    const [appointments, setAppointments] = useState<any[]>([])
    const [vendors, setVendors] = useState<any[]>([])
    const [customers, setCustomers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<any>(null)
    const [form, setForm] = useState({ ...emptyAppointment })
    const [statusFilter, setStatusFilter] = useState("")
    const [search, setSearch] = useState("")

    const fetchAppointments = () => {
        setLoading(true)
        fetch("/admin/appointments", { credentials: "include" })
            .then((r) => r.json())
            .then((d) => setAppointments(d.appointments || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }

    const fetchRelated = () => {
        fetch("/admin/vendors", { credentials: "include" }).then((r) => r.json()).then((d) => setVendors(d.vendors || [])).catch(() => { })
        fetch("/admin/customers", { credentials: "include" }).then((r) => r.json()).then((d) => setCustomers(d.customers || [])).catch(() => { })
    }

    useEffect(() => { fetchAppointments(); fetchRelated() }, [])

    const openCreate = () => { setEditing(null); setForm({ ...emptyAppointment }); setModalOpen(true) }
    const openEdit = (a: any) => {
        setEditing(a)
        const d = new Date(a.date)
        const dateStr = d.toISOString().slice(0, 16)
        setForm({
            vendor_id: a.vendor_id || "", customer_id: a.customer_id || "",
            service_name: a.service_name || "", date: dateStr,
            duration_minutes: a.duration_minutes || 30, status: a.status || "pending",
            notes: a.notes || "",
        })
        setModalOpen(true)
    }

    const handleSave = async () => {
        const url = editing ? `/admin/appointments/${editing.id}` : "/admin/appointments"
        const body = { ...form, date: new Date(form.date).toISOString() }
        const res = await fetch(url, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        if (!res.ok) { const err = await res.json().catch(() => ({})); alert(err.message || "Hata oluştu"); return }
        setModalOpen(false)
        fetchAppointments()
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bu randevuyu silmek istediğinizden emin misiniz?")) return
        await fetch(`/admin/appointments/${id}`, { method: "DELETE", credentials: "include" })
        fetchAppointments()
    }

    const vendorName = (id: string) => vendors.find((v) => v.id === id)?.name || id?.slice(-6) || "—"
    const customerName = (id: string) => {
        const c = customers.find((c) => c.id === id)
        return c ? (c.name || c.phone || id.slice(-6)) : (id ? id.slice(-6) : "—")
    }

    // Check if a date is today
    const isToday = (dateStr: string) => {
        const d = new Date(dateStr)
        const today = new Date()
        return d.toDateString() === today.toDateString()
    }

    const filtered = appointments.filter((a) => {
        if (statusFilter && a.status !== statusFilter) return false
        if (!search) return true
        const q = search.toLowerCase()
        return (a.service_name?.toLowerCase() || "").includes(q) || vendorName(a.vendor_id).toLowerCase().includes(q)
    })

    // Status summary
    const statusCounts: Record<string, number> = {}
    appointments.forEach((a) => { statusCounts[a.status] = (statusCounts[a.status] || 0) + 1 })
    const todayCount = appointments.filter((a) => isToday(a.date)).length

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                    <Heading level="h2">Randevular</Heading>
                    <Badge color="grey" size="2xsmall">{appointments.length} toplam</Badge>
                    {todayCount > 0 && <Badge color="green" size="2xsmall">Bugün: {todayCount}</Badge>}
                    {Object.entries(statusCounts).map(([s, c]) => {
                        const info = STATUS_MAP[s] || { label: s, color: "grey" as const }
                        return <Badge key={s} color={info.color} size="2xsmall">{info.label}: {c}</Badge>
                    })}
                </div>
                <Button size="small" variant="primary" onClick={openCreate}>+ Yeni Randevu</Button>
            </div>
            <div className="px-6 py-3 flex gap-3">
                <div className="flex-1">
                    <Input placeholder="Hizmet adı veya işletme ile ara..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
                    filtered.length === 0 ? <Text className="text-ui-fg-muted">Randevu bulunamadı.</Text> : (
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Hizmet</Table.HeaderCell>
                                    <Table.HeaderCell>İşletme</Table.HeaderCell>
                                    <Table.HeaderCell>Müşteri</Table.HeaderCell>
                                    <Table.HeaderCell>Tarih</Table.HeaderCell>
                                    <Table.HeaderCell>Saat</Table.HeaderCell>
                                    <Table.HeaderCell>Süre</Table.HeaderCell>
                                    <Table.HeaderCell>Durum</Table.HeaderCell>
                                    <Table.HeaderCell>İşlemler</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {filtered.map((a: any) => {
                                    const status = STATUS_MAP[a.status] || { label: a.status, color: "grey" as const }
                                    const date = new Date(a.date)
                                    const today = isToday(a.date)
                                    return (
                                        <Table.Row key={a.id} className={today ? "bg-ui-bg-highlight" : ""}>
                                            <Table.Cell><Text size="small" weight="plus">{a.service_name}</Text></Table.Cell>
                                            <Table.Cell><Text size="small" className="text-ui-fg-muted">{vendorName(a.vendor_id)}</Text></Table.Cell>
                                            <Table.Cell><Text size="small" className="text-ui-fg-muted">{customerName(a.customer_id)}</Text></Table.Cell>
                                            <Table.Cell>
                                                <div className="flex items-center gap-1">
                                                    <Text size="small">{date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</Text>
                                                    {today && <Badge color="green" size="2xsmall">Bugün</Badge>}
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell><Text size="small" className="text-ui-fg-muted">{date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</Text></Table.Cell>
                                            <Table.Cell><Text size="small">{a.duration_minutes} dk</Text></Table.Cell>
                                            <Table.Cell><Badge color={status.color} size="2xsmall">{status.label}</Badge></Table.Cell>
                                            <Table.Cell>
                                                <div className="flex gap-2">
                                                    <Button size="small" variant="secondary" onClick={() => openEdit(a)}>Düzenle</Button>
                                                    <Button size="small" variant="danger" onClick={() => handleDelete(a.id)}>Sil</Button>
                                                </div>
                                            </Table.Cell>
                                        </Table.Row>
                                    )
                                })}
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
                            <Heading>{editing ? "Randevu Düzenle" : "Yeni Randevu"}</Heading>
                            <div className="flex flex-col gap-y-1">
                                <Label>Hizmet Adı *</Label>
                                <Input value={form.service_name} onChange={(e) => setForm({ ...form, service_name: e.target.value })} placeholder="Saç Kesimi, Muayene vb." />
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label>İşletme *</Label>
                                <Select value={form.vendor_id} onValueChange={(val) => setForm({ ...form, vendor_id: val })}>
                                    <Select.Trigger><Select.Value placeholder="İşletme seçin" /></Select.Trigger>
                                    <Select.Content>
                                        {vendors.map((v) => <Select.Item key={v.id} value={v.id}>{v.name}</Select.Item>)}
                                    </Select.Content>
                                </Select>
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label>Müşteri</Label>
                                <Select value={form.customer_id} onValueChange={(val) => setForm({ ...form, customer_id: val })}>
                                    <Select.Trigger><Select.Value placeholder="Müşteri seçin (opsiyonel)" /></Select.Trigger>
                                    <Select.Content>
                                        <Select.Item value="">Seçilmedi</Select.Item>
                                        {customers.map((c) => <Select.Item key={c.id} value={c.id}>{c.name || c.phone}</Select.Item>)}
                                    </Select.Content>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-y-1">
                                    <Label>Tarih ve Saat *</Label>
                                    <Input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-y-1">
                                    <Label>Süre (dakika)</Label>
                                    <Input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label>Durum</Label>
                                <Select value={form.status} onValueChange={(val) => setForm({ ...form, status: val })}>
                                    <Select.Trigger><Select.Value /></Select.Trigger>
                                    <Select.Content>
                                        {STATUS_OPTIONS.map((o) => <Select.Item key={o.value} value={o.value}>{o.label}</Select.Item>)}
                                    </Select.Content>
                                </Select>
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label>Notlar</Label>
                                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="İsteğe bağlı notlar" />
                            </div>
                        </div>
                    </FocusModal.Body>
                </FocusModal.Content>
            </FocusModal>
        </Container>
    )
}

export const config = defineRouteConfig({ label: "Randevular", icon: Calendar })
export default AppointmentsPage
