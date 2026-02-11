import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ArrowPath } from "@medusajs/icons"
import { Container, Heading, Table, Badge, Text, Button, FocusModal, Label, Input, Select } from "@medusajs/ui"
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
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<any>(null)
    const [form, setForm] = useState({ ...emptyCourier })

    const fetchCouriers = () => {
        setLoading(true)
        fetch("/admin/couriers", { credentials: "include" })
            .then((r) => r.json())
            .then((d) => setCouriers(d.couriers || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }

    useEffect(() => { fetchCouriers() }, [])

    const openCreate = () => { setEditing(null); setForm({ ...emptyCourier }); setModalOpen(true) }
    const openEdit = (c: any) => {
        setEditing(c)
        setForm({ name: c.name, phone: c.phone || "", email: c.email || "", vehicle_type: c.vehicle_type || "motorcycle", is_active: c.is_active ?? true, is_available: c.is_available ?? true })
        setModalOpen(true)
    }

    const handleSave = async () => {
        const url = editing ? `/admin/couriers/${editing.id}` : "/admin/couriers"
        await fetch(url, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
        setModalOpen(false)
        fetchCouriers()
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bu kuryeyi silmek istediğinizden emin misiniz?")) return
        await fetch(`/admin/couriers/${id}`, { method: "DELETE", credentials: "include" })
        fetchCouriers()
    }

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <Heading level="h2">Kuryeler</Heading>
                <Button size="small" variant="primary" onClick={openCreate}>+ Yeni Kurye</Button>
            </div>
            <div className="px-6 py-4">
                {loading ? <Text className="text-ui-fg-muted">Yükleniyor...</Text> :
                    couriers.length === 0 ? <Text className="text-ui-fg-muted">Henüz kurye yok.</Text> : (
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>İsim</Table.HeaderCell>
                                    <Table.HeaderCell>Telefon</Table.HeaderCell>
                                    <Table.HeaderCell>E-posta</Table.HeaderCell>
                                    <Table.HeaderCell>Araç</Table.HeaderCell>
                                    <Table.HeaderCell>Durum</Table.HeaderCell>
                                    <Table.HeaderCell>Müsaitlik</Table.HeaderCell>
                                    <Table.HeaderCell>İşlemler</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {couriers.map((c: any) => (
                                    <Table.Row key={c.id}>
                                        <Table.Cell><Text size="small" weight="plus">{c.name}</Text></Table.Cell>
                                        <Table.Cell><Text size="small" className="text-ui-fg-muted">{c.phone}</Text></Table.Cell>
                                        <Table.Cell><Text size="small" className="text-ui-fg-muted">{c.email || "—"}</Text></Table.Cell>
                                        <Table.Cell><Text size="small">{VEHICLE_MAP[c.vehicle_type] || c.vehicle_type}</Text></Table.Cell>
                                        <Table.Cell><Badge color={c.is_active ? "green" : "red"} size="2xsmall">{c.is_active ? "Aktif" : "Pasif"}</Badge></Table.Cell>
                                        <Table.Cell><Badge color={c.is_available ? "blue" : "grey"} size="2xsmall">{c.is_available ? "Müsait" : "Meşgul"}</Badge></Table.Cell>
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
                                <Label>İsim</Label>
                                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Kurye adı" />
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label>Telefon</Label>
                                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0555 123 4567" />
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label>E-posta</Label>
                                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="kurye@example.com" />
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label>Araç Tipi</Label>
                                <Select value={form.vehicle_type} onValueChange={(val) => setForm({ ...form, vehicle_type: val })}>
                                    <Select.Trigger><Select.Value placeholder="Araç seçin" /></Select.Trigger>
                                    <Select.Content>
                                        {VEHICLE_OPTIONS.map((o) => <Select.Item key={o.value} value={o.value}>{o.label}</Select.Item>)}
                                    </Select.Content>
                                </Select>
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
