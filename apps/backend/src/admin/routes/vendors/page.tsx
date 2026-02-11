import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Buildings } from "@medusajs/icons"
import { Container, Heading, Table, Badge, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

const CATEGORY_MAP: Record<string, string> = {
    restaurant: "Restoran",
    market: "Market",
    pharmacy: "Eczane",
    stationery: "Kırtasiye",
    barber: "Berber",
    other: "Diğer",
}

const VendorsPage = () => {
    const [vendors, setVendors] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/admin/vendors", { credentials: "include" })
            .then((r) => r.json())
            .then((d) => setVendors(d.vendors || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <Heading level="h2">İşletmeler</Heading>
                <Text size="small" className="text-ui-fg-muted">
                    {vendors.length} işletme
                </Text>
            </div>
            <div className="px-6 py-4">
                {loading ? (
                    <Text className="text-ui-fg-muted">Yükleniyor...</Text>
                ) : vendors.length === 0 ? (
                    <Text className="text-ui-fg-muted">Henüz işletme yok.</Text>
                ) : (
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>İsim</Table.HeaderCell>
                                <Table.HeaderCell>Kategori</Table.HeaderCell>
                                <Table.HeaderCell>Telefon</Table.HeaderCell>
                                <Table.HeaderCell>Adres</Table.HeaderCell>
                                <Table.HeaderCell>Durum</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {vendors.map((v: any) => (
                                <Table.Row key={v.id}>
                                    <Table.Cell>
                                        <Text size="small" weight="plus">{v.name}</Text>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Text size="small">{CATEGORY_MAP[v.category] || v.category}</Text>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Text size="small" className="text-ui-fg-muted">{v.phone}</Text>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Text size="small" className="text-ui-fg-muted">{v.address}</Text>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Badge color={v.is_active ? "green" : "red"} size="2xsmall">
                                            {v.is_active ? "Aktif" : "Pasif"}
                                        </Badge>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                )}
            </div>
        </Container>
    )
}

export const config = defineRouteConfig({
    label: "İşletmeler",
    icon: Buildings,
})

export default VendorsPage
