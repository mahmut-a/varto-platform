import React, { useState, useEffect, useCallback } from "react"
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { getColors, getTypography, spacing, radius, statusColors, statusLabels } from "../theme/tokens"
import { getCustomerOrders } from "../api/client"
import { useTheme } from "../context/ThemeContext"

export default function OrderHistoryScreen({ navigation, customer }: {
    navigation: any
    customer: any
}) {
    const { colorScheme } = useTheme()
    const c = getColors()
    const t = getTypography()

    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchOrders = useCallback(async () => {
        if (!customer?.id) return
        try {
            const data = await getCustomerOrders(customer.id)
            setOrders(data || [])
        } catch (e) {
            console.error("Order history error:", e)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [customer?.id])

    useEffect(() => { fetchOrders() }, [fetchOrders])

    const onRefresh = () => { setRefreshing(true); fetchOrders() }

    const formatDate = (dateStr: string) => {
        if (!dateStr) return ""
        const d = new Date(dateStr)
        return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    }

    const totalAmount = (items: any[]) => {
        if (!items?.length) return "0,00"
        return items.reduce((sum: number, item: any) => sum + (Number(item.total_price) || 0), 0).toFixed(2).replace(".", ",")
    }

    const handleViewOrder = (order: any) => {
        navigation.navigate("OrderTrackingDetail", { orderId: order.id })
    }

    const renderOrder = ({ item }: { item: any }) => {
        const status = item.varto_status || "pending"
        const sc = statusColors[status as keyof typeof statusColors] || statusColors.pending

        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: c.bg.component, borderColor: c.border.base }]}
                onPress={() => handleViewOrder(item)}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={[t.label, { fontSize: 12 }]}>#{item.id?.slice(-8).toUpperCase()}</Text>
                        <Text style={[t.small, { marginTop: 2 }]}>{formatDate(item.created_at)}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                        <Text style={[styles.statusText, { color: sc.text }]}>
                            {statusLabels[status as keyof typeof statusLabels] || status}
                        </Text>
                    </View>
                </View>

                {/* Items preview */}
                {item.items?.length > 0 && (
                    <View style={styles.itemsList}>
                        {item.items.slice(0, 3).map((orderItem: any, idx: number) => (
                            <Text key={idx} style={[t.small, { marginTop: 2 }]}>
                                • {orderItem.quantity}x {orderItem.product_name}
                            </Text>
                        ))}
                        {item.items.length > 3 && (
                            <Text style={[t.small, { color: c.fg.muted, marginTop: 2 }]}>
                                +{item.items.length - 3} ürün daha
                            </Text>
                        )}
                    </View>
                )}

                <View style={[styles.cardFooter, { borderTopColor: c.border.base }]}>
                    <Text style={[t.body, { fontWeight: "600" }]}>₺{totalAmount(item.items)}</Text>
                    <Ionicons name="chevron-forward" size={16} color={c.fg.muted} />
                </View>
            </TouchableOpacity>
        )
    }

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: c.bg.base }]}>
                <ActivityIndicator size="large" color={c.interactive} />
            </View>
        )
    }

    return (
        <View style={[styles.container, { backgroundColor: c.bg.base }]}>
            {orders.length === 0 ? (
                <View style={styles.center}>
                    <View style={[styles.emptyIcon, { backgroundColor: c.bg.subtle }]}>
                        <Ionicons name="receipt-outline" size={40} color={c.fg.muted} />
                    </View>
                    <Text style={[t.h3, { marginTop: spacing.xl }]}>Henüz siparişiniz yok</Text>
                    <Text style={[t.body, { marginTop: spacing.sm, textAlign: "center" }]}>
                        İşletmelerden sipariş verdikçe burada görünecek
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id}
                    renderItem={renderOrder}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.interactive} />}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.xxxl },
    list: { padding: spacing.xl, gap: spacing.md },
    card: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.sm },
    statusText: { fontSize: 11, fontWeight: "600" },
    itemsList: { marginTop: spacing.md },
    cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1 },
    emptyIcon: { width: 72, height: 72, borderRadius: 36, justifyContent: "center", alignItems: "center" },
})
