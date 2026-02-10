import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { getListings, updateListing } from "../api/client"

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    pending: { label: "Bekliyor", color: "#f59e0b" },
    approved: { label: "Onaylı", color: "#10b981" },
    rejected: { label: "Reddedildi", color: "#ef4444" },
    expired: { label: "Süresi Doldu", color: "#64748b" },
}

const CATEGORY_LABELS: Record<string, string> = {
    rental: "🏠 Kiralık",
    sale: "🏷️ Satılık",
    job: "👷 İş İlanı",
    service: "🔧 Hizmet",
    other: "📦 Diğer",
}

export default function ListingsScreen() {
    const [listings, setListings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchListings = async () => {
        try {
            const data = await getListings()
            setListings(data || [])
        } catch (err) {
            console.error("Listings yüklenemedi:", err)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchListings()
    }, [])

    const handleApprove = async (id: string) => {
        try {
            await updateListing(id, { status: "approved" })
            setListings((prev) =>
                prev.map((l) => (l.id === id ? { ...l, status: "approved" } : l))
            )
        } catch (err) {
            Alert.alert("Hata", "Onaylama başarısız oldu.")
        }
    }

    const handleReject = async (id: string) => {
        try {
            await updateListing(id, { status: "rejected" })
            setListings((prev) =>
                prev.map((l) => (l.id === id ? { ...l, status: "rejected" } : l))
            )
        } catch (err) {
            Alert.alert("Hata", "Reddetme başarısız oldu.")
        }
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#10b981" />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={listings}
                keyExtractor={(item) => item.id}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchListings() }} />}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => {
                    const status = STATUS_CONFIG[item.status] || { label: item.status, color: "#64748b" }
                    return (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.title}>{item.title}</Text>
                                    <Text style={styles.category}>{CATEGORY_LABELS[item.category] || item.category}</Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                                    <Text style={styles.statusText}>{status.label}</Text>
                                </View>
                            </View>

                            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

                            <View style={styles.metaRow}>
                                {item.price && (
                                    <Text style={styles.price}>₺{Number(item.price).toLocaleString("tr-TR")}</Text>
                                )}
                                <Text style={styles.location}>📍 {item.location}</Text>
                            </View>

                            <View style={styles.contactRow}>
                                <Ionicons name="person-outline" size={14} color="#94a3b8" />
                                <Text style={styles.contactText}>{item.contact_name} • {item.contact_phone}</Text>
                            </View>

                            {item.status === "pending" && (
                                <View style={styles.actionRow}>
                                    <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(item.id)}>
                                        <Ionicons name="checkmark" size={18} color="#fff" />
                                        <Text style={styles.btnText}>Onayla</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(item.id)}>
                                        <Ionicons name="close" size={18} color="#fff" />
                                        <Text style={styles.btnText}>Reddet</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )
                }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="megaphone-outline" size={48} color="#475569" />
                        <Text style={styles.emptyText}>Henüz ilan yok</Text>
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
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
    title: { fontSize: 17, fontWeight: "700", color: "#f8fafc" },
    category: { fontSize: 13, color: "#94a3b8", marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    statusText: { fontSize: 12, fontWeight: "600", color: "#fff" },
    description: { fontSize: 14, color: "#cbd5e1", marginBottom: 8, lineHeight: 20 },
    metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
    price: { fontSize: 18, fontWeight: "800", color: "#10b981" },
    location: { fontSize: 13, color: "#94a3b8" },
    contactRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
    contactText: { fontSize: 13, color: "#64748b" },
    actionRow: { flexDirection: "row", gap: 10, marginTop: 8 },
    approveBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#10b981", padding: 12, borderRadius: 10 },
    rejectBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#ef4444", padding: 12, borderRadius: 10 },
    btnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
    emptyContainer: { alignItems: "center", paddingTop: 60 },
    emptyText: { fontSize: 16, color: "#475569", marginTop: 12 },
})
