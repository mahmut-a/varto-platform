import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Table, Text, Button, FocusModal, Label, Input, Badge } from "@medusajs/ui"
import { useEffect, useState } from "react"

const emptyUser = { email: "", first_name: "", last_name: "", password: "" }

const AdminUsersPage = () => {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [form, setForm] = useState({ ...emptyUser })

    const fetchUsers = () => {
        setLoading(true)
        fetch("/admin/users", { credentials: "include" })
            .then((r) => r.json())
            .then((d) => setUsers(d.users || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }

    useEffect(() => { fetchUsers() }, [])

    const openCreate = () => { setForm({ ...emptyUser }); setModalOpen(true) }

    const handleSave = async () => {
        if (!form.email || !form.password) { alert("E-posta ve Şifre zorunludur."); return }
        const res = await fetch("/admin/users", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
        if (!res.ok) { const err = await res.json().catch(() => ({})); alert(err.message || "Hata oluştu"); return }
        setModalOpen(false)
        fetchUsers()
    }

    const handleDelete = async (id: string, email: string) => {
        if (!confirm(`"${email}" kullanıcısını silmek istediğinizden emin misiniz?`)) return
        await fetch(`/admin/users/${id}`, { method: "DELETE", credentials: "include" })
        fetchUsers()
    }

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <Heading level="h2">Admin Kullanıcılar</Heading>
                <Button size="small" variant="primary" onClick={openCreate}>+ Yeni Admin</Button>
            </div>
            <div className="px-6 py-4">
                {loading ? <Text className="text-ui-fg-muted">Yükleniyor...</Text> :
                    users.length === 0 ? <Text className="text-ui-fg-muted">Henüz kullanıcı yok.</Text> : (
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>E-posta</Table.HeaderCell>
                                    <Table.HeaderCell>Ad</Table.HeaderCell>
                                    <Table.HeaderCell>Soyad</Table.HeaderCell>
                                    <Table.HeaderCell>Kayıt Tarihi</Table.HeaderCell>
                                    <Table.HeaderCell>İşlemler</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {users.map((u: any) => (
                                    <Table.Row key={u.id}>
                                        <Table.Cell><Text size="small" weight="plus">{u.email}</Text></Table.Cell>
                                        <Table.Cell><Text size="small">{u.first_name || "—"}</Text></Table.Cell>
                                        <Table.Cell><Text size="small">{u.last_name || "—"}</Text></Table.Cell>
                                        <Table.Cell><Text size="small" className="text-ui-fg-muted">{new Date(u.created_at).toLocaleDateString("tr-TR")}</Text></Table.Cell>
                                        <Table.Cell>
                                            <Button size="small" variant="danger" onClick={() => handleDelete(u.id, u.email)}>Sil</Button>
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
                        <Button variant="primary" onClick={handleSave}>Oluştur</Button>
                    </FocusModal.Header>
                    <FocusModal.Body className="flex flex-col items-center py-16">
                        <div className="flex w-full max-w-lg flex-col gap-y-4">
                            <Heading>Yeni Admin Kullanıcı</Heading>
                            <div className="flex flex-col gap-y-1">
                                <Label>E-posta *</Label>
                                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@example.com" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-y-1">
                                    <Label>Ad</Label>
                                    <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} placeholder="Ad" />
                                </div>
                                <div className="flex flex-col gap-y-1">
                                    <Label>Soyad</Label>
                                    <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} placeholder="Soyad" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label>Şifre *</Label>
                                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Güçlü bir şifre girin" />
                            </div>
                        </div>
                    </FocusModal.Body>
                </FocusModal.Content>
            </FocusModal>
        </Container>
    )
}

export const config = defineRouteConfig({ label: "Admin Kullanıcılar" })
export default AdminUsersPage
