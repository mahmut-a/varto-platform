import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { getVendors, getCouriers, getVartoOrders, getListings, getAppointments } from "../api/client"

interface Stats {
    vendors: number
    couriers: number
    orders: number
    listings: number
    appointments: number
}

export default function DashboardScreen({ navigation }: any) {
    const [stats, setStats] = useState<Stats>({
        vendors: 0,
        couriers: 0,
        orders: 0,
        listings: 0,
        appointments: 0,
    })
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchStats = async () => {
        try {
            const [vendors, couriers, orders, listings, appointments] =
                await Promise.all([
                    getVendors(),
                    getCouriers(),
                    getVartoOrders(),
                    getListings(),
                    getAppointments(),
                ])
            setStats({
                vendors: vendors?.length || 0,
                couriers: couriers?.length || 0,
                orders: orders?.length || 0,
                listings: listings?.length || 0,
                appointments: appointments?.length || 0,
            })
        } catch (err) {
            console.error("Stats yüklenemedi:", err)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchStats()
    }, [])

    const onRefresh = () => {
        setRefreshing(true)
        fetchStats()
    }

    const cards = [
        { title: "İşletmeler", count: stats.vendors, icon: "storefront", color: "#6366f1", screen: "Vendors" },
        { title: "Kuryeler", count: stats.couriers, icon: "bicycle", color: "#f59e0b", screen: "Couriers" },
        { title: "Siparişler", count: stats.orders, icon: "cart", color: "#ef4444", screen: "Orders" },
        { title: "İlanlar", count: stats.listings, icon: "megaphone", color: "#10b981", screen: "Listings" },
        { title: "Randevular", count: stats.appointments, icon: "calendar", color: "#8b5cf6", screen: "Appointments" },
    ]

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={styles.loadingText}>Yükleniyor...</Text>
            </View>
        )
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>🏔️ Varto Admin</Text>
                <Text style={styles.headerSubtitle}>Yerel Süper Platform Yönetimi</Text>
            </View>

            <View style={styles.grid}>
                {cards.map((card) => (
                    <TouchableOpacity
                        key={card.title}
                        style={[styles.card, { borderLeftColor: card.color }]}
                        onPress={() => navigation.navigate(card.screen)}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: card.color + "20" }]}>
                            <Ionicons name={card.icon as any} size={28} color={card.color} />
                        </View>
                        <Text style={styles.cardCount}>{card.count}</Text>
                        <Text style={styles.cardTitle}>{card.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.quickActions}>
                <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate("Vendors")}
                >
                    <Ionicons name="add-circle" size={22} color="#6366f1" />
                    <Text style={styles.actionText}>Yeni İşletme Ekle</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate("Orders")}
                >
                    <Ionicons name="list" size={22} color="#ef4444" />
                    <Text style={styles.actionText}>Siparişleri Görüntüle</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate("Listings")}
                >
                    <Ionicons name="checkmark-circle" size={22} color="#10b981" />
                    <Text style={styles.actionText}>İlanları Onayla</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0f172a" },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0f172a" },
    loadingText: { color: "#94a3b8", marginTop: 12, fontSize: 16 },
    header: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20 },
    headerTitle: { fontSize: 28, fontWeight: "800", color: "#f8fafc" },
    headerSubtitle: { fontSize: 14, color: "#94a3b8", marginTop: 4 },
    grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, gap: 12 },
    card: {
        backgroundColor: "#1e293b",
        borderRadius: 16,
        padding: 16,
        width: "47%",
        borderLeftWidth: 4,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    cardCount: { fontSize: 32, fontWeight: "800", color: "#f8fafc" },
    cardTitle: { fontSize: 14, color: "#94a3b8", marginTop: 4 },
    quickActions: { padding: 20, marginTop: 8 },
    sectionTitle: { fontSize: 18, fontWeight: "700", color: "#f8fafc", marginBottom: 12 },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1e293b",
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        gap: 12,
    },
    actionText: { fontSize: 16, color: "#e2e8f0", fontWeight: "500" },
})
