import React, { useState, useCallback } from "react"
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, RefreshControl,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { colors, spacing, radius, typography } from "../theme/tokens"
import { getAllOrders, getCurrentCourierId } from "../api/client"
import { useFocusEffect } from "@react-navigation/native"

interface Props {
    courier: any
    navigation?: any
}

export default function DashboardScreen({ courier, navigation }: Props) {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchData = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true)
            else setLoading(true)

            const allOrders = await getAllOrders()
            setOrders(allOrders || [])
        } catch (err) {
            console.error("Dashboard veri hatası:", err)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useFocusEffect(
        useCallback(() => {
            fetchData()
        }, [])
    )

    const courierId = getCurrentCourierId()

    // Siparişleri filtrele
    const confirmedOrders = orders.filter(o => o.varto_status === "confirmed" && !o.courier_id)
    const myActiveOrders = orders.filter(
        o => o.courier_id === courierId &&
            ["assigned", "accepted", "delivering"].includes(o.varto_status)
    )
    const myDeliveredToday = orders.filter(o => {
        if (o.courier_id !== courierId || o.varto_status !== "delivered") return false
        const today = new Date().toDateString()
        return new Date(o.updated_at || o.created_at).toDateString() === today
    })

    // İstatistikler
    const todayEarnings = myDeliveredToday.reduce((sum, o) =>
        sum + (Number(o.delivery_fee) || 0), 0
    )

    const stats = [
        {
            icon: "alert-circle-outline" as const,
            label: "Bekleyen",
            value: confirmedOrders.length.toString(),
            color: colors.tag.orange.fg,
            bgColor: colors.tag.orange.bg,
        },
        {
            icon: "bicycle-outline" as const,
            label: "Aktif",
            value: myActiveOrders.length.toString(),
            color: colors.interactive,
            bgColor: "#EFF6FF",
        },
        {
            icon: "checkmark-circle-outline" as const,
            label: "Bugün",
            value: myDeliveredToday.length.toString(),
            color: colors.tag.green.fg,
            bgColor: colors.tag.green.bg,
        },
        {
            icon: "wallet-outline" as const,
            label: "Kazanç",
            value: `₺${todayEarnings.toFixed(0)}`,
            color: colors.tag.purple.fg,
            bgColor: colors.tag.purple.bg,
        },
    ]

    const getStatusColor = (status: string) => {
        const map: Record<string, { bg: string; fg: string }> = {
            confirmed: colors.tag.orange,
            assigned: colors.tag.blue,
            accepted: colors.tag.blue,
            delivering: colors.tag.purple,
        }
        return map[status] || colors.tag.neutral
    }

    const getStatusLabel = (status: string) => {
        const map: Record<string, string> = {
            confirmed: "Onaylandı",
            assigned: "Atandı",
            accepted: "Kabul Edildi",
            delivering: "Teslimatta",
        }
        return map[status] || status
    }

    return (
        <SafeAreaView style={s.container} edges={["top"]}>
            {/* Header */}
            <View style={s.header}>
                <View>
                    <Text style={s.greeting}>Merhaba, {courier?.name || "Kurye"} 👋</Text>
                    <Text style={s.greetingSub}>{courier?.is_available ? "🟢 Müsait" : "🔴 Meşgul"}</Text>
                </View>
                <View style={s.avatarCircle}>
                    <Ionicons name="bicycle" size={22} color={colors.interactive} />
                </View>
            </View>

            <ScrollView
                contentContainerStyle={s.scroll}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} colors={[colors.interactive]} />
                }
            >
                {/* Stats Grid */}
                <View style={s.statsGrid}>
                    {stats.map((stat, i) => (
                        <View key={i} style={s.statCard}>
                            <View style={[s.statIcon, { backgroundColor: stat.bgColor }]}>
                                <Ionicons name={stat.icon} size={20} color={stat.color} />
                            </View>
                            <Text style={s.statValue}>{stat.value}</Text>
                            <Text style={s.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Bekleyen Teslimatlar */}
                <View style={s.section}>
                    <View style={s.sectionHeader}>
                        <Text style={s.sectionTitle}>🔔 Bekleyen Teslimatlar</Text>
                        <Text style={s.badge}>{confirmedOrders.length}</Text>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="small" color={colors.interactive} style={{ marginTop: spacing.lg }} />
                    ) : confirmedOrders.length === 0 ? (
                        <View style={s.emptyCard}>
                            <Ionicons name="checkmark-done-outline" size={32} color={colors.fg.muted} />
                            <Text style={s.emptyText}>Bekleyen teslimat yok</Text>
                        </View>
                    ) : (
                        confirmedOrders.slice(0, 5).map((order) => (
                            <TouchableOpacity
                                key={order.id}
                                style={s.orderCard}
                                activeOpacity={0.7}
                                onPress={() => navigation?.navigate("Teslimat", {
                                    screen: "OrderDetail",
                                    params: { orderId: order.id },
                                })}
                            >
                                <View style={s.orderCardLeft}>
                                    <View style={[s.orderDot, { backgroundColor: colors.tag.orange.fg }]} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={s.orderTitle}>Sipariş #{order.id?.slice(-6)}</Text>
                                        <Text style={s.orderAddr} numberOfLines={1}>
                                            📍 {typeof order.delivery_address === "object"
                                                ? (order.delivery_address?.address || "Adres yok")
                                                : (order.delivery_address || "Adres yok")}
                                        </Text>
                                    </View>
                                </View>
                                <View style={s.orderCardRight}>
                                    <Text style={s.orderPrice}>
                                        ₺{((order.items || []).reduce((s: number, i: any) => s + (Number(i.total_price) || 0), 0) + (Number(order.delivery_fee) || 0)).toFixed(0)}
                                    </Text>
                                    <Ionicons name="chevron-forward" size={16} color={colors.fg.muted} />
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                {/* Aktif Teslimatlarım */}
                {myActiveOrders.length > 0 && (
                    <View style={s.section}>
                        <View style={s.sectionHeader}>
                            <Text style={s.sectionTitle}>🚀 Aktif Teslimatlarım</Text>
                            <Text style={[s.badge, { backgroundColor: "#EFF6FF", color: colors.interactive }]}>
                                {myActiveOrders.length}
                            </Text>
                        </View>

                        {myActiveOrders.map((order) => {
                            const statusColor = getStatusColor(order.varto_status)
                            return (
                                <TouchableOpacity
                                    key={order.id}
                                    style={s.orderCard}
                                    activeOpacity={0.7}
                                    onPress={() => navigation?.navigate("Teslimat", {
                                        screen: "OrderDetail",
                                        params: { orderId: order.id },
                                    })}
                                >
                                    <View style={s.orderCardLeft}>
                                        <View style={[s.orderDot, { backgroundColor: statusColor.fg }]} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={s.orderTitle}>Sipariş #{order.id?.slice(-6)}</Text>
                                            <View style={[s.statusBadge, { backgroundColor: statusColor.bg }]}>
                                                <Text style={[s.statusBadgeText, { color: statusColor.fg }]}>
                                                    {getStatusLabel(order.varto_status)}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                    <Ionicons name="chevron-forward" size={16} color={colors.fg.muted} />
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg.subtle },
    header: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: spacing.lg, paddingVertical: spacing.lg,
        backgroundColor: colors.bg.base,
        borderBottomWidth: 1, borderBottomColor: colors.border.base,
    },
    greeting: { ...typography.h1, fontSize: 20 },
    greetingSub: { ...typography.small, marginTop: 2 },
    avatarCircle: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: "#EFF6FF",
        justifyContent: "center", alignItems: "center",
    },
    scroll: { padding: spacing.lg, paddingBottom: 100 },
    statsGrid: {
        flexDirection: "row", flexWrap: "wrap",
        gap: spacing.md, marginBottom: spacing.xl,
    },
    statCard: {
        flex: 1, minWidth: "45%",
        backgroundColor: colors.bg.base,
        borderRadius: radius.lg, padding: spacing.lg,
        borderWidth: 1, borderColor: colors.border.base,
        alignItems: "center",
    },
    statIcon: {
        width: 40, height: 40, borderRadius: 20,
        justifyContent: "center", alignItems: "center",
        marginBottom: spacing.sm,
    },
    statValue: { ...typography.h1, fontSize: 20, marginBottom: 2 },
    statLabel: { ...typography.caption },
    section: { marginBottom: spacing.xl },
    sectionHeader: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        marginBottom: spacing.md,
    },
    sectionTitle: { ...typography.h2 },
    badge: {
        backgroundColor: colors.tag.orange.bg, color: colors.tag.orange.fg,
        fontSize: 12, fontWeight: "700",
        paddingHorizontal: spacing.sm, paddingVertical: 2,
        borderRadius: 10, overflow: "hidden",
    },
    orderCard: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        backgroundColor: colors.bg.base, borderRadius: radius.lg,
        padding: spacing.lg, marginBottom: spacing.sm,
        borderWidth: 1, borderColor: colors.border.base,
    },
    orderCardLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: spacing.md },
    orderDot: { width: 8, height: 8, borderRadius: 4 },
    orderTitle: { ...typography.h3, marginBottom: 2 },
    orderAddr: { ...typography.small, flex: 1 },
    orderCardRight: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
    orderPrice: { ...typography.h3, color: colors.interactive },
    statusBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: spacing.sm, paddingVertical: 2,
        borderRadius: radius.sm, marginTop: 2,
    },
    statusBadgeText: { fontSize: 11, fontWeight: "600" },
    emptyCard: {
        backgroundColor: colors.bg.base, borderRadius: radius.lg,
        padding: spacing.xxl, alignItems: "center", gap: spacing.sm,
        borderWidth: 1, borderColor: colors.border.base,
    },
    emptyText: { ...typography.body, color: colors.fg.muted },
})
