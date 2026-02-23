import React, { useState, useCallback } from "react"
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, RefreshControl,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { colors, spacing, radius, typography } from "../theme/tokens"
import { getAllOrders, getCurrentCourierId } from "../api/client"
import { useFocusEffect } from "@react-navigation/native"

type TabKey = "available" | "active" | "history"

export default function OrdersScreen({ navigation }: { navigation: any }) {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [activeTab, setActiveTab] = useState<TabKey>("available")

    const fetchOrders = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true)
            else setLoading(true)
            const data = await getAllOrders()
            setOrders(data || [])
        } catch (err) {
            console.error("Siparişler yüklenemedi:", err)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useFocusEffect(
        useCallback(() => {
            fetchOrders()
        }, [])
    )

    const courierId = getCurrentCourierId()

    const tabs: { key: TabKey; label: string; icon: string }[] = [
        { key: "available", label: "Bekleyen", icon: "alert-circle-outline" },
        { key: "active", label: "Aktif", icon: "bicycle-outline" },
        { key: "history", label: "Geçmiş", icon: "time-outline" },
    ]

    const getFilteredOrders = () => {
        switch (activeTab) {
            case "available":
                return orders.filter(o => o.varto_status === "confirmed" && !o.courier_id)
            case "active":
                return orders.filter(
                    o => o.courier_id === courierId &&
                        ["assigned", "accepted", "delivering"].includes(o.varto_status)
                )
            case "history":
                return orders.filter(
                    o => o.courier_id === courierId &&
                        ["delivered", "cancelled"].includes(o.varto_status)
                ).sort((a, b) =>
                    new Date(b.updated_at || b.created_at).getTime() -
                    new Date(a.updated_at || a.created_at).getTime()
                )
            default:
                return []
        }
    }

    const filteredOrders = getFilteredOrders()

    const getStatusColor = (status: string) => {
        const map: Record<string, { bg: string; fg: string }> = {
            confirmed: colors.tag.orange,
            assigned: colors.tag.blue,
            accepted: colors.tag.blue,
            delivering: colors.tag.purple,
            delivered: colors.tag.green,
            cancelled: colors.tag.red,
        }
        return map[status] || colors.tag.neutral
    }

    const getStatusLabel = (status: string) => {
        const map: Record<string, string> = {
            confirmed: "Onaylandı",
            assigned: "Atandı",
            accepted: "Kabul Edildi",
            delivering: "Teslimatta",
            delivered: "Teslim Edildi",
            cancelled: "İptal",
        }
        return map[status] || status
    }

    const renderOrder = ({ item }: { item: any }) => {
        const statusColor = getStatusColor(item.varto_status)
        const addr = typeof item.delivery_address === "object"
            ? (item.delivery_address?.address || "Adres yok")
            : (item.delivery_address || "Adres yok")

        const itemsTotal = (item.items || []).reduce(
            (sum: number, i: any) => sum + (Number(i.total_price) || 0), 0
        )
        const total = itemsTotal + (Number(item.delivery_fee) || 0)
        const itemCount = (item.items || []).length

        return (
            <TouchableOpacity
                style={s.orderCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })}
            >
                <View style={s.orderTop}>
                    <View style={s.orderIdRow}>
                        <Ionicons name="receipt-outline" size={16} color={colors.fg.muted} />
                        <Text style={s.orderId}>#{item.id?.slice(-6)}</Text>
                    </View>
                    <View style={[s.statusBadge, { backgroundColor: statusColor.bg }]}>
                        <Text style={[s.statusText, { color: statusColor.fg }]}>
                            {getStatusLabel(item.varto_status)}
                        </Text>
                    </View>
                </View>

                <View style={s.orderBody}>
                    <View style={s.infoRow}>
                        <Ionicons name="location-outline" size={14} color={colors.fg.muted} />
                        <Text style={s.infoText} numberOfLines={1}>{addr}</Text>
                    </View>
                    <View style={s.infoRow}>
                        <Ionicons name="cube-outline" size={14} color={colors.fg.muted} />
                        <Text style={s.infoText}>{itemCount} ürün</Text>
                    </View>
                    <View style={s.infoRow}>
                        <Ionicons name="time-outline" size={14} color={colors.fg.muted} />
                        <Text style={s.infoText}>
                            {item.created_at ? new Date(item.created_at).toLocaleString("tr-TR", {
                                hour: "2-digit", minute: "2-digit",
                                day: "2-digit", month: "2-digit",
                            }) : "—"}
                        </Text>
                    </View>
                </View>

                <View style={s.orderBottom}>
                    <Text style={s.orderTotal}>₺{total.toFixed(2)}</Text>
                    <View style={s.goBtn}>
                        <Text style={s.goBtnText}>Detay</Text>
                        <Ionicons name="arrow-forward" size={14} color={colors.interactive} />
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <SafeAreaView style={s.container} edges={["top"]}>
            {/* Header */}
            <View style={s.header}>
                <Text style={s.headerTitle}>Teslimatlar</Text>
            </View>

            {/* Tabs */}
            <View style={s.tabRow}>
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.key
                    const count = (() => {
                        switch (tab.key) {
                            case "available": return orders.filter(o => o.varto_status === "confirmed" && !o.courier_id).length
                            case "active": return orders.filter(o => o.courier_id === courierId && ["assigned", "accepted", "delivering"].includes(o.varto_status)).length
                            case "history": return orders.filter(o => o.courier_id === courierId && ["delivered", "cancelled"].includes(o.varto_status)).length
                            default: return 0
                        }
                    })()
                    return (
                        <TouchableOpacity
                            key={tab.key}
                            style={[s.tab, isActive && s.tabActive]}
                            onPress={() => setActiveTab(tab.key)}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={tab.icon as any}
                                size={16}
                                color={isActive ? colors.interactive : colors.fg.muted}
                            />
                            <Text style={[s.tabText, isActive && s.tabTextActive]}>
                                {tab.label}
                            </Text>
                            {count > 0 && (
                                <View style={[s.tabBadge, isActive && s.tabBadgeActive]}>
                                    <Text style={[s.tabBadgeText, isActive && s.tabBadgeTextActive]}>
                                        {count}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    )
                })}
            </View>

            {/* List */}
            {loading ? (
                <View style={s.center}>
                    <ActivityIndicator size="large" color={colors.interactive} />
                </View>
            ) : (
                <FlatList
                    data={filteredOrders}
                    keyExtractor={(item) => item.id}
                    renderItem={renderOrder}
                    contentContainerStyle={s.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => fetchOrders(true)} colors={[colors.interactive]} />
                    }
                    ListEmptyComponent={
                        <View style={s.emptyContainer}>
                            <Ionicons name="cube-outline" size={48} color={colors.fg.disabled} />
                            <Text style={s.emptyText}>
                                {activeTab === "available" ? "Bekleyen teslimat yok" :
                                    activeTab === "active" ? "Aktif teslimatınız yok" :
                                        "Henüz teslimat geçmişi yok"}
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    )
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg.subtle },
    header: {
        flexDirection: "row", alignItems: "center", justifyContent: "center",
        paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
        backgroundColor: colors.bg.base,
        borderBottomWidth: 1, borderBottomColor: colors.border.base,
    },
    headerTitle: { ...typography.h2 },
    tabRow: {
        flexDirection: "row", backgroundColor: colors.bg.base,
        paddingHorizontal: spacing.md, paddingBottom: spacing.sm,
        gap: spacing.xs,
    },
    tab: {
        flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
        gap: spacing.xs, paddingVertical: spacing.sm,
        borderRadius: radius.md, backgroundColor: colors.bg.field,
    },
    tabActive: { backgroundColor: "#EFF6FF" },
    tabText: { ...typography.small, fontWeight: "500" },
    tabTextActive: { color: colors.interactive, fontWeight: "600" },
    tabBadge: {
        backgroundColor: colors.border.base,
        paddingHorizontal: 6, paddingVertical: 1,
        borderRadius: 8,
    },
    tabBadgeActive: { backgroundColor: colors.interactive },
    tabBadgeText: { fontSize: 10, fontWeight: "700", color: colors.fg.muted },
    tabBadgeTextActive: { color: colors.fg.on_color },
    list: { padding: spacing.lg, paddingBottom: 100 },
    orderCard: {
        backgroundColor: colors.bg.base, borderRadius: radius.lg,
        padding: spacing.lg, marginBottom: spacing.md,
        borderWidth: 1, borderColor: colors.border.base,
    },
    orderTop: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        marginBottom: spacing.md,
    },
    orderIdRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
    orderId: { ...typography.h3 },
    statusBadge: {
        paddingHorizontal: spacing.sm, paddingVertical: 3,
        borderRadius: radius.sm,
    },
    statusText: { fontSize: 11, fontWeight: "600" },
    orderBody: { gap: spacing.xs, marginBottom: spacing.md },
    infoRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
    infoText: { ...typography.small, flex: 1 },
    orderBottom: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingTop: spacing.md,
        borderTopWidth: 1, borderTopColor: colors.border.base,
    },
    orderTotal: { ...typography.h2, color: colors.interactive },
    goBtn: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
    goBtnText: { ...typography.label, color: colors.interactive },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    emptyContainer: {
        alignItems: "center", justifyContent: "center",
        paddingVertical: spacing.xxxl * 2, gap: spacing.md,
    },
    emptyText: { ...typography.body, color: colors.fg.muted },
})
