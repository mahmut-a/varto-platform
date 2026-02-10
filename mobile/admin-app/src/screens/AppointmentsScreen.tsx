import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { colors, spacing, radius, typography } from "../theme/tokens"
import { getAppointments } from "../api/client"

const STATUS_MAP: Record<string, { label: string; tag: keyof typeof colors.tag }> = {
    pending: { label: "Bekliyor", tag: "orange" },
    confirmed: { label: "Onaylandı", tag: "green" },
    rejected: { label: "Reddedildi", tag: "red" },
    cancelled: { label: "İptal", tag: "neutral" },
    completed: { label: "Tamamlandı", tag: "blue" },
}

export default function AppointmentsScreen() {
    const [appointments, setAppointments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchAppointments = async () => {
        try {
            const data = await getAppointments()
            setAppointments(data || [])
        } catch { } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => { fetchAppointments() }, [])

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="small" color={colors.fg.muted} /></View>
    }

    return (
        <FlatList
            style={styles.container}
            data={appointments}
            keyExtractor={(item) => item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAppointments() }} tintColor={colors.fg.muted} />}
            contentContainerStyle={{ padding: spacing.xl }}
            ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
            renderItem={({ item }) => {
                const status = STATUS_MAP[item.status] || { label: item.status, tag: "neutral" as const }
                const tagColors = colors.tag[status.tag]
                const date = new Date(item.date)

                return (
                    <View style={styles.card}>
                        <View style={styles.cardRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.name}>{item.service_name}</Text>
                                <Text style={styles.meta}>{item.duration_minutes} dakika</Text>
                            </View>
                            <View style={[styles.tag, { backgroundColor: tagColors.bg }]}>
                                <Text style={[styles.tagText, { color: tagColors.fg }]}>{status.label}</Text>
                            </View>
                        </View>

                        <View style={styles.dateRow}>
                            <Ionicons name="calendar-outline" size={14} color={colors.fg.muted} />
                            <Text style={styles.dateText}>
                                {date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                            </Text>
                            <Text style={styles.timeText}>
                                {date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                            </Text>
                        </View>

                        {item.notes && (
                            <View style={styles.notesRow}>
                                <Ionicons name="document-text-outline" size={13} color={colors.fg.muted} />
                                <Text style={styles.notesText}>{item.notes}</Text>
                            </View>
                        )}
                    </View>
                )
            }}
            ListEmptyComponent={
                <View style={styles.empty}><Text style={styles.emptyText}>Henüz randevu yok</Text></View>
            }
        />
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg.base },
    center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg.base },
    card: {
        backgroundColor: colors.bg.base,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border.base,
        padding: spacing.lg,
    },
    cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.md },
    name: { ...typography.h3 },
    meta: { ...typography.small, marginTop: 2 },
    tag: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm },
    tagText: { fontSize: 12, fontWeight: "500" },
    dateRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    dateText: { ...typography.body },
    timeText: { ...typography.label, marginLeft: "auto" },
    notesRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.sm },
    notesText: { ...typography.small },
    empty: { alignItems: "center", paddingTop: 60 },
    emptyText: { ...typography.body },
})
