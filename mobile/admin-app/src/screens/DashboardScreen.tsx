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
import { colors, spacing, radius, typography } from "../theme/tokens"
import { getVendors, getCouriers, getVartoOrders, getListings, getAppointments } from "../api/client"

interface StatCardProps {
    title: string
    count: number
    icon: string
    onPress: () => void
}

function StatCard({ title, count, icon, onPress }: StatCardProps) {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.cardIcon}>
                <Ionicons name={icon as any} size={20} color={colors.fg.muted} />
            </View>
            <Text style={styles.cardCount}>{count}</Text>
            <Text style={styles.cardTitle}>{title}</Text>
        </TouchableOpacity>
    )
}

export default function DashboardScreen({ navigation }: any) {
    const [stats, setStats] = useState({ vendors: 0, couriers: 0, orders: 0, listings: 0, appointments: 0 })
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchStats = async () => {
        try {
            const [vendors, couriers, orders, listings, appointments] = await Promise.all([
                getVendors().catch(() => []),
                getCouriers().catch(() => []),
                getVartoOrders().catch(() => []),
                getListings().catch(() => []),
                getAppointments().catch(() => []),
            ])
            setStats({
                vendors: vendors?.length || 0,
                couriers: couriers?.length || 0,
                orders: orders?.length || 0,
                listings: listings?.length || 0,
                appointments: appointments?.length || 0,
            })
        } catch { } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => { fetchStats() }, [])

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="small" color={colors.fg.muted} /></View>
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats() }} tintColor={colors.fg.muted} />}
        >
            <Text style={styles.heading}>Genel Bakış</Text>

            <View style={styles.grid}>
                <StatCard title="İşletmeler" count={stats.vendors} icon="storefront-outline" onPress={() => navigation.navigate("Vendors")} />
                <StatCard title="Kuryeler" count={stats.couriers} icon="bicycle-outline" onPress={() => navigation.navigate("Couriers")} />
                <StatCard title="Siparişler" count={stats.orders} icon="bag-outline" onPress={() => navigation.navigate("Orders")} />
                <StatCard title="İlanlar" count={stats.listings} icon="document-text-outline" onPress={() => navigation.navigate("Listings")} />
            </View>

            <Text style={[styles.heading, { marginTop: spacing.xxl }]}>Hızlı İşlemler</Text>

            <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate("Orders")}>
                <Ionicons name="bag-outline" size={18} color={colors.fg.subtle} />
                <Text style={styles.actionText}>Aktif siparişleri görüntüle</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.fg.muted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate("Listings")}>
                <Ionicons name="checkmark-circle-outline" size={18} color={colors.fg.subtle} />
                <Text style={styles.actionText}>Bekleyen ilanları onayla</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.fg.muted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate("Vendors")}>
                <Ionicons name="add-outline" size={18} color={colors.fg.subtle} />
                <Text style={styles.actionText}>Yeni işletme ekle</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.fg.muted} />
            </TouchableOpacity>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg.base },
    content: { padding: spacing.xl },
    center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg.base },
    heading: { ...typography.h2, marginBottom: spacing.lg },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
    card: {
        backgroundColor: colors.bg.subtle,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border.base,
        padding: spacing.lg,
        width: "48%",
    },
    cardIcon: { marginBottom: spacing.md },
    cardCount: { fontSize: 28, fontWeight: "600", color: colors.fg.base, letterSpacing: -0.5 },
    cardTitle: { ...typography.small, marginTop: spacing.xs },
    actionItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.base,
        gap: spacing.md,
    },
    actionText: { ...typography.body, flex: 1 },
})
