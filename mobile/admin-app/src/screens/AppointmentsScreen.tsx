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
import { getAppointments } from "../api/client"

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    pending: { label: "Bekliyor", color: "#f59e0b" },
    confirmed: { label: "Onaylandı", color: "#10b981" },
    rejected: { label: "Reddedildi", color: "#ef4444" },
    cancelled: { label: "İptal", color: "#64748b" },
    completed: { label: "Tamamlandı", color: "#3b82f6" },
}

export default function AppointmentsScreen() {
    const [appointments, setAppointments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchAppointments = async () => {
        try {
            const data = await getAppointments()
            setAppointments(data || [])
        } catch (err) {
            console.error("Appointments yüklenemedi:", err)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchAppointments()
    }, [])

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8b5cf6" />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={appointments}
                keyExtractor={(item) => item.id}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAppointments() }} />}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => {
                    const status = STATUS_CONFIG[item.status] || { label: item.status, color: "#64748b" }
                    const date = new Date(item.date)
                    return (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.serviceName}>{item.service_name}</Text>
                                    <Text style={styles.duration}>{item.duration_minutes} dakika</Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                                    <Text style={styles.statusText}>{status.label}</Text>
                                </View>
                            </View>

                            <View style={styles.dateContainer}>
                                <View style={styles.dateBox}>
                                    <Text style={styles.dateDay}>{date.getDate()}</Text>
                                    <Text style={styles.dateMonth}>
                                        {date.toLocaleDateString("tr-TR", { month: "short" })}
                                    </Text>
                                </View>
                                <View>
                                    <Text style={styles.dateTime}>
                                        {date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                                    </Text>
                                    <Text style={styles.dateFull}>
                                        {date.toLocaleDateString("tr-TR", { weekday: "long" })}
                                    </Text>
                                </View>
                            </View>

                            {item.notes && (
                                <View style={styles.notesRow}>
                                    <Ionicons name="document-text-outline" size={14} color="#94a3b8" />
                                    <Text style={styles.notesText}>{item.notes}</Text>
                                </View>
                            )}
                        </View>
                    )
                }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={48} color="#475569" />
                        <Text style={styles.emptyText}>Henüz randevu yok</Text>
                    </View>
                }
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0f172a" },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0f172a" },
    card: { backgroundColor: "#1e293b", borderRadius: 16, padding: 16, marginBottom: 12 },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
    serviceName: { fontSize: 17, fontWeight: "700", color: "#f8fafc" },
    duration: { fontSize: 13, color: "#94a3b8", marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    statusText: { fontSize: 12, fontWeight: "600", color: "#fff" },
    dateContainer: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 10 },
    dateBox: { backgroundColor: "#6366f120", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, alignItems: "center" },
    dateDay: { fontSize: 22, fontWeight: "800", color: "#6366f1" },
    dateMonth: { fontSize: 12, color: "#6366f1", fontWeight: "600", textTransform: "uppercase" },
    dateTime: { fontSize: 18, fontWeight: "700", color: "#f8fafc" },
    dateFull: { fontSize: 13, color: "#94a3b8", textTransform: "capitalize" },
    notesRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
    notesText: { fontSize: 13, color: "#64748b" },
    emptyContainer: { alignItems: "center", paddingTop: 60 },
    emptyText: { fontSize: 16, color: "#475569", marginTop: 12 },
})
