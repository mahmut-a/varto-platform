import { defineRouteConfig } from "@medusajs/admin-sdk"
import { BellAlert } from "@medusajs/icons"
import { Container, Heading, Table, Text, Badge, Select, Button } from "@medusajs/ui"
import { useEffect, useState } from "react"

const TYPE_MAP: Record<string, { label: string; color: "green" | "blue" | "orange" | "red" | "grey" | "purple" }> = {
    order: { label: "Sipariş", color: "blue" },
    listing: { label: "İlan", color: "purple" },
    appointment: { label: "Randevu", color: "orange" },
    system: { label: "Sistem", color: "grey" },
}

const RECIPIENT_MAP: Record<string, string> = {
    customer: "Müşteri",
    vendor: "İşletme",
    courier: "Kurye",
    admin: "Admin",
}

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [typeFilter, setTypeFilter] = useState("")
    const [recipientFilter, setRecipientFilter] = useState("")
    const [readFilter, setReadFilter] = useState("")

    const fetchNotifications = () => {
        setLoading(true)
        const params = new URLSearchParams()
        if (recipientFilter) params.set("recipient_type", recipientFilter)
        if (readFilter) params.set("is_read", readFilter)
        params.set("limit", "200")
        fetch(`/admin/notifications?${params.toString()}`, { credentials: "include" })
            .then((r) => r.json())
            .then((d) => setNotifications(d.notifications || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }

    useEffect(() => { fetchNotifications() }, [recipientFilter, readFilter])

    const markAsRead = async (id: string) => {
        await fetch(`/admin/notifications/${id}`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_read: true }) })
        setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n))
    }

    const filtered = notifications.filter((n) => {
        if (typeFilter && n.type !== typeFilter) return false
        return true
    })

    const unreadCount = notifications.filter((n) => !n.is_read).length

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                    <Heading level="h2">Bildirimler</Heading>
                    <Badge color="orange" size="2xsmall">{unreadCount} okunmamış</Badge>
                    <Badge color="grey" size="2xsmall">{notifications.length} toplam</Badge>
                </div>
            </div>
            <div className="px-6 py-3 flex gap-3">
                <div className="w-48">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <Select.Trigger><Select.Value placeholder="Tüm Tipler" /></Select.Trigger>
                        <Select.Content>
                            <Select.Item value="">Tüm Tipler</Select.Item>
                            <Select.Item value="order">Sipariş</Select.Item>
                            <Select.Item value="listing">İlan</Select.Item>
                            <Select.Item value="appointment">Randevu</Select.Item>
                            <Select.Item value="system">Sistem</Select.Item>
                        </Select.Content>
                    </Select>
                </div>
                <div className="w-48">
                    <Select value={recipientFilter} onValueChange={setRecipientFilter}>
                        <Select.Trigger><Select.Value placeholder="Tüm Alıcılar" /></Select.Trigger>
                        <Select.Content>
                            <Select.Item value="">Tüm Alıcılar</Select.Item>
                            <Select.Item value="customer">Müşteri</Select.Item>
                            <Select.Item value="vendor">İşletme</Select.Item>
                            <Select.Item value="courier">Kurye</Select.Item>
                            <Select.Item value="admin">Admin</Select.Item>
                        </Select.Content>
                    </Select>
                </div>
                <div className="w-48">
                    <Select value={readFilter} onValueChange={setReadFilter}>
                        <Select.Trigger><Select.Value placeholder="Tüm Durumlar" /></Select.Trigger>
                        <Select.Content>
                            <Select.Item value="">Tümü</Select.Item>
                            <Select.Item value="false">Okunmamış</Select.Item>
                            <Select.Item value="true">Okunmuş</Select.Item>
                        </Select.Content>
                    </Select>
                </div>
            </div>
            <div className="px-6 py-4">
                {loading ? <Text className="text-ui-fg-muted">Yükleniyor...</Text> :
                    filtered.length === 0 ? <Text className="text-ui-fg-muted">Bildirim bulunamadı.</Text> : (
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Durum</Table.HeaderCell>
                                    <Table.HeaderCell>Tip</Table.HeaderCell>
                                    <Table.HeaderCell>Başlık</Table.HeaderCell>
                                    <Table.HeaderCell>Mesaj</Table.HeaderCell>
                                    <Table.HeaderCell>Alıcı</Table.HeaderCell>
                                    <Table.HeaderCell>Tarih</Table.HeaderCell>
                                    <Table.HeaderCell>İşlemler</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {filtered.map((n: any) => {
                                    const typeInfo = TYPE_MAP[n.type] || { label: n.type, color: "grey" as const }
                                    return (
                                        <Table.Row key={n.id} className={n.is_read ? "" : "bg-ui-bg-highlight"}>
                                            <Table.Cell>
                                                <Badge color={n.is_read ? "grey" : "green"} size="2xsmall">
                                                    {n.is_read ? "Okundu" : "Yeni"}
                                                </Badge>
                                            </Table.Cell>
                                            <Table.Cell><Badge color={typeInfo.color} size="2xsmall">{typeInfo.label}</Badge></Table.Cell>
                                            <Table.Cell><Text size="small" weight="plus">{n.title}</Text></Table.Cell>
                                            <Table.Cell><Text size="small" className="text-ui-fg-muted max-w-[300px] truncate">{n.message}</Text></Table.Cell>
                                            <Table.Cell>
                                                <Text size="small" className="text-ui-fg-muted">
                                                    {RECIPIENT_MAP[n.recipient_type] || n.recipient_type}
                                                </Text>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Text size="small" className="text-ui-fg-muted">
                                                    {new Date(n.created_at).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                                </Text>
                                            </Table.Cell>
                                            <Table.Cell>
                                                {!n.is_read && (
                                                    <Button size="small" variant="secondary" onClick={() => markAsRead(n.id)}>Okundu</Button>
                                                )}
                                            </Table.Cell>
                                        </Table.Row>
                                    )
                                })}
                            </Table.Body>
                        </Table>
                    )}
            </div>
        </Container>
    )
}

export const config = defineRouteConfig({ label: "Bildirimler", icon: BellAlert })
export default NotificationsPage
