import React, { useState, useEffect, useCallback } from "react"
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    useColorScheme,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { getColors, getTypography, statusConfig, getStatusColor, spacing, radius } from "../theme/tokens"
import { getOrder } from "../api/client"

const STATUS_STEPS = ["pending", "confirmed", "preparing", "ready", "assigned", "accepted", "delivering", "delivered"]

export default function OrderTrackingScreen({ route }: any) {
    const c = getColors()
    const t = getTypography()

    const [orderId, setOrderId] = useState(route.params?.orderId || "")
    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const fetchOrder = useCallback(async (id: string) => {
        if (!id.trim()) return
        setLoading(true)
        setError("")
        try {
            const data = await getOrder(id)
            setOrder(data)
        } catch {
            setError("Sipariş bulunamadı")
            setOrder(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (orderId) fetchOrder(orderId)
    }, [orderId, fetchOrder])

    // Auto-refresh every 10s while order is in progress
    useEffect(() => {
        if (!order || order.varto_status === "delivered" || order.varto_status === "cancelled") return
        const interval = setInterval(() => fetchOrder(orderId), 10000)
        return () => clearInterval(interval)
    }, [order, orderId, fetchOrder])

    const currentStepIdx = order ? STATUS_STEPS.indexOf(order.varto_status) : -1
    const isCancelled = order?.varto_status === "cancelled"

    return (
        <ScrollView style={[styles.container, { backgroundColor: c.bg.base }]} contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxxl }}>
            {/* Search */}
            <Text style={[t.h1, { marginBottom: spacing.lg }]}>Sipariş Takip</Text>
            <View style={[styles.searchRow, { backgroundColor: c.bg.field, borderColor: c.border.base }]}>
                <Ionicons name="search-outline" size={18} color={c.fg.muted} />
                <TextInput
                    style={[styles.searchInput, { color: c.fg.base }]}
                    value={orderId}
                    onChangeText={setOrderId}
                    placeholder="Sipariş ID girin..."
                    placeholderTextColor={c.fg.muted}
                    autoCapitalize="none"
                    returnKeyType="search"
                    onSubmitEditing={() => fetchOrder(orderId)}
                />
                <TouchableOpacity onPress={() => fetchOrder(orderId)}>
                    <Ionicons name="arrow-forward-circle" size={24} color={c.interactive} />
                </TouchableOpacity>
            </View>

            {loading && <ActivityIndicator style={{ marginTop: spacing.xxxl }} color={c.fg.muted} />}
            {error ? <Text style={[t.body, { color: c.tag.red.fg, marginTop: spacing.xl, textAlign: "center" }]}>{error}</Text> : null}

            {order && !loading && (
                <>
                    {/* Status Badge */}
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.varto_status).bg }]}>
                        <Ionicons
                            name={(statusConfig[order.varto_status as keyof typeof statusConfig]?.icon || "help-outline") as any}
                            size={20}
                            color={getStatusColor(order.varto_status).fg}
                        />
                        <Text style={[styles.statusText, { color: getStatusColor(order.varto_status).fg }]}>
                            {statusConfig[order.varto_status as keyof typeof statusConfig]?.label || order.varto_status}
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
                                            <Text style={[t.h3]}>{config?.label}</Text>
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
                    {order.items && order.items.length > 0 && (
                        <View style={[styles.section, { borderTopColor: c.border.base }]}>
                            <Text style={[t.h2, { marginBottom: spacing.md }]}>Sipariş İçeriği</Text>
                            {order.items.map((item: any, idx: number) => (
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

                    {/* Delivery Info */}
                    <View style={[styles.section, { borderTopColor: c.border.base }]}>
                        <Text style={[t.h2, { marginBottom: spacing.md }]}>Teslimat</Text>
                        {order.delivery_address?.address && (
                            <View style={styles.infoRow}>
                                <Ionicons name="location-outline" size={16} color={c.fg.muted} />
                                <Text style={[t.body, { marginLeft: spacing.sm, flex: 1 }]}>{order.delivery_address.address}</Text>
                            </View>
                        )}
                        {order.delivery_notes && (
                            <View style={styles.infoRow}>
                                <Ionicons name="chatbox-outline" size={16} color={c.fg.muted} />
                                <Text style={[t.body, { marginLeft: spacing.sm, flex: 1 }]}>{order.delivery_notes}</Text>
                            </View>
                        )}
                        <View style={styles.infoRow}>
                            <Ionicons name="cash-outline" size={16} color={c.fg.muted} />
                            <Text style={[t.body, { marginLeft: spacing.sm }]}>Teslimat: ₺{Number(order.delivery_fee).toLocaleString("tr-TR")}</Text>
                        </View>
                    </View>

                    {/* ID */}
                    <View style={[styles.idBox, { backgroundColor: c.bg.field }]}>
                        <Text style={[t.small]}>Sipariş ID</Text>
                        <Text style={{ fontSize: 11, fontFamily: "monospace", color: c.fg.muted, marginTop: 2 }}>{order.id}</Text>
                    </View>
                </>
            )}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    searchRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, borderRadius: radius.md, borderWidth: 1, height: 48, gap: spacing.sm },
    searchInput: { flex: 1, fontSize: 14 },
    statusBadge: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, borderRadius: radius.lg, marginTop: spacing.xl, alignSelf: "center" },
    statusText: { fontSize: 15, fontWeight: "600" },
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
    infoRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: spacing.md },
    idBox: { padding: spacing.lg, borderRadius: radius.md, marginTop: spacing.xl },
})
