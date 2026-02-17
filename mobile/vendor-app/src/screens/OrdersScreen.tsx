import React, { useEffect, useState, useCallback } from "react"
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    RefreshControl, ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { colors, spacing, radius, typography } from "../theme/tokens"
import { getVendorOrders } from "../api/client"

const STATUS_FILTERS = [
    { key: "all", label: "Tümü" },
    { key: "pending", label: "Bekleyen" },
    { key: "confirmed", label: "Onaylı" },
    { key: "preparing", label: "Hazırlanan" },
    { key: "ready", label: "Hazır" },
    { key: "delivered", label: "Teslim" },
]

interface Props {
    navigation: any
}

export default function OrdersScreen({ navigation }: Props) {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [activeFilter, setActiveFilter] = useState("all")

    const loadOrders = useCallback(async () => {
        try {
            const data = await getVendorOrders()
            setOrders(data || [])
        } catch (err) {
            console.log("Sipariş yükleme hatası:", err)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [])

    useEffect(() => { loadOrders() }, [loadOrders])

    const onRefresh = () => { setRefreshing(true); loadOrders() }

    const filtered = activeFilter === "all"
        ? orders
        : orders.filter(o => o.varto_status === activeFilter)

    const renderOrder = ({ item }: { item: any }) => {
        const statusColor = getStatusColor(item.varto_status)
        // Toplam fiyatı items'dan hesapla
        const orderTotal = (item.items || []).reduce((sum: number, i: any) =>
            sum + (Number(i.total_price) || 0), 0) + (Number(item.delivery_fee) || 0)
        return (
            <TouchableOpacity
                style={s.orderCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate("OrderDetail", { order: item, onStatusUpdate: loadOrders })}
            >
                <View style={s.orderHeader}>
                    <View style={s.orderIdRow}>
                        <Ionicons name="receipt-outline" size={16} color={colors.fg.muted} />
                        <Text style={s.orderId}>#{item.id?.slice(-6)}</Text>
                    </View>
                    <View style={[s.badge, { backgroundColor: statusColor.bg }]}>
                        <Text style={[s.badgeText, { color: statusColor.fg }]}>
                            {getStatusLabel(item.varto_status)}
                        </Text>
                    </View>
                </View>

                <View style={s.orderBody}>
                    <View style={s.infoRow}>
                        <Ionicons name="person-outline" size={14} color={colors.fg.muted} />
                        <Text style={s.infoText}>{item.customer_name || "Müşteri"}</Text>
                    </View>
                    <View style={s.infoRow}>
                        <Ionicons name="cube-outline" size={14} color={colors.fg.muted} />
                        <Text style={s.infoText}>{item.items?.length || 0} ürün</Text>
                    </View>
                </View>

                <View style={s.orderFooter}>
                    <Text style={s.orderTime}>
                        {item.created_at ? new Date(item.created_at).toLocaleString("tr-TR", {
                            hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short",
                        }) : ""}
                    </Text>
                    <Text style={s.orderTotal}>₺{orderTotal.toFixed(2)}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <SafeAreaView style={s.container} edges={["top"]}>
            {/* Header */}
            <View style={s.header}>
                <Text style={s.title}>Siparişler</Text>
                <Text style={s.count}>{filtered.length} sipariş</Text>
            </View>

            {/* Status Filter Tabs */}
            <FlatList
                data={STATUS_FILTERS}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.filterRow}
                keyExtractor={item => item.key}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[s.filterBtn, activeFilter === item.key && s.filterBtnActive]}
                        onPress={() => setActiveFilter(item.key)}
                    >
                        <Text style={[s.filterText, activeFilter === item.key && s.filterTextActive]}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                )}
            />

            {/* Order List */}
            {loading ? (
                <ActivityIndicator size="large" color={colors.interactive} style={{ flex: 1 }} />
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item.id}
                    renderItem={renderOrder}
                    contentContainerStyle={s.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.interactive} />}
                    ListEmptyComponent={
                        <View style={s.empty}>
                            <Ionicons name="file-tray-outline" size={48} color={colors.fg.disabled} />
                            <Text style={s.emptyText}>Bu filtrede sipariş yok</Text>
                        </View>
                    }
                />
            )}
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
    const labels: Record<string, string> = {
        pending: "Bekliyor", confirmed: "Onaylandı", preparing: "Hazırlanıyor",
        ready: "Hazır", delivered: "Teslim", completed: "Tamamlandı", cancelled: "İptal",
    }
    return labels[status] || status
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg.subtle },
    header: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "baseline",
        paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm,
        backgroundColor: colors.bg.base,
    },
    title: { ...typography.h1 },
    count: { ...typography.small },
    filterRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm, backgroundColor: colors.bg.base },
    filterBtn: {
        paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
        borderRadius: 20, backgroundColor: colors.bg.field,
    },
    filterBtnActive: { backgroundColor: colors.interactive },
    filterText: { ...typography.label, color: colors.fg.subtle },
    filterTextActive: { color: colors.fg.on_color, fontWeight: "600" },
    list: { padding: spacing.lg, paddingBottom: 100 },
    orderCard: {
        backgroundColor: colors.bg.base,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1, borderColor: colors.border.base,
    },
    orderHeader: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        marginBottom: spacing.md,
    },
    orderIdRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
    orderId: { ...typography.h3, fontFamily: "monospace" },
    badge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.sm },
    badgeText: { fontSize: 11, fontWeight: "600" },
    orderBody: { gap: spacing.xs, marginBottom: spacing.md },
    infoRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
    infoText: { ...typography.small },
    orderFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: colors.border.base, paddingTop: spacing.md },
    orderTime: { ...typography.caption },
    orderTotal: { ...typography.h2, color: colors.interactive },
    empty: { alignItems: "center", paddingTop: 60, gap: spacing.md },
    emptyText: { ...typography.body, color: colors.fg.muted },
})
