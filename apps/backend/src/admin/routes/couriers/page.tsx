import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ArrowPath } from "@medusajs/icons"
import { Container, Heading, Table, Badge, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

const VEHICLE_MAP: Record<string, string> = {
    motorcycle: "Motosiklet",
    bicycle: "Bisiklet",
    car: "Araba",
    on_foot: "Yaya",
}

const CouriersPage = () => {
    const [couriers, setCouriers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/admin/couriers", { credentials: "include" })
            .then((r) => r.json())
            .then((d) => setCouriers(d.couriers || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <Heading level="h2">Kuryeler</Heading>
                <Text size="small" className="text-ui-fg-muted">
                    {couriers.length} kurye
                </Text>
            </div>
            <div className="px-6 py-4">
                {loading ? (
                    <Text className="text-ui-fg-muted">Yükleniyor...</Text>
                ) : couriers.length === 0 ? (
                    <Text className="text-ui-fg-muted">Henüz kurye yok.</Text>
                ) : (
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>İsim</Table.HeaderCell>
                                <Table.HeaderCell>Telefon</Table.HeaderCell>
                                <Table.HeaderCell>E-posta</Table.HeaderCell>
                                <Table.HeaderCell>Araç</Table.HeaderCell>
                                <Table.HeaderCell>Durum</Table.HeaderCell>
                                <Table.HeaderCell>Müsaitlik</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {couriers.map((c: any) => (
                                <Table.Row key={c.id}>
                                    <Table.Cell>
                                        <Text size="small" weight="plus">{c.name}</Text>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Text size="small" className="text-ui-fg-muted">{c.phone}</Text>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Text size="small" className="text-ui-fg-muted">{c.email || "—"}</Text>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Text size="small">{VEHICLE_MAP[c.vehicle_type] || c.vehicle_type}</Text>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Badge color={c.is_active ? "green" : "red"} size="2xsmall">
                                            {c.is_active ? "Aktif" : "Pasif"}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Badge color={c.is_available ? "blue" : "grey"} size="2xsmall">
                                            {c.is_available ? "Müsait" : "Meşgul"}
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
    label: "Kuryeler",
    icon: ArrowPath,
})

export default CouriersPage
