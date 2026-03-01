import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Users } from "@medusajs/icons"
import { Container, Heading, Table, Text, Button, FocusModal, Label, Input, Switch, Badge } from "@medusajs/ui"
import { useEffect, useState } from "react"

const emptyCustomer = { phone: "", name: "", email: "", address: "", is_active: true }

const CustomersPage = () => {
    const [customers, setCustomers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<any>(null)
    const [form, setForm] = useState({ ...emptyCustomer })
    const [search, setSearch] = useState("")

    const fetchCustomers = () => {
        setLoading(true)
        fetch("/admin/customers", { credentials: "include" })
            .then((r) => r.json())
            .then((d) => setCustomers(d.customers || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }

    useEffect(() => { fetchCustomers() }, [])

    const openCreate = () => { setEditing(null); setForm({ ...emptyCustomer }); setModalOpen(true) }
    const openEdit = (c: any) => {
        setEditing(c)
        setForm({
            phone: c.phone || "", name: c.name || "", email: c.email || "",
            address: c.address || "", is_active: c.is_active ?? true,
        })
        setModalOpen(true)
    }

    const handleSave = async () => {
        const url = editing ? `/admin/customers/${editing.id}` : "/admin/customers"
        const payload: any = { ...form }
        if (!payload.name) payload.name = null
        if (!payload.email) payload.email = null
        if (!payload.address) payload.address = null
        const res = await fetch(url, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        if (!res.ok) { const err = await res.json().catch(() => ({})); alert(err.message || "Hata oluştu"); return }
        setModalOpen(false)
        fetchCustomers()
    }

    const toggleActive = async (id: string, value: boolean) => {
        const res = await fetch(`/admin/customers/${id}`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_active: value }) })
        if (res.ok) setCustomers((prev) => prev.map((c) => c.id === id ? { ...c, is_active: value } : c))
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bu müşteriyi silmek istediğinizden emin misiniz?")) return
        await fetch(`/admin/customers/${id}`, { method: "DELETE", credentials: "include" })
        fetchCustomers()
    }

    const filtered = customers.filter((c) => {
        if (!search) return true
        const q = search.toLowerCase()
        return (c.name?.toLowerCase() || "").includes(q) || (c.phone || "").includes(q) || (c.email?.toLowerCase() || "").includes(q)
    })

    const activeCount = customers.filter((c) => c.is_active).length

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                    <Heading level="h2">Müşteriler</Heading>
                    <Badge color="grey" size="2xsmall">{customers.length} toplam · {activeCount} aktif</Badge>
                </div>
                <Button size="small" variant="primary" onClick={openCreate}>+ Yeni Müşteri</Button>
            </div>
            <div className="px-6 py-3">
                <Input placeholder="İsim, telefon veya e-posta ile ara..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="px-6 py-4">
                {loading ? <Text className="text-ui-fg-muted">Yükleniyor...</Text> :
                    filtered.length === 0 ? <Text className="text-ui-fg-muted">Müşteri bulunamadı.</Text> : (
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>İsim</Table.HeaderCell>
                                    <Table.HeaderCell>Telefon</Table.HeaderCell>
                                    <Table.HeaderCell>E-posta</Table.HeaderCell>
                                    <Table.HeaderCell>Adres</Table.HeaderCell>
                                    <Table.HeaderCell>Aktif</Table.HeaderCell>
                                    <Table.HeaderCell>Kayıt Tarihi</Table.HeaderCell>
                                    <Table.HeaderCell>İşlemler</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {filtered.map((c: any) => (
                                    <Table.Row key={c.id}>
                                        <Table.Cell><Text size="small" weight="plus">{c.name || "—"}</Text></Table.Cell>
                                        <Table.Cell><Text size="small">{c.phone}</Text></Table.Cell>
                                        <Table.Cell><Text size="small" className="text-ui-fg-muted">{c.email || "—"}</Text></Table.Cell>
                                        <Table.Cell><Text size="small" className="text-ui-fg-muted">{c.address || "—"}</Text></Table.Cell>
                                        <Table.Cell>
                                            <Switch checked={c.is_active} onCheckedChange={(val) => toggleActive(c.id, val)} />
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
                            <Heading>{editing ? "Müşteri Düzenle" : "Yeni Müşteri"}</Heading>
                            <div className="flex flex-col gap-y-1">
                                <Label>Telefon *</Label>
                                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="05XX XXX XXXX" />
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label>İsim</Label>
                                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ad Soyad" />
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label>E-posta</Label>
                                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="musteri@example.com" />
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label>Adres</Label>
                                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Adres" />
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

export const config = defineRouteConfig({ label: "Müşteriler", icon: Users })
export default CustomersPage
