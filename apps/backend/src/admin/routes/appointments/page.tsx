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
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<any>(null)
    const [form, setForm] = useState({ ...emptyAppointment })

    const fetchAppointments = () => {
        setLoading(true)
        fetch("/admin/appointments", { credentials: "include" })
            .then((r) => r.json())
            .then((d) => setAppointments(d.appointments || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }

    useEffect(() => { fetchAppointments() }, [])

    const openCreate = () => { setEditing(null); setForm({ ...emptyAppointment }); setModalOpen(true) }
    const openEdit = (a: any) => {
        setEditing(a)
        const d = new Date(a.date)
        const dateStr = d.toISOString().slice(0, 16)
        setForm({ vendor_id: a.vendor_id || "", customer_id: a.customer_id || "", service_name: a.service_name || "", date: dateStr, duration_minutes: a.duration_minutes || 30, status: a.status || "pending", notes: a.notes || "" })
        setModalOpen(true)
    }

    const handleSave = async () => {
        const url = editing ? `/admin/appointments/${editing.id}` : "/admin/appointments"
        const body = { ...form, date: new Date(form.date).toISOString() }
        await fetch(url, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        setModalOpen(false)
        fetchAppointments()
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bu randevuyu silmek istediğinizden emin misiniz?")) return
        await fetch(`/admin/appointments/${id}`, { method: "DELETE", credentials: "include" })
        fetchAppointments()
    }

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <Heading level="h2">Randevular</Heading>
                <Button size="small" variant="primary" onClick={openCreate}>+ Yeni Randevu</Button>
            </div>
            <div className="px-6 py-4">
                {loading ? <Text className="text-ui-fg-muted">Yükleniyor...</Text> :
                    appointments.length === 0 ? <Text className="text-ui-fg-muted">Henüz randevu yok.</Text> : (
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Hizmet</Table.HeaderCell>
                                    <Table.HeaderCell>Tarih</Table.HeaderCell>
                                    <Table.HeaderCell>Saat</Table.HeaderCell>
                                    <Table.HeaderCell>Süre</Table.HeaderCell>
                                    <Table.HeaderCell>Durum</Table.HeaderCell>
                                    <Table.HeaderCell>Notlar</Table.HeaderCell>
                                    <Table.HeaderCell>İşlemler</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {appointments.map((a: any) => {
                                    const status = STATUS_MAP[a.status] || { label: a.status, color: "grey" as const }
                                    const date = new Date(a.date)
                                    return (
                                        <Table.Row key={a.id}>
                                            <Table.Cell><Text size="small" weight="plus">{a.service_name}</Text></Table.Cell>
                                            <Table.Cell><Text size="small">{date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</Text></Table.Cell>
                                            <Table.Cell><Text size="small" className="text-ui-fg-muted">{date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</Text></Table.Cell>
                                            <Table.Cell><Text size="small">{a.duration_minutes} dk</Text></Table.Cell>
                                            <Table.Cell><Badge color={status.color} size="2xsmall">{status.label}</Badge></Table.Cell>
                                            <Table.Cell><Text size="small" className="text-ui-fg-muted max-w-[150px] truncate">{a.notes || "—"}</Text></Table.Cell>
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
                                <Label>Hizmet Adı</Label>
                                <Input value={form.service_name} onChange={(e) => setForm({ ...form, service_name: e.target.value })} placeholder="Saç Kesimi, Muayene vb." />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-y-1">
                                    <Label>Tarih ve Saat</Label>
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
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-y-1">
                                    <Label>Vendor ID</Label>
                                    <Input value={form.vendor_id} onChange={(e) => setForm({ ...form, vendor_id: e.target.value })} placeholder="İşletme ID" />
                                </div>
                                <div className="flex flex-col gap-y-1">
                                    <Label>Müşteri ID</Label>
                                    <Input value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })} placeholder="Müşteri ID" />
                                </div>
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
