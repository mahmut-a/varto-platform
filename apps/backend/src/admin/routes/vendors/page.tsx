import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Buildings } from "@medusajs/icons"
import { Container, Heading, Table, Badge, Text, Button, FocusModal, Label, Input, Select, Switch } from "@medusajs/ui"
import { useEffect, useState } from "react"

const CATEGORY_OPTIONS = [
    { value: "restaurant", label: "Restoran" },
    { value: "market", label: "Market" },
    { value: "pharmacy", label: "Eczane" },
    { value: "stationery", label: "Kırtasiye" },
    { value: "barber", label: "Berber" },
    { value: "other", label: "Diğer" },
]
const CATEGORY_MAP = Object.fromEntries(CATEGORY_OPTIONS.map((o) => [o.value, o.label]))

const slugify = (text: string) =>
    text.toLowerCase().replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

const emptyVendor = { name: "", slug: "", phone: "", email: "", address: "", category: "restaurant", iban: "", is_active: true, description: "", opening_hours: "", image_url: "" }

const VendorsPage = () => {
    const [vendors, setVendors] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<any>(null)
    const [form, setForm] = useState({ ...emptyVendor })
    const [search, setSearch] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("")

    const fetchVendors = () => {
        setLoading(true)
        fetch("/admin/vendors", { credentials: "include" })
            .then((r) => r.json())
            .then((d) => setVendors(d.vendors || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }

    useEffect(() => { fetchVendors() }, [])

    const openCreate = () => { setEditing(null); setForm({ ...emptyVendor }); setModalOpen(true) }
    const openEdit = (v: any) => {
        setEditing(v)
        setForm({
            name: v.name, slug: v.slug || "", phone: v.phone || "", email: v.email || "",
            address: v.address || "", category: v.category || "restaurant", iban: v.iban || "",
            is_active: v.is_active ?? true, description: v.description || "",
            opening_hours: v.opening_hours ? JSON.stringify(v.opening_hours) : "",
            image_url: v.image_url || "",
        })
        setModalOpen(true)
    }

    const setName = (name: string) => {
        if (editing) setForm({ ...form, name })
        else setForm({ ...form, name, slug: slugify(name) })
    }

    const handleSave = async () => {
        const url = editing ? `/admin/vendors/${editing.id}` : "/admin/vendors"
        const payload: any = { ...form, slug: form.slug || slugify(form.name) }
        if (payload.opening_hours) { try { payload.opening_hours = JSON.parse(payload.opening_hours) } catch { delete payload.opening_hours } }
        else { payload.opening_hours = null }
        if (!payload.email) payload.email = null
        if (!payload.description) payload.description = null
        if (!payload.image_url) payload.image_url = null
        const res = await fetch(url, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        if (!res.ok) { const err = await res.json().catch(() => ({})); alert(err.message || "Hata oluştu"); return }
        setModalOpen(false)
        fetchVendors()
    }

    const toggleActive = async (id: string, value: boolean) => {
        const res = await fetch(`/admin/vendors/${id}`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_active: value }) })
        if (res.ok) setVendors((prev) => prev.map((v) => v.id === id ? { ...v, is_active: value } : v))
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bu işletmeyi silmek istediğinizden emin misiniz?")) return
        await fetch(`/admin/vendors/${id}`, { method: "DELETE", credentials: "include" })
        fetchVendors()
    }

    const filtered = vendors.filter((v) => {
        if (categoryFilter && v.category !== categoryFilter) return false
        if (!search) return true
        const q = search.toLowerCase()
        return v.name.toLowerCase().includes(q) || (v.phone || "").includes(q) || (v.email?.toLowerCase() || "").includes(q) || (v.address?.toLowerCase() || "").includes(q)
    })

    const activeCount = vendors.filter((v) => v.is_active).length

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                    <Heading level="h2">İşletmeler</Heading>
                    <Badge color="grey" size="2xsmall">{vendors.length} toplam · {activeCount} aktif</Badge>
                </div>
                <Button size="small" variant="primary" onClick={openCreate}>+ Yeni İşletme</Button>
            </div>
            <div className="px-6 py-3 flex gap-3">
                <div className="flex-1">
                    <Input placeholder="İsim, telefon, e-posta veya adres ile ara..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="w-48">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <Select.Trigger><Select.Value placeholder="Tüm Kategoriler" /></Select.Trigger>
                        <Select.Content>
                            <Select.Item value="">Tüm Kategoriler</Select.Item>
                            {CATEGORY_OPTIONS.map((o) => <Select.Item key={o.value} value={o.value}>{o.label}</Select.Item>)}
                        </Select.Content>
                    </Select>
                </div>
            </div>
            <div className="px-6 py-4">
                {loading ? <Text className="text-ui-fg-muted">Yükleniyor...</Text> :
                    filtered.length === 0 ? <Text className="text-ui-fg-muted">İşletme bulunamadı.</Text> : (
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>İsim</Table.HeaderCell>
                                    <Table.HeaderCell>Kategori</Table.HeaderCell>
                                    <Table.HeaderCell>Telefon</Table.HeaderCell>
                                    <Table.HeaderCell>E-posta</Table.HeaderCell>
                                    <Table.HeaderCell>Adres</Table.HeaderCell>
                                    <Table.HeaderCell>Aktif</Table.HeaderCell>
                                    <Table.HeaderCell>Tarih</Table.HeaderCell>
                                    <Table.HeaderCell>İşlemler</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {vendors.map((v: any) => (
                                    <Table.Row key={v.id}>
                                        <Table.Cell>
                                            <div className="flex items-center gap-2">
                                                {v.image_url && <img src={v.image_url} alt="" className="w-8 h-8 rounded-full object-cover" />}
                                                <Text size="small" weight="plus">{v.name}</Text>
                                            </div>
                                        </Table.Cell>
                                        <Table.Cell><Badge color="blue" size="2xsmall">{CATEGORY_MAP[v.category] || v.category}</Badge></Table.Cell>
                                        <Table.Cell><Text size="small" className="text-ui-fg-muted">{v.phone}</Text></Table.Cell>
                                        <Table.Cell><Text size="small" className="text-ui-fg-muted">{v.email || "—"}</Text></Table.Cell>
                                        <Table.Cell><Text size="small" className="text-ui-fg-muted">{v.address}</Text></Table.Cell>
                                        <Table.Cell>
                                            <Switch checked={v.is_active} onCheckedChange={(val) => toggleActive(v.id, val)} />
                                        </Table.Cell>
                                        <Table.Cell><Text size="small" className="text-ui-fg-muted">{new Date(v.created_at).toLocaleDateString("tr-TR")}</Text></Table.Cell>
                                        <Table.Cell>
                                            <div className="flex gap-2">
                                                <Button size="small" variant="secondary" onClick={() => openEdit(v)}>Düzenle</Button>
                                                <Button size="small" variant="danger" onClick={() => handleDelete(v.id)}>Sil</Button>
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
                            <Heading>{editing ? "İşletme Düzenle" : "Yeni İşletme"}</Heading>

                            <div className="flex flex-col gap-y-1">
                                <Label>İsim *</Label>
                                <Input value={form.name} onChange={(e) => setName(e.target.value)} placeholder="İşletme adı" />
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label>Slug</Label>
                                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="isletme-adi" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-y-1">
                                    <Label>Telefon *</Label>
                                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="05XX" />
                                </div>
                                <div className="flex flex-col gap-y-1">
                                    <Label>E-posta</Label>
                                    <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="info@isletme.com" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label>Adres *</Label>
                                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Adres" />
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label>IBAN *</Label>
                                <Input value={form.iban} onChange={(e) => setForm({ ...form, iban: e.target.value })} placeholder="TR00 0000 0000 0000 0000 0000 00" />
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label>Açıklama</Label>
                                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="İşletme hakkında bilgi" />
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label>Kategori</Label>
                                <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
                                    <Select.Trigger><Select.Value placeholder="Kategori seçin" /></Select.Trigger>
                                    <Select.Content>
                                        {CATEGORY_OPTIONS.map((o) => <Select.Item key={o.value} value={o.value}>{o.label}</Select.Item>)}
                                    </Select.Content>
                                </Select>
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label>Resim URL</Label>
                                <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label>Çalışma Saatleri (JSON)</Label>
                                <Input value={form.opening_hours} onChange={(e) => setForm({ ...form, opening_hours: e.target.value })} placeholder='{"mon":"09:00-22:00"}' />
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-ui-border-base p-3">
                                <Label>Aktif</Label>
                                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                            </div>
                        </div>
                    </FocusModal.Body>
                </FocusModal.Content>
            </FocusModal>
        </Container>
    )
}

export const config = defineRouteConfig({ label: "İşletmeler", icon: Buildings })
export default VendorsPage
