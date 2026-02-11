import { defineRouteConfig } from "@medusajs/admin-sdk"
import { DocumentText } from "@medusajs/icons"
import { Container, Heading, Table, Badge, Text, Button, FocusModal, Label, Input, Select, Textarea } from "@medusajs/ui"
import { useEffect, useState } from "react"

const STATUS_MAP: Record<string, { label: string; color: "green" | "orange" | "red" | "grey" }> = {
    pending: { label: "Bekliyor", color: "orange" },
    approved: { label: "Onaylı", color: "green" },
    rejected: { label: "Reddedildi", color: "red" },
    expired: { label: "Süresi Doldu", color: "grey" },
}

const CATEGORY_OPTIONS = [
    { value: "rental", label: "Kiralık" },
    { value: "sale", label: "Satılık" },
    { value: "job", label: "İş İlanı" },
    { value: "service", label: "Hizmet" },
    { value: "other", label: "Diğer" },
]
const CATEGORY_MAP = Object.fromEntries(CATEGORY_OPTIONS.map((o) => [o.value, o.label]))

const emptyListing = { title: "", description: "", category: "other", price: 0, location: "", contact_name: "", contact_phone: "", status: "pending" }

const ListingsPage = () => {
    const [listings, setListings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<any>(null)
    const [form, setForm] = useState({ ...emptyListing })

    const fetchListings = () => {
        setLoading(true)
        fetch("/admin/listings", { credentials: "include" })
            .then((r) => r.json())
            .then((d) => setListings(d.listings || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }

    useEffect(() => { fetchListings() }, [])

    const openCreate = () => { setEditing(null); setForm({ ...emptyListing }); setModalOpen(true) }
    const openEdit = (l: any) => {
        setEditing(l)
        setForm({ title: l.title, description: l.description || "", category: l.category || "other", price: l.price || 0, location: l.location || "", contact_name: l.contact_name || "", contact_phone: l.contact_phone || "", status: l.status || "pending" })
        setModalOpen(true)
    }

    const handleSave = async () => {
        const url = editing ? `/admin/listings/${editing.id}` : "/admin/listings"
        await fetch(url, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
        setModalOpen(false)
        fetchListings()
    }

    const updateStatus = async (id: string, status: string) => {
        await fetch(`/admin/listings/${id}`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })
        setListings((prev) => prev.map((l) => l.id === id ? { ...l, status } : l))
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bu ilanı silmek istediğinizden emin misiniz?")) return
        await fetch(`/admin/listings/${id}`, { method: "DELETE", credentials: "include" })
        fetchListings()
    }

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <Heading level="h2">İlanlar</Heading>
                <Button size="small" variant="primary" onClick={openCreate}>+ Yeni İlan</Button>
            </div>
            <div className="px-6 py-4">
                {loading ? <Text className="text-ui-fg-muted">Yükleniyor...</Text> :
                    listings.length === 0 ? <Text className="text-ui-fg-muted">Henüz ilan yok.</Text> : (
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Başlık</Table.HeaderCell>
                                    <Table.HeaderCell>Kategori</Table.HeaderCell>
                                    <Table.HeaderCell>Fiyat</Table.HeaderCell>
                                    <Table.HeaderCell>İletişim</Table.HeaderCell>
                                    <Table.HeaderCell>Durum</Table.HeaderCell>
                                    <Table.HeaderCell>İşlemler</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {listings.map((l: any) => {
                                    const status = STATUS_MAP[l.status] || { label: l.status, color: "grey" as const }
                                    return (
                                        <Table.Row key={l.id}>
                                            <Table.Cell><Text size="small" weight="plus">{l.title}</Text></Table.Cell>
                                            <Table.Cell><Text size="small">{CATEGORY_MAP[l.category] || l.category}</Text></Table.Cell>
                                            <Table.Cell><Text size="small">{l.price != null ? `₺${Number(l.price).toLocaleString("tr-TR")}` : "—"}</Text></Table.Cell>
                                            <Table.Cell><Text size="small" className="text-ui-fg-muted">{l.contact_name}</Text></Table.Cell>
                                            <Table.Cell><Badge color={status.color} size="2xsmall">{status.label}</Badge></Table.Cell>
                                            <Table.Cell>
                                                <div className="flex gap-2">
                                                    {l.status === "pending" && (
                                                        <>
                                                            <Button size="small" variant="primary" onClick={() => updateStatus(l.id, "approved")}>Onayla</Button>
                                                            <Button size="small" variant="secondary" onClick={() => updateStatus(l.id, "rejected")}>Reddet</Button>
                                                        </>
                                                    )}
                                                    <Button size="small" variant="secondary" onClick={() => openEdit(l)}>Düzenle</Button>
                                                    <Button size="small" variant="danger" onClick={() => handleDelete(l.id)}>Sil</Button>
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
                            <Heading>{editing ? "İlan Düzenle" : "Yeni İlan"}</Heading>
                            <div className="flex flex-col gap-y-1">
                                <Label>Başlık</Label>
                                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="İlan başlığı" />
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label>Açıklama</Label>
                                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Açıklama" />
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label>Kategori</Label>
                                <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
                                    <Select.Trigger><Select.Value /></Select.Trigger>
                                    <Select.Content>
                                        {CATEGORY_OPTIONS.map((o) => <Select.Item key={o.value} value={o.value}>{o.label}</Select.Item>)}
                                    </Select.Content>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-y-1">
                                    <Label>Fiyat (₺)</Label>
                                    <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                                </div>
                                <div className="flex flex-col gap-y-1">
                                    <Label>Konum</Label>
                                    <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Konum" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-y-1">
                                    <Label>İletişim Adı</Label>
                                    <Input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-y-1">
                                    <Label>İletişim Telefon</Label>
                                    <Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
                                </div>
                            </div>
                        </div>
                    </FocusModal.Body>
                </FocusModal.Content>
            </FocusModal>
        </Container>
    )
}

export const config = defineRouteConfig({ label: "İlanlar", icon: DocumentText })
export default ListingsPage
