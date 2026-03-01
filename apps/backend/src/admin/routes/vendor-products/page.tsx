import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Tag } from "@medusajs/icons"
import { Container, Heading, Table, Text, Button, FocusModal, Label, Input, Select, Switch, Badge } from "@medusajs/ui"
import { useEffect, useState } from "react"

const emptyProduct = { vendor_id: "", name: "", description: "", price: 0, category: "", image_url: "", is_available: true, sort_order: 0 }

const VendorProductsPage = () => {
    const [products, setProducts] = useState<any[]>([])
    const [vendors, setVendors] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<any>(null)
    const [form, setForm] = useState({ ...emptyProduct })
    const [filterVendor, setFilterVendor] = useState("")
    const [search, setSearch] = useState("")

    const fetchProducts = () => {
        setLoading(true)
        const url = filterVendor ? `/admin/vendor-products?vendor_id=${filterVendor}` : "/admin/vendor-products"
        fetch(url, { credentials: "include" })
            .then((r) => r.json())
            .then((d) => setProducts(d.vendor_products || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }

    const fetchVendors = () => {
        fetch("/admin/vendors", { credentials: "include" })
            .then((r) => r.json())
            .then((d) => setVendors(d.vendors || []))
            .catch(() => { })
    }

    useEffect(() => { fetchVendors() }, [])
    useEffect(() => { fetchProducts() }, [filterVendor])

    const vendorName = (id: string) => vendors.find((v) => v.id === id)?.name || id?.slice(-6) || "—"

    const openCreate = () => { setEditing(null); setForm({ ...emptyProduct }); setModalOpen(true) }
    const openEdit = (p: any) => {
        setEditing(p)
        setForm({
            vendor_id: p.vendor_id || "", name: p.name || "", description: p.description || "",
            price: p.price || 0, category: p.category || "", image_url: p.image_url || "",
            is_available: p.is_available ?? true, sort_order: p.sort_order || 0,
        })
        setModalOpen(true)
    }

    const handleSave = async () => {
        const url = editing ? `/admin/vendor-products/${editing.id}` : "/admin/vendor-products"
        const payload: any = { ...form }
        if (!payload.description) payload.description = null
        if (!payload.category) payload.category = null
        if (!payload.image_url) payload.image_url = null
        const res = await fetch(url, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        if (!res.ok) { const err = await res.json().catch(() => ({})); alert(err.message || "Hata oluştu"); return }
        setModalOpen(false)
        fetchProducts()
    }

    const toggleAvailable = async (id: string, value: boolean) => {
        const res = await fetch(`/admin/vendor-products/${id}`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_available: value }) })
        if (res.ok) setProducts((prev) => prev.map((p) => p.id === id ? { ...p, is_available: value } : p))
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bu ürünü silmek istediğinizden emin misiniz?")) return
        await fetch(`/admin/vendor-products/${id}`, { method: "DELETE", credentials: "include" })
        fetchProducts()
    }

    const filtered = products.filter((p) => {
        if (!search) return true
        const q = search.toLowerCase()
        return p.name.toLowerCase().includes(q) || (p.category?.toLowerCase() || "").includes(q)
    })

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                    <Heading level="h2">İşletme Ürünleri</Heading>
                    <Badge color="grey" size="2xsmall">{products.length} ürün</Badge>
                </div>
                <Button size="small" variant="primary" onClick={openCreate}>+ Yeni Ürün</Button>
            </div>
            <div className="px-6 py-3 flex gap-3">
                <div className="flex-1">
                    <Input placeholder="Ürün adı veya kategori ile ara..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="w-64">
                    <Select value={filterVendor} onValueChange={(val) => setFilterVendor(val)}>
                        <Select.Trigger><Select.Value placeholder="Tüm İşletmeler" /></Select.Trigger>
                        <Select.Content>
                            <Select.Item value="">Tüm İşletmeler</Select.Item>
                            {vendors.map((v) => <Select.Item key={v.id} value={v.id}>{v.name}</Select.Item>)}
                        </Select.Content>
                    </Select>
                </div>
            </div>
            <div className="px-6 py-4">
                {loading ? <Text className="text-ui-fg-muted">Yükleniyor...</Text> :
                    filtered.length === 0 ? <Text className="text-ui-fg-muted">Ürün bulunamadı.</Text> : (
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Ürün Adı</Table.HeaderCell>
                                    <Table.HeaderCell>İşletme</Table.HeaderCell>
                                    <Table.HeaderCell>Fiyat</Table.HeaderCell>
                                    <Table.HeaderCell>Kategori</Table.HeaderCell>
                                    <Table.HeaderCell>Müsait</Table.HeaderCell>
                                    <Table.HeaderCell>Sıra</Table.HeaderCell>
                                    <Table.HeaderCell>İşlemler</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {filtered.map((p: any) => (
                                    <Table.Row key={p.id}>
                                        <Table.Cell>
                                            <div className="flex items-center gap-2">
                                                {p.image_url && <img src={p.image_url} alt="" className="w-8 h-8 rounded object-cover" />}
                                                <Text size="small" weight="plus">{p.name}</Text>
                                            </div>
                                        </Table.Cell>
                                        <Table.Cell><Text size="small" className="text-ui-fg-muted">{vendorName(p.vendor_id)}</Text></Table.Cell>
                                        <Table.Cell><Text size="small">₺{Number(p.price).toFixed(2)}</Text></Table.Cell>
                                        <Table.Cell><Text size="small" className="text-ui-fg-muted">{p.category || "—"}</Text></Table.Cell>
                                        <Table.Cell>
                                            <Switch checked={p.is_available} onCheckedChange={(val) => toggleAvailable(p.id, val)} />
                                        </Table.Cell>
                                        <Table.Cell><Text size="small" className="text-ui-fg-muted">{p.sort_order}</Text></Table.Cell>
                                        <Table.Cell>
                                            <div className="flex gap-2">
                                                <Button size="small" variant="secondary" onClick={() => openEdit(p)}>Düzenle</Button>
                                                <Button size="small" variant="danger" onClick={() => handleDelete(p.id)}>Sil</Button>
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
                            <Heading>{editing ? "Ürün Düzenle" : "Yeni Ürün"}</Heading>
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
                                <Label>Ürün Adı *</Label>
                                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ürün adı" />
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label>Açıklama</Label>
                                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ürün açıklaması" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-y-1">
                                    <Label>Fiyat (₺) *</Label>
                                    <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                                </div>
                                <div className="flex flex-col gap-y-1">
                                    <Label>Kategori</Label>
                                    <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Kategori" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label>Resim URL</Label>
                                <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label>Sıra</Label>
                                <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
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

export const config = defineRouteConfig({ label: "İşletme Ürünleri", icon: Tag })
export default VendorProductsPage
