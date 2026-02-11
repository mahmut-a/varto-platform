import { defineRouteConfig } from "@medusajs/admin-sdk"
import { DocumentText } from "@medusajs/icons"
import { Container, Heading, Table, Badge, Text, Button } from "@medusajs/ui"
import { useEffect, useState } from "react"

const STATUS_MAP: Record<string, { label: string; color: "green" | "orange" | "red" | "grey" }> = {
    pending: { label: "Bekliyor", color: "orange" },
    approved: { label: "Onaylı", color: "green" },
    rejected: { label: "Reddedildi", color: "red" },
    expired: { label: "Süresi Doldu", color: "grey" },
}

const CATEGORY_MAP: Record<string, string> = {
    rental: "Kiralık",
    sale: "Satılık",
    job: "İş İlanı",
    service: "Hizmet",
    other: "Diğer",
}

const ListingsPage = () => {
    const [listings, setListings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchListings = () => {
        setLoading(true)
        fetch("/admin/listings", { credentials: "include" })
            .then((r) => r.json())
            .then((d) => setListings(d.listings || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }

    useEffect(() => { fetchListings() }, [])

    const updateStatus = async (id: string, status: string) => {
        await fetch(`/admin/listings/${id}`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        })
        setListings((prev) => prev.map((l) => l.id === id ? { ...l, status } : l))
    }

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <Heading level="h2">İlanlar</Heading>
                <Text size="small" className="text-ui-fg-muted">
                    {listings.length} ilan
                </Text>
            </div>
            <div className="px-6 py-4">
                {loading ? (
                    <Text className="text-ui-fg-muted">Yükleniyor...</Text>
                ) : listings.length === 0 ? (
                    <Text className="text-ui-fg-muted">Henüz ilan yok.</Text>
                ) : (
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Başlık</Table.HeaderCell>
                                <Table.HeaderCell>Kategori</Table.HeaderCell>
                                <Table.HeaderCell>Fiyat</Table.HeaderCell>
                                <Table.HeaderCell>Konum</Table.HeaderCell>
                                <Table.HeaderCell>İletişim</Table.HeaderCell>
                                <Table.HeaderCell>Durum</Table.HeaderCell>
                                <Table.HeaderCell>İşlem</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {listings.map((l: any) => {
                                const status = STATUS_MAP[l.status] || { label: l.status, color: "grey" as const }
                                return (
                                    <Table.Row key={l.id}>
                                        <Table.Cell>
                                            <Text size="small" weight="plus">{l.title}</Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Text size="small">{CATEGORY_MAP[l.category] || l.category}</Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Text size="small">
                                                {l.price != null ? `₺${Number(l.price).toLocaleString("tr-TR")}` : "—"}
                                            </Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Text size="small" className="text-ui-fg-muted">{l.location || "—"}</Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Text size="small" className="text-ui-fg-muted">
                                                {l.contact_name} · {l.contact_phone}
                                            </Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Badge color={status.color} size="2xsmall">{status.label}</Badge>
                                        </Table.Cell>
                                        <Table.Cell>
                                            {l.status === "pending" && (
                                                <div className="flex gap-2">
                                                    <Button size="small" variant="primary" onClick={() => updateStatus(l.id, "approved")}>
                                                        Onayla
                                                    </Button>
                                                    <Button size="small" variant="secondary" onClick={() => updateStatus(l.id, "rejected")}>
                                                        Reddet
                                                    </Button>
                                                </div>
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

export const config = defineRouteConfig({
    label: "İlanlar",
    icon: DocumentText,
})

export default ListingsPage
