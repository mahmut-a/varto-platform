import React, { useEffect, useState, useCallback } from "react"
import {
    View, Text, StyleSheet, ScrollView, RefreshControl,
    TouchableOpacity, ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { colors, spacing, radius, typography } from "../theme/tokens"
import { getVendorOrders, getCurrentVendorId } from "../api/client"

interface Props {
    vendor: any
    navigation?: any
}

export default function DashboardScreen({ vendor }: Props) {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const loadData = useCallback(async () => {
        try {
            const data = await getVendorOrders()
            setOrders(data || [])
        } catch (err) {
            console.log("Dashboard veri hatası:", err)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [])

    useEffect(() => { loadData() }, [loadData])

    const onRefresh = () => { setRefreshing(true); loadData() }

    // İstatistikler
    const today = new Date().toISOString().split("T")[0]
    const todayOrders = orders.filter(o => o.created_at?.startsWith(today))
    const pendingOrders = orders.filter(o => o.status === "pending")
    const preparingOrders = orders.filter(o => o.status === "preparing")
    const completedToday = todayOrders.filter(o => o.status === "delivered" || o.status === "completed")
    const todayRevenue = completedToday.reduce((sum: number, o: any) => sum + (o.total || 0), 0)

    const stats = [
        { icon: "time-outline" as const, label: "Bekleyen", value: pendingOrders.length, color: colors.tag.orange },
        { icon: "flame-outline" as const, label: "Hazırlanan", value: preparingOrders.length, color: colors.tag.blue },
        { icon: "checkmark-circle-outline" as const, label: "Bugün Teslim", value: completedToday.length, color: colors.tag.green },
        { icon: "cash-outline" as const, label: "Bugün Gelir", value: `₺${todayRevenue}`, color: colors.tag.purple },
    ]

    if (loading) {
        return (
            <SafeAreaView style={s.container}>
                <ActivityIndicator size="large" color={colors.interactive} style={{ flex: 1 }} />
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={s.container} edges={["top"]}>
            <ScrollView
                contentContainerStyle={s.scroll}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.interactive} />}
            >
                {/* Header */}
                <View style={s.header}>
                    <View>
                        <Text style={s.greeting}>Merhaba 👋</Text>
                        <Text style={s.vendorName}>{vendor?.name || "İşletme"}</Text>
                    </View>
                    <View style={s.avatarCircle}>
                        <Ionicons name="storefront" size={22} color={colors.interactive} />
                    </View>
                </View>

                {/* Stats Grid */}
                <View style={s.statsGrid}>
                    {stats.map((stat, i) => (
                        <View key={i} style={s.statCard}>
                            <View style={[s.statIcon, { backgroundColor: stat.color.bg }]}>
                                <Ionicons name={stat.icon} size={20} color={stat.color.fg} />
                            </View>
                            <Text style={s.statValue}>{stat.value}</Text>
                            <Text style={s.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Son Siparişler */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>Son Siparişler</Text>
                    {orders.length === 0 ? (
                        <View style={s.emptyCard}>
                            <Ionicons name="receipt-outline" size={36} color={colors.fg.muted} />
                            <Text style={s.emptyText}>Henüz sipariş yok</Text>
                        </View>
                    ) : (
                        orders.slice(0, 5).map((order: any) => (
                            <View key={order.id} style={s.orderCard}>
                                <View style={s.orderTop}>
                                    <Text style={s.orderId}>#{order.id?.slice(-6)}</Text>
                                    <View style={[s.statusBadge, { backgroundColor: getStatusColor(order.status).bg }]}>
                                        <Text style={[s.statusText, { color: getStatusColor(order.status).fg }]}>
                                            {getStatusLabel(order.status)}
                                        </Text>
                                    </View>
                                </View>
                                <View style={s.orderBottom}>
                                    <Text style={s.orderInfo}>
                                        {order.items?.length || 0} ürün
                                    </Text>
                                    <Text style={s.orderPrice}>₺{order.total || 0}</Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

function getStatusColor(status: string) {
    switch (status) {
        case "pending": return colors.tag.orange
        case "confirmed": return colors.tag.blue
        case "preparing": return colors.tag.purple
        case "ready": return colors.tag.green
        case "delivered":
        case "completed": return colors.tag.green
        case "cancelled": return colors.tag.red
        default: return colors.tag.neutral
    }
}

function getStatusLabel(status: string) {
    switch (status) {
        case "pending": return "Bekliyor"
        case "confirmed": return "Onaylandı"
        case "preparing": return "Hazırlanıyor"
        case "ready": return "Hazır"
        case "delivered": return "Teslim"
        case "completed": return "Tamamlandı"
        case "cancelled": return "İptal"
        default: return status
    }
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg.subtle },
    scroll: { padding: spacing.lg, paddingBottom: 100 },
    header: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        marginBottom: spacing.xxl,
    },
    greeting: { ...typography.body, color: colors.fg.muted },
    vendorName: { ...typography.h1, marginTop: 2 },
    avatarCircle: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: "#FFF7ED",
        justifyContent: "center", alignItems: "center",
        borderWidth: 1, borderColor: colors.border.base,
    },
    statsGrid: {
        flexDirection: "row", flexWrap: "wrap",
        gap: spacing.md, marginBottom: spacing.xxl,
    },
    statCard: {
        flex: 1, minWidth: "45%",
        backgroundColor: colors.bg.base,
        borderRadius: radius.lg,
        padding: spacing.lg,
        borderWidth: 1, borderColor: colors.border.base,
    },
    statIcon: {
        width: 36, height: 36, borderRadius: radius.sm,
        justifyContent: "center", alignItems: "center",
        marginBottom: spacing.sm,
    },
    statValue: { ...typography.h1, fontSize: 24, marginBottom: 2 },
    statLabel: { ...typography.caption },
    section: { marginBottom: spacing.xxl },
    sectionTitle: { ...typography.h2, marginBottom: spacing.md },
    emptyCard: {
        backgroundColor: colors.bg.base,
        borderRadius: radius.lg,
        padding: spacing.xxxl,
        alignItems: "center", gap: spacing.sm,
        borderWidth: 1, borderColor: colors.border.base,
    },
    emptyText: { ...typography.body, color: colors.fg.muted },
    orderCard: {
        backgroundColor: colors.bg.base,
        borderRadius: radius.md,
        padding: spacing.lg,
        marginBottom: spacing.sm,
        borderWidth: 1, borderColor: colors.border.base,
    },
    orderTop: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        marginBottom: spacing.sm,
    },
    orderId: { ...typography.h3, fontFamily: "monospace" },
    statusBadge: {
        paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
        borderRadius: radius.sm,
    },
    statusText: { fontSize: 12, fontWeight: "600" },
    orderBottom: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    },
    orderInfo: { ...typography.small },
    orderPrice: { ...typography.h3, color: colors.interactive },
})
