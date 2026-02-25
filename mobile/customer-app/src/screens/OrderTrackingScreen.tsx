import React, { useState, useEffect, useCallback } from "react"
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    ScrollView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { statusConfig, getStatusColor, spacing, radius } from "../theme/tokens"
import { useTheme } from "../context/ThemeContext"
import { getCustomerOrders, getOrder } from "../api/client"

const STATUS_STEPS = ["pending", "confirmed", "preparing", "ready", "assigned", "accepted", "delivering", "delivered"]

const statusLabels: Record<string, string> = {
    pending: "Beklemede",
    confirmed: "Onaylandı",
    preparing: "Hazırlanıyor",
    ready: "Hazır",
    assigned: "Kurye Atandı",
    accepted: "Kurye Kabul Etti",
    delivering: "Yolda",
    delivered: "Teslim Edildi",
    cancelled: "İptal",
}

export default function OrderTrackingScreen({ route, customer }: any) {
    const { colors: c, typography: t, colorScheme } = useTheme()

    const orderId = route?.params?.orderId
    const [orders, setOrders] = useState<any[]>([])
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    // Müşterinin aktif siparişlerini yükle
    const fetchOrders = useCallback(async () => {
        if (!customer?.id) {
            setLoading(false)
            return
        }
        try {
            const data = await getCustomerOrders(customer.id)
            // Aktif siparişleri önce göster (teslim edilmemiş olanlar)
            const sorted = (data || []).sort((a: any, b: any) => {
                const activeStatuses = ["pending", "confirmed", "preparing", "ready", "assigned", "accepted", "delivering"]
                const aActive = activeStatuses.includes(a.varto_status)
                const bActive = activeStatuses.includes(b.varto_status)
                if (aActive && !bActive) return -1
                if (!aActive && bActive) return 1
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            })
            setOrders(sorted)
        } catch (e) {
            console.error("Order tracking error:", e)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [customer?.id])

    useEffect(() => { fetchOrders() }, [fetchOrders])

    // Eğer orderId ile gelindiyse direkt o siparişi aç
    useEffect(() => {
        if (orderId) {
            getOrder(orderId).then(setSelectedOrder).catch(console.error)
        }
    }, [orderId])

    // Aktif siparişleri 15sn'de bir otomatik güncelle
    useEffect(() => {
        const hasActive = orders.some(o =>
            !["delivered", "cancelled"].includes(o.varto_status)
        )
        if (!hasActive) return
        const interval = setInterval(() => fetchOrders(), 15000)
        return () => clearInterval(interval)
    }, [orders, fetchOrders])

    // Seçili sipariş detayından geri gel
    if (selectedOrder) {
        const currentStepIdx = STATUS_STEPS.indexOf(selectedOrder.varto_status)
        const isCancelled = selectedOrder.varto_status === "cancelled"

        return (
            <ScrollView style={[styles.container, { backgroundColor: c.bg.base }]} contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxxl }}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => setSelectedOrder(null)}
                >
                    <Ionicons name="arrow-back" size={20} color={c.fg.base} />
                    <Text style={[t.body, { marginLeft: spacing.sm }]}>Geri</Text>
                </TouchableOpacity>

                {/* Status Badge */}
                <View style={[styles.statusBadgeLg, { backgroundColor: getStatusColor(colorScheme, selectedOrder.varto_status).bg }]}>
                    <Ionicons
                        name={(statusConfig[selectedOrder.varto_status as keyof typeof statusConfig]?.icon || "help-outline") as any}
                        size={20}
                        color={getStatusColor(colorScheme, selectedOrder.varto_status).fg}
                    />
                    <Text style={[styles.statusTextLg, { color: getStatusColor(colorScheme, selectedOrder.varto_status).fg }]}>
                        {statusLabels[selectedOrder.varto_status] || selectedOrder.varto_status}
                    </Text>
                </View>

                {/* Timeline */}
                {!isCancelled && (
                    <View style={styles.timeline}>
                        {STATUS_STEPS.map((step, idx) => {
                            const config = statusConfig[step as keyof typeof statusConfig]
                            const isDone = idx <= currentStepIdx
                            const isCurrent = idx === currentStepIdx
                            return (
                                <View key={step} style={styles.timelineStep}>
                                    <View style={styles.timelineLeft}>
                                        <View style={[
                                            styles.dot,
                                            { backgroundColor: isDone ? c.interactive : c.bg.field, borderColor: isDone ? c.interactive : c.border.strong },
                                            isCurrent && styles.dotCurrent,
                                        ]}>
                                            {isDone && <Ionicons name="checkmark" size={12} color={c.fg.on_color} />}
                                        </View>
                                        {idx < STATUS_STEPS.length - 1 && (
                                            <View style={[styles.line, { backgroundColor: isDone ? c.interactive : c.border.base }]} />
                                        )}
                                    </View>
                                    <View style={[styles.timelineContent, { opacity: isDone ? 1 : 0.4 }]}>
                                        <Text style={[t.h3]}>{config?.label || statusLabels[step]}</Text>
                                    </View>
                                </View>
                            )
                        })}
                    </View>
                )}

                {isCancelled && (
                    <View style={[styles.cancelledBox, { backgroundColor: c.tag.red.bg, borderColor: c.tag.red.fg + "30" }]}>
                        <Ionicons name="close-circle" size={24} color={c.tag.red.fg} />
                        <Text style={[t.h3, { color: c.tag.red.fg, marginLeft: spacing.sm }]}>Sipariş iptal edildi</Text>
                    </View>
                )}

                {/* Order Items */}
                {selectedOrder.items && selectedOrder.items.length > 0 && (
                    <View style={[styles.section, { borderTopColor: c.border.base }]}>
                        <Text style={[t.h2, { marginBottom: spacing.md }]}>Sipariş İçeriği</Text>
                        {selectedOrder.items.map((item: any, idx: number) => (
                            <View key={idx} style={[styles.itemRow, { borderBottomColor: c.border.base }]}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[t.h3]}>{item.product_name}</Text>
                                    <Text style={[t.small]}>x{item.quantity}</Text>
                                </View>
                                <Text style={[t.price]}>₺{Number(item.total_price).toLocaleString("tr-TR")}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* ID */}
                <View style={[styles.idBox, { backgroundColor: c.bg.field }]}>
                    <Text style={[t.small]}>Sipariş ID</Text>
                    <Text style={{ fontSize: 11, fontFamily: "monospace", color: c.fg.muted, marginTop: 2 }}>{selectedOrder.id}</Text>
                </View>
            </ScrollView>
        )
    }

    // ── Sipariş Listesi ──
    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: c.bg.base }]}>
                <ActivityIndicator size="large" color={c.interactive} />
            </View>
        )
    }

    const activeOrders = orders.filter(o => !["delivered", "cancelled"].includes(o.varto_status))
    const pastOrders = orders.filter(o => ["delivered", "cancelled"].includes(o.varto_status))

    const renderOrderCard = (order: any) => {
        const sc = getStatusColor(colorScheme, order.varto_status)
        const itemsTotal = (order.items || []).reduce((sum: number, i: any) => sum + (Number(i.total_price) || 0), 0)

        return (
            <TouchableOpacity
                key={order.id}
                style={[styles.card, { backgroundColor: c.bg.component, borderColor: c.border.base }]}
                onPress={() => setSelectedOrder(order)}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={[t.label, { fontSize: 12 }]}>#{order.id?.slice(-8).toUpperCase()}</Text>
                        <Text style={[t.small, { marginTop: 2 }]}>
                            {order.created_at ? new Date(order.created_at).toLocaleDateString("tr-TR", {
                                day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                            }) : ""}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                        <Text style={[styles.statusText, { color: sc.fg }]}>
                            {statusLabels[order.varto_status] || order.varto_status}
                        </Text>
                    </View>
                </View>

                {order.items?.length > 0 && (
                    <View style={{ marginTop: spacing.sm }}>
                        {order.items.slice(0, 2).map((item: any, idx: number) => (
                            <Text key={idx} style={[t.small, { marginTop: 2 }]}>
                                • {item.quantity}x {item.product_name}
                            </Text>
                        ))}
                        {order.items.length > 2 && (
                            <Text style={[t.small, { color: c.fg.muted, marginTop: 2 }]}>
                                +{order.items.length - 2} ürün daha
                            </Text>
                        )}
                    </View>
                )}

                <View style={[styles.cardFooter, { borderTopColor: c.border.base }]}>
                    <Text style={[t.body, { fontWeight: "600" }]}>₺{itemsTotal.toFixed(2)}</Text>
                    <Ionicons name="chevron-forward" size={16} color={c.fg.muted} />
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: c.bg.base }]}
            contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxxl }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders() }} tintColor={c.interactive} />}
        >
            {orders.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={[styles.emptyIcon, { backgroundColor: c.bg.subtle }]}>
                        <Ionicons name="receipt-outline" size={40} color={c.fg.muted} />
                    </View>
                    <Text style={[t.h3, { marginTop: spacing.xl }]}>Henüz siparişiniz yok</Text>
                    <Text style={[t.body, { marginTop: spacing.sm, textAlign: "center", color: c.fg.muted }]}>
                        İşletmelerden sipariş verdikçe burada görünecek
                    </Text>
                </View>
            ) : (
                <>
                    {/* Aktif Siparişler */}
                    {activeOrders.length > 0 && (
                        <View style={{ marginBottom: spacing.xl }}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="pulse-outline" size={18} color={c.interactive} />
                                <Text style={[t.h2, { marginLeft: spacing.sm }]}>Aktif Siparişler</Text>
                                <View style={[styles.countBadge, { backgroundColor: c.interactive }]}>
                                    <Text style={{ color: c.fg.on_color, fontSize: 11, fontWeight: "700" }}>{activeOrders.length}</Text>
                                </View>
                            </View>
                            {activeOrders.map(renderOrderCard)}
                        </View>
                    )}

                    {/* Geçmiş Siparişler */}
                    {pastOrders.length > 0 && (
                        <View>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="time-outline" size={18} color={c.fg.muted} />
                                <Text style={[t.h2, { marginLeft: spacing.sm }]}>Geçmiş</Text>
                            </View>
                            {pastOrders.slice(0, 10).map(renderOrderCard)}
                        </View>
                    )}
                </>
            )}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    backBtn: { flexDirection: "row", alignItems: "center", marginBottom: spacing.lg },
    statusBadgeLg: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, borderRadius: radius.lg, marginTop: spacing.md, alignSelf: "center" },
    statusTextLg: { fontSize: 15, fontWeight: "600" },
    timeline: { marginTop: spacing.xxl },
    timelineStep: { flexDirection: "row", minHeight: 48 },
    timelineLeft: { alignItems: "center", width: 28 },
    dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, justifyContent: "center", alignItems: "center" },
    dotCurrent: { width: 26, height: 26, borderRadius: 13 },
    line: { width: 2, flex: 1, marginVertical: 2 },
    timelineContent: { flex: 1, paddingLeft: spacing.md, paddingBottom: spacing.lg },
    cancelledBox: { flexDirection: "row", alignItems: "center", padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, marginTop: spacing.xl },
    section: { marginTop: spacing.xl, paddingTop: spacing.lg, borderTopWidth: 1 },
    itemRow: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md, borderBottomWidth: 1 },
    idBox: { padding: spacing.lg, borderRadius: radius.md, marginTop: spacing.xl },
    // List styles
    sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: spacing.md },
    countBadge: { marginLeft: spacing.sm, width: 22, height: 22, borderRadius: 11, justifyContent: "center", alignItems: "center" },
    card: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, marginBottom: spacing.md },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.sm },
    statusText: { fontSize: 11, fontWeight: "600" },
    cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1 },
    emptyContainer: { alignItems: "center", paddingTop: 80 },
    emptyIcon: { width: 72, height: 72, borderRadius: 36, justifyContent: "center", alignItems: "center" },
})
