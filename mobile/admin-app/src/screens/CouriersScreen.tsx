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
import { getCouriers } from "../api/client"

const VEHICLE_LABELS: Record<string, string> = {
    motorcycle: "🏍️ Motosiklet",
    bicycle: "🚲 Bisiklet",
    car: "🚗 Araba",
    on_foot: "🚶 Yaya",
}

export default function CouriersScreen() {
    const [couriers, setCouriers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchCouriers = async () => {
        try {
            const data = await getCouriers()
            setCouriers(data || [])
        } catch (err) {
            console.error("Couriers yüklenemedi:", err)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchCouriers()
    }, [])

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#f59e0b" />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={couriers}
                keyExtractor={(item) => item.id}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCouriers() }} />}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.courierName}>{item.name}</Text>
                                <Text style={styles.vehicleType}>
                                    {VEHICLE_LABELS[item.vehicle_type] || item.vehicle_type}
                                </Text>
                            </View>
                            <View style={styles.badges}>
                                <View style={[styles.badge, { backgroundColor: item.is_active ? "#10b981" : "#ef4444" }]}>
                                    <Text style={styles.badgeText}>{item.is_active ? "Aktif" : "Pasif"}</Text>
                                </View>
                                <View style={[styles.badge, { backgroundColor: item.is_available ? "#3b82f6" : "#64748b" }]}>
                                    <Text style={styles.badgeText}>{item.is_available ? "Müsait" : "Meşgul"}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="call-outline" size={16} color="#94a3b8" />
                            <Text style={styles.infoText}>{item.phone}</Text>
                        </View>
                        {item.email && (
                            <View style={styles.infoRow}>
                                <Ionicons name="mail-outline" size={16} color="#94a3b8" />
                                <Text style={styles.infoText}>{item.email}</Text>
                            </View>
                        )}
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="bicycle-outline" size={48} color="#475569" />
                        <Text style={styles.emptyText}>Henüz kurye yok</Text>
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
    courierName: { fontSize: 18, fontWeight: "700", color: "#f8fafc" },
    vehicleType: { fontSize: 13, color: "#94a3b8", marginTop: 2 },
    badges: { flexDirection: "row", gap: 6 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    badgeText: { fontSize: 12, fontWeight: "600", color: "#fff" },
    infoRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
    infoText: { fontSize: 14, color: "#cbd5e1" },
    emptyContainer: { alignItems: "center", paddingTop: 60 },
    emptyText: { fontSize: 16, color: "#475569", marginTop: 12 },
})
