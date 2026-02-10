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
import { getVartoOrders } from "../api/client"

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    pending: { label: "Bekliyor", color: "#f59e0b" },
    confirmed: { label: "Onaylandı", color: "#3b82f6" },
    preparing: { label: "Hazırlanıyor", color: "#8b5cf6" },
    ready: { label: "Hazır", color: "#06b6d4" },
    assigned: { label: "Atandı", color: "#6366f1" },
    accepted: { label: "Kabul Edildi", color: "#14b8a6" },
    delivering: { label: "Teslim Ediliyor", color: "#f97316" },
    delivered: { label: "Teslim Edildi", color: "#10b981" },
    cancelled: { label: "İptal", color: "#ef4444" },
}

export default function OrdersScreen() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchOrders = async () => {
        try {
            const data = await getVartoOrders()
            setOrders(data || [])
        } catch (err) {
            console.error("Orders yüklenemedi:", err)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ef4444" />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={orders}
                keyExtractor={(item) => item.id}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders() }} />}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => {
                    const status = STATUS_CONFIG[item.varto_status] || { label: item.varto_status, color: "#64748b" }
                    const address = item.delivery_address || {}
                    return (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.orderId}>#{item.id?.slice(-6).toUpperCase()}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                                    <Text style={styles.statusText}>{status.label}</Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <Ionicons name="location-outline" size={16} color="#94a3b8" />
                                <Text style={styles.infoText}>
                                    {address.neighborhood} {address.street} {address.building}
                                </Text>
                            </View>

                            {item.delivery_notes && (
                                <View style={styles.infoRow}>
                                    <Ionicons name="chatbubble-outline" size={16} color="#94a3b8" />
                                    <Text style={styles.infoText}>{item.delivery_notes}</Text>
                                </View>
                            )}

                            <View style={styles.footer}>
                                <Text style={styles.paymentMethod}>
                                    💳 {item.payment_method?.toUpperCase()}
                                </Text>
                                <Text style={styles.date}>
                                    {new Date(item.created_at).toLocaleDateString("tr-TR")}
                                </Text>
                            </View>
                        </View>
                    )
                }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="cart-outline" size={48} color="#475569" />
                        <Text style={styles.emptyText}>Henüz sipariş yok</Text>
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
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    orderId: { fontSize: 16, fontWeight: "700", color: "#f8fafc", fontFamily: "monospace" },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
    statusText: { fontSize: 12, fontWeight: "700", color: "#fff" },
    infoRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
    infoText: { fontSize: 14, color: "#cbd5e1", flex: 1 },
    footer: { flexDirection: "row", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#334155" },
    paymentMethod: { fontSize: 13, color: "#94a3b8" },
    date: { fontSize: 13, color: "#64748b" },
    emptyContainer: { alignItems: "center", paddingTop: 60 },
    emptyText: { fontSize: 16, color: "#475569", marginTop: 12 },
})
