import { defineRouteConfig } from "@medusajs/admin-sdk"
import { DocumentText } from "@medusajs/icons"
import { Container, Heading, Table, Badge, Text, Button, FocusModal, Label, Input, Select, Textarea } from "@medusajs/ui"
import { useEffect, useState } from "react"

const STATUS_OPTIONS = [
    { value: "pending", label: "Bekliyor", color: "orange" as const },
    { value: "approved", label: "Onaylı", color: "green" as const },
    { value: "rejected", label: "Reddedildi", color: "red" as const },
    { value: "expired", label: "Süresi Doldu", color: "grey" as const },
]
const STATUS_MAP = Object.fromEntries(STATUS_OPTIONS.map((o) => [o.value, { label: o.label, color: o.color }]))

const CATEGORY_OPTIONS = [
    { value: "rental", label: "Kiralık" },
    { value: "sale", label: "Satılık" },
    { value: "job", label: "İş İlanı" },
    { value: "service", label: "Hizmet" },
    { value: "other", label: "Diğer" },
]
const CATEGORY_MAP = Object.fromEntries(CATEGORY_OPTIONS.map((o) => [o.value, o.label]))

const emptyListing = { title: "", description: "", category: "other", price: 0, location: "", contact_name: "", contact_phone: "", status: "pending", rejection_reason: "", customer_id: "", vendor_id: "" }

const ListingsPage = () => {
    const [listings, setListings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<any>(null)
    const [form, setForm] = useState({ ...emptyListing })
    const [statusFilter, setStatusFilter] = useState("")
    const [search, setSearch] = useState("")

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
        setForm({
            title: l.title, description: l.description || "", category: l.category || "other",
            price: l.price || 0, location: l.location || "", contact_name: l.contact_name || "",
            contact_phone: l.contact_phone || "", status: l.status || "pending",
            rejection_reason: l.rejection_reason || "", customer_id: l.customer_id || "",
            vendor_id: l.vendor_id || "",
        })
        setModalOpen(true)
    }

    const handleSave = async () => {
        const url = editing ? `/admin/listings/${editing.id}` : "/admin/listings"
        const payload: any = { ...form }
        if (!payload.rejection_reason) payload.rejection_reason = null
        if (!payload.customer_id) payload.customer_id = null
        if (!payload.vendor_id) payload.vendor_id = null
        const res = await fetch(url, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        if (!res.ok) { const err = await res.json().catch(() => ({})); alert(err.message || "Hata oluştu"); return }
        setModalOpen(false)
        fetchListings()
    }

    const updateStatus = async (id: string, status: string) => {
        const res = await fetch(`/admin/listings/${id}`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })
        if (res.ok) setListings((prev) => prev.map((l) => l.id === id ? { ...l, status } : l))
        else alert("Durum güncellenemedi!")
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bu ilanı silmek istediğinizden emin misiniz?")) return
        await fetch(`/admin/listings/${id}`, { method: "DELETE", credentials: "include" })
        fetchListings()
    }

    const filtered = listings.filter((l) => {
        if (statusFilter && l.status !== statusFilter) return false
        if (!search) return true
        const q = search.toLowerCase()
        return l.title.toLowerCase().includes(q) || (l.contact_name?.toLowerCase() || "").includes(q) || (l.location?.toLowerCase() || "").includes(q)
    })

    // Status summary
    const statusCounts: Record<string, number> = {}
    listings.forEach((l) => { statusCounts[l.status] = (statusCounts[l.status] || 0) + 1 })

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                    <Heading level="h2">İlanlar</Heading>
                    <Badge color="grey" size="2xsmall">{listings.length} ilan</Badge>
                    {Object.entries(statusCounts).map(([s, c]) => {
                        const info = STATUS_MAP[s] || { label: s, color: "grey" as const }
                        return <Badge key={s} color={info.color} size="2xsmall">{info.label}: {c}</Badge>
                    })}
                </div>
                <Button size="small" variant="primary" onClick={openCreate}>+ Yeni İlan</Button>
            </div>
            <div className="px-6 py-3 flex gap-3">
                <div className="flex-1">
                    <Input placeholder="Başlık, iletişim adı veya konum ile ara..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
                    filtered.length === 0 ? <Text className="text-ui-fg-muted">İlan bulunamadı.</Text> : (
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Başlık</Table.HeaderCell>
                                    <Table.HeaderCell>Kategori</Table.HeaderCell>
                                    <Table.HeaderCell>Fiyat</Table.HeaderCell>
                                    <Table.HeaderCell>Konum</Table.HeaderCell>
                                    <Table.HeaderCell>İletişim</Table.HeaderCell>
                                    <Table.HeaderCell>Durum</Table.HeaderCell>
                                    <Table.HeaderCell>Resim</Table.HeaderCell>
                                    <Table.HeaderCell>Oluşturma</Table.HeaderCell>
                                    <Table.HeaderCell>Bitiş</Table.HeaderCell>
                                    <Table.HeaderCell>İşlemler</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {filtered.map((l: any) => {
                                    const status = STATUS_MAP[l.status] || { label: l.status, color: "grey" as const }
                                    const imageCount = Array.isArray(l.images) ? l.images.length : 0
                                    return (
                                        <Table.Row key={l.id}>
                                            <Table.Cell><Text size="small" weight="plus">{l.title}</Text></Table.Cell>
                                            <Table.Cell><Badge color="blue" size="2xsmall">{CATEGORY_MAP[l.category] || l.category}</Badge></Table.Cell>
                                            <Table.Cell><Text size="small">{l.price != null ? `₺${Number(l.price).toLocaleString("tr-TR")}` : "—"}</Text></Table.Cell>
                                            <Table.Cell><Text size="small" className="text-ui-fg-muted">{l.location}</Text></Table.Cell>
                                            <Table.Cell>
                                                <div>
                                                    <Text size="small">{l.contact_name}</Text>
                                                    <Text size="xsmall" className="text-ui-fg-muted">{l.contact_phone}</Text>
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell><Badge color={status.color} size="2xsmall">{status.label}</Badge></Table.Cell>
                                            <Table.Cell>
                                                {imageCount > 0 ? <Badge color="purple" size="2xsmall">{imageCount} resim</Badge> : <Text size="small" className="text-ui-fg-muted">—</Text>}
                                            </Table.Cell>
                                            <Table.Cell><Text size="small" className="text-ui-fg-muted">{new Date(l.created_at).toLocaleDateString("tr-TR")}</Text></Table.Cell>
                                            <Table.Cell><Text size="small" className="text-ui-fg-muted">{l.expires_at ? new Date(l.expires_at).toLocaleDateString("tr-TR") : "—"}</Text></Table.Cell>
                                            <Table.Cell>
                                                <div className="flex gap-2">
                                                    {l.status === "pending" && <Button size="small" variant="primary" onClick={() => updateStatus(l.id, "approved")}>Onayla</Button>}
                                                    {l.status === "pending" && <Button size="small" variant="secondary" onClick={() => updateStatus(l.id, "rejected")}>Reddet</Button>}
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
                                <Label>Başlık *</Label>
                                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="İlan başlığı" />
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label>Açıklama *</Label>
                                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="İlan açıklaması" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-y-1">
                                    <Label>Kategori *</Label>
                                    <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
                                        <Select.Trigger><Select.Value /></Select.Trigger>
                                        <Select.Content>
                                            {CATEGORY_OPTIONS.map((o) => <Select.Item key={o.value} value={o.value}>{o.label}</Select.Item>)}
                                        </Select.Content>
                                    </Select>
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
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-y-1">
                                    <Label>Fiyat (₺)</Label>
                                    <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                                </div>
                                <div className="flex flex-col gap-y-1">
                                    <Label>Konum *</Label>
                                    <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Şehir / İlçe" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-y-1">
                                    <Label>İletişim Adı *</Label>
                                    <Input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} placeholder="Ad Soyad" />
                                </div>
                                <div className="flex flex-col gap-y-1">
                                    <Label>İletişim Telefon *</Label>
                                    <Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} placeholder="05XX" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label>Red Nedeni</Label>
                                <Input value={form.rejection_reason} onChange={(e) => setForm({ ...form, rejection_reason: e.target.value })} placeholder="Neden reddedildi" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-y-1">
                                    <Label>Müşteri ID</Label>
                                    <Input value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })} placeholder="ID" />
                                </div>
                                <div className="flex flex-col gap-y-1">
                                    <Label>İşletme ID</Label>
                                    <Input value={form.vendor_id} onChange={(e) => setForm({ ...form, vendor_id: e.target.value })} placeholder="ID" />
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
