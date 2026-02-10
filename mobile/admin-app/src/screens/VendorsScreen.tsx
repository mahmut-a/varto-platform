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
import { getVendors, deleteVendor } from "../api/client"

const CATEGORY_LABELS: Record<string, string> = {
    restaurant: "🍽️ Restoran",
    market: "🛒 Market",
    pharmacy: "💊 Eczane",
    stationery: "📎 Kırtasiye",
    barber: "💈 Berber",
    other: "📦 Diğer",
}

export default function VendorsScreen() {
    const [vendors, setVendors] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchVendors = async () => {
        try {
            const data = await getVendors()
            setVendors(data || [])
        } catch (err) {
            console.error("Vendors yüklenemedi:", err)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchVendors()
    }, [])

    const handleDelete = (id: string, name: string) => {
        Alert.alert("İşletmeyi Sil", `${name} silinecek, emin misiniz?`, [
            { text: "İptal", style: "cancel" },
            {
                text: "Sil",
                style: "destructive",
                onPress: async () => {
                    try {
                        await deleteVendor(id)
                        setVendors((prev) => prev.filter((v) => v.id !== id))
                    } catch (err) {
                        Alert.alert("Hata", "Silme işlemi başarısız.")
                    }
                },
            },
        ])
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={vendors}
                keyExtractor={(item) => item.id}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchVendors() }} />}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.vendorName}>{item.name}</Text>
                                <Text style={styles.vendorCategory}>
                                    {CATEGORY_LABELS[item.category] || item.category}
                                </Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: item.is_active ? "#10b981" : "#ef4444" }]}>
                                <Text style={styles.statusText}>{item.is_active ? "Aktif" : "Pasif"}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <Ionicons name="call-outline" size={16} color="#94a3b8" />
                            <Text style={styles.infoText}>{item.phone}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={16} color="#94a3b8" />
                            <Text style={styles.infoText}>{item.address}</Text>
                        </View>

                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => handleDelete(item.id, item.name)}
                            >
                                <Ionicons name="trash-outline" size={18} color="#ef4444" />
                                <Text style={styles.deleteText}>Sil</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="storefront-outline" size={48} color="#475569" />
                        <Text style={styles.emptyText}>Henüz işletme yok</Text>
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
    vendorName: { fontSize: 18, fontWeight: "700", color: "#f8fafc" },
    vendorCategory: { fontSize: 13, color: "#94a3b8", marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    statusText: { fontSize: 12, fontWeight: "600", color: "#fff" },
    infoRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
    infoText: { fontSize: 14, color: "#cbd5e1" },
    actions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 8 },
    deleteButton: { flexDirection: "row", alignItems: "center", gap: 4, padding: 8 },
    deleteText: { fontSize: 14, color: "#ef4444" },
    emptyContainer: { alignItems: "center", paddingTop: 60 },
    emptyText: { fontSize: 16, color: "#475569", marginTop: 12 },
})
