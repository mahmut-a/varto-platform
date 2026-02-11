import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Calendar } from "@medusajs/icons"
import { Container, Heading, Table, Badge, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

const STATUS_MAP: Record<string, { label: string; color: "green" | "blue" | "orange" | "red" | "grey" }> = {
    pending: { label: "Bekliyor", color: "orange" },
    confirmed: { label: "Onaylandı", color: "green" },
    rejected: { label: "Reddedildi", color: "red" },
    cancelled: { label: "İptal", color: "grey" },
    completed: { label: "Tamamlandı", color: "blue" },
}

const AppointmentsPage = () => {
    const [appointments, setAppointments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/admin/appointments", { credentials: "include" })
            .then((r) => r.json())
            .then((d) => setAppointments(d.appointments || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <Heading level="h2">Randevular</Heading>
                <Text size="small" className="text-ui-fg-muted">
                    {appointments.length} randevu
                </Text>
            </div>
            <div className="px-6 py-4">
                {loading ? (
                    <Text className="text-ui-fg-muted">Yükleniyor...</Text>
                ) : appointments.length === 0 ? (
                    <Text className="text-ui-fg-muted">Henüz randevu yok.</Text>
                ) : (
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Hizmet</Table.HeaderCell>
                                <Table.HeaderCell>Tarih</Table.HeaderCell>
                                <Table.HeaderCell>Saat</Table.HeaderCell>
                                <Table.HeaderCell>Süre</Table.HeaderCell>
                                <Table.HeaderCell>Durum</Table.HeaderCell>
                                <Table.HeaderCell>Notlar</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {appointments.map((a: any) => {
                                const status = STATUS_MAP[a.status] || { label: a.status, color: "grey" as const }
                                const date = new Date(a.date)
                                return (
                                    <Table.Row key={a.id}>
                                        <Table.Cell>
                                            <Text size="small" weight="plus">{a.service_name}</Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Text size="small">
                                                {date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                                            </Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Text size="small" className="text-ui-fg-muted">
                                                {date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                                            </Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Text size="small">{a.duration_minutes} dk</Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Badge color={status.color} size="2xsmall">{status.label}</Badge>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Text size="small" className="text-ui-fg-muted max-w-[200px] truncate">
                                                {a.notes || "—"}
                                            </Text>
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
    label: "Randevular",
    icon: Calendar,
})

export default AppointmentsPage
