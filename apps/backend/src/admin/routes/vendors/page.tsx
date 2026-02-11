import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Buildings } from "@medusajs/icons"
import { Container, Heading, Table, Badge, Text, Button, FocusModal, Label, Input, Select } from "@medusajs/ui"
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

const emptyVendor = { name: "", slug: "", phone: "", address: "", category: "restaurant", iban: "", is_active: true }

const VendorsPage = () => {
    const [vendors, setVendors] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<any>(null)
    const [form, setForm] = useState({ ...emptyVendor })

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
            name: v.name, slug: v.slug || "", phone: v.phone || "", address: v.address || "",
            category: v.category || "restaurant", iban: v.iban || "", is_active: v.is_active ?? true,
        })
        setModalOpen(true)
    }

    const setName = (name: string) => {
        if (editing) {
            setForm({ ...form, name })
        } else {
            setForm({ ...form, name, slug: slugify(name) })
        }
    }

    const handleSave = async () => {
        const url = editing ? `/admin/vendors/${editing.id}` : "/admin/vendors"
        const res = await fetch(url, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
        if (!res.ok) { const err = await res.json().catch(() => ({})); alert(err.message || "Hata oluştu"); return }
        setModalOpen(false)
        fetchVendors()
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bu işletmeyi silmek istediğinizden emin misiniz?")) return
        await fetch(`/admin/vendors/${id}`, { method: "DELETE", credentials: "include" })
        fetchVendors()
    }

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <Heading level="h2">İşletmeler</Heading>
                <Button size="small" variant="primary" onClick={openCreate}>+ Yeni İşletme</Button>
            </div>
            <div className="px-6 py-4">
                {loading ? <Text className="text-ui-fg-muted">Yükleniyor...</Text> :
                    vendors.length === 0 ? <Text className="text-ui-fg-muted">Henüz işletme yok.</Text> : (
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>İsim</Table.HeaderCell>
                                    <Table.HeaderCell>Kategori</Table.HeaderCell>
                                    <Table.HeaderCell>Telefon</Table.HeaderCell>
                                    <Table.HeaderCell>Adres</Table.HeaderCell>
                                    <Table.HeaderCell>IBAN</Table.HeaderCell>
                                    <Table.HeaderCell>Durum</Table.HeaderCell>
                                    <Table.HeaderCell>İşlemler</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {vendors.map((v: any) => (
                                    <Table.Row key={v.id}>
                                        <Table.Cell><Text size="small" weight="plus">{v.name}</Text></Table.Cell>
                                        <Table.Cell><Text size="small">{CATEGORY_MAP[v.category] || v.category}</Text></Table.Cell>
                                        <Table.Cell><Text size="small" className="text-ui-fg-muted">{v.phone}</Text></Table.Cell>
                                        <Table.Cell><Text size="small" className="text-ui-fg-muted">{v.address}</Text></Table.Cell>
                                        <Table.Cell><Text size="small" className="text-ui-fg-muted font-mono">{v.iban ? `...${v.iban.slice(-4)}` : "—"}</Text></Table.Cell>
                                        <Table.Cell>
                                            <Badge color={v.is_active ? "green" : "red"} size="2xsmall">{v.is_active ? "Aktif" : "Pasif"}</Badge>
                                        </Table.Cell>
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
                            <div className="flex flex-col gap-y-1">
                                <Label>Telefon *</Label>
                                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0555 123 4567" />
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
                                <Label>Kategori</Label>
                                <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
                                    <Select.Trigger><Select.Value placeholder="Kategori seçin" /></Select.Trigger>
                                    <Select.Content>
                                        {CATEGORY_OPTIONS.map((o) => <Select.Item key={o.value} value={o.value}>{o.label}</Select.Item>)}
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

export const config = defineRouteConfig({ label: "İşletmeler", icon: Buildings })
export default VendorsPage
