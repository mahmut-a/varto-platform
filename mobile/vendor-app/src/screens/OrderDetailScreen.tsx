import React, { useState, useEffect, useCallback } from "react"
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Alert, ActivityIndicator, Linking,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { colors, spacing, radius, typography } from "../theme/tokens"
import { updateOrderStatus, getOrderById } from "../api/client"

const STATUS_FLOW = ["pending", "confirmed", "preparing", "ready", "delivered"]

interface Props {
    route: any
    navigation: any
}

export default function OrderDetailScreen({ route, navigation }: Props) {
    const { order: initialOrder, orderId: paramOrderId } = route.params || {}

    const [order, setOrder] = useState<any>(initialOrder || null)
    const [loading, setLoading] = useState(!initialOrder)
    const [currentStatus, setCurrentStatus] = useState(initialOrder?.varto_status || "pending")
    const [updating, setUpdating] = useState(false)

    // Order ID ile API'den siparişi getir (bildirimden gelince)
    const fetchOrder = useCallback(async () => {
        const oid = paramOrderId || initialOrder?.id
        if (!oid) return
        try {
            setLoading(true)
            const fetched = await getOrderById(oid)
            setOrder(fetched)
            setCurrentStatus(fetched.varto_status)
        } catch (err) {
            console.error("Sipariş getirme hatası:", err)
            Alert.alert("Hata", "Sipariş yüklenemedi", [
                { text: "Geri Dön", onPress: () => navigation.goBack() },
            ])
        } finally {
            setLoading(false)
        }
    }, [paramOrderId, initialOrder?.id])

    useEffect(() => {
        if (!initialOrder && paramOrderId) {
            fetchOrder()
        }
    }, [fetchOrder])

    const currentIndex = STATUS_FLOW.indexOf(currentStatus)
    const nextStatus = currentIndex >= 0 && currentIndex < STATUS_FLOW.length - 1
        ? STATUS_FLOW[currentIndex + 1]
        : null

    const handleStatusUpdate = async (newStatus: string) => {
        if (!order) return
        setUpdating(true)
        try {
            const updated = await updateOrderStatus(order.id, newStatus)
            setCurrentStatus(newStatus)
            setOrder({ ...order, varto_status: newStatus })
            Alert.alert("Başarılı", `Sipariş durumu güncellendi: ${getStatusLabel(newStatus)}`)
        } catch (err) {
            Alert.alert("Hata", "Durum güncellenemedi")
        } finally {
            setUpdating(false)
        }
    }

    const handleCancel = () => {
        Alert.alert("Sipariş İptali", "Bu siparişi iptal etmek istiyor musunuz?", [
            { text: "Vazgeç", style: "cancel" },
            { text: "İptal Et", style: "destructive", onPress: () => handleStatusUpdate("cancelled") },
        ])
    }

    const handleCall = (phone: string) => {
        Linking.openURL(`tel:${phone}`)
    }

    // Loading state
    if (loading || !order) {
        return (
            <SafeAreaView style={s.container} edges={["top"]}>
                <View style={s.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                        <Ionicons name="arrow-back" size={22} color={colors.fg.base} />
                    </TouchableOpacity>
                    <Text style={s.headerTitle}>Sipariş Detayı</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" color={colors.interactive} />
                    <Text style={[s.emptyText, { marginTop: spacing.md }]}>Sipariş yükleniyor...</Text>
                </View>
            </SafeAreaView>
        )
    }

    const deliveryAddress = typeof order.delivery_address === "object"
        ? (order.delivery_address?.address || JSON.stringify(order.delivery_address))
        : (order.delivery_address || "—")

    const deliveryPhone = typeof order.delivery_address === "object"
        ? order.delivery_address?.phone
        : null

    const itemsTotal = (order.items || []).reduce(
        (sum: number, i: any) => sum + (Number(i.total_price) || 0), 0
    )
    const deliveryFee = Number(order.delivery_fee) || 0
    const grandTotal = itemsTotal + deliveryFee

    return (
        <SafeAreaView style={s.container} edges={["top"]}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={colors.fg.base} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Sipariş #{order.id?.slice(-6)}</Text>
                <TouchableOpacity onPress={fetchOrder} style={s.backBtn}>
                    <Ionicons name="refresh-outline" size={22} color={colors.fg.base} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={s.scroll}>
                {/* Status Progress */}
                <View style={s.card}>
                    <Text style={s.cardTitle}>Sipariş Durumu</Text>
                    <View style={s.progressRow}>
                        {STATUS_FLOW.map((status, i) => {
                            const isActive = i <= STATUS_FLOW.indexOf(currentStatus)
                            const isCurrent = status === currentStatus
                            return (
                                <View key={status} style={s.progressItem}>
                                    <View style={[s.progressDot, isActive && s.progressDotActive, isCurrent && s.progressDotCurrent]} />
                                    <Text style={[s.progressLabel, isActive && s.progressLabelActive]}>
                                        {getStatusLabel(status)}
                                    </Text>
                                    {i < STATUS_FLOW.length - 1 && (
                                        <View style={[s.progressLine, isActive && s.progressLineActive]} />
                                    )}
                                </View>
                            )
                        })}
                    </View>
                </View>

                {/* Müşteri Bilgisi */}
                <View style={s.card}>
                    <Text style={s.cardTitle}>Müşteri</Text>
                    <InfoRow icon="person-outline" label="İsim" value={order.customer_name || "—"} />
                    <TouchableOpacity
                        onPress={() => order.customer_phone && handleCall(order.customer_phone)}
                        disabled={!order.customer_phone}
                    >
                        <InfoRow
                            icon="call-outline"
                            label="Telefon"
                            value={order.customer_phone || "—"}
                            highlight={!!order.customer_phone}
                        />
                    </TouchableOpacity>
                    <InfoRow icon="location-outline" label="Adres" value={deliveryAddress} />
                    {deliveryPhone && deliveryPhone !== order.customer_phone && (
                        <TouchableOpacity onPress={() => handleCall(deliveryPhone)}>
                            <InfoRow icon="call-outline" label="Tel (Teslimat)" value={deliveryPhone} highlight />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Ürünler */}
                <View style={s.card}>
                    <Text style={s.cardTitle}>Ürünler ({(order.items || []).length} kalem)</Text>
                    {(order.items || []).map((item: any, i: number) => (
                        <View key={i} style={s.itemRow}>
                            <View style={s.itemQty}>
                                <Text style={s.itemQtyText}>{item.quantity || 1}x</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={s.itemName}>{item.product_name || "Ürün"}</Text>
                                {item.notes && <Text style={s.itemNote}>{item.notes}</Text>}
                            </View>
                            <Text style={s.itemPrice}>₺{Number(item.total_price || 0).toFixed(2)}</Text>
                        </View>
                    ))}

                    {/* Fiyat Özeti */}
                    <View style={s.summarySection}>
                        <View style={s.summaryRow}>
                            <Text style={s.summaryLabel}>Ürünler Toplamı</Text>
                            <Text style={s.summaryValue}>₺{itemsTotal.toFixed(2)}</Text>
                        </View>
                        {deliveryFee > 0 && (
                            <View style={s.summaryRow}>
                                <Text style={s.summaryLabel}>Teslimat Ücreti</Text>
                                <Text style={s.summaryValue}>₺{deliveryFee.toFixed(2)}</Text>
                            </View>
                        )}
                        <View style={[s.summaryRow, s.grandTotalRow]}>
                            <Text style={s.grandTotalLabel}>Toplam</Text>
                            <Text style={s.grandTotalValue}>₺{grandTotal.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                {/* Sipariş Bilgileri */}
                <View style={s.card}>
                    <Text style={s.cardTitle}>Sipariş Bilgileri</Text>
                    <InfoRow icon="time-outline" label="Tarih" value={
                        order.created_at ? new Date(order.created_at).toLocaleString("tr-TR") : "—"
                    } />
                    <InfoRow icon="card-outline" label="Ödeme" value={
                        order.payment_method === "iban" ? "IBAN / Havale" : (order.payment_method || "—")
                    } />
                    {order.iban_info && <InfoRow icon="wallet-outline" label="IBAN" value={order.iban_info} />}
                    {order.delivery_notes && <InfoRow icon="chatbubble-outline" label="Not" value={order.delivery_notes} />}
                </View>

                {/* Actions */}
                <View style={s.actions}>
                    {nextStatus && currentStatus !== "cancelled" && (
                        <TouchableOpacity
                            style={s.primaryBtn}
                            onPress={() => handleStatusUpdate(nextStatus)}
                            disabled={updating}
                            activeOpacity={0.8}
                        >
                            {updating ? (
                                <ActivityIndicator color={colors.fg.on_color} size="small" />
                            ) : (
                                <>
                                    <Ionicons name={getNextIcon(nextStatus)} size={18} color={colors.fg.on_color} />
                                    <Text style={s.primaryBtnText}>{getNextAction(nextStatus)}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}

                    {currentStatus === "pending" && (
                        <TouchableOpacity style={s.cancelBtn} onPress={handleCancel} activeOpacity={0.8}>
                            <Ionicons name="close-circle-outline" size={18} color={colors.tag.red.fg} />
                            <Text style={s.cancelBtnText}>Siparişi İptal Et</Text>
                        </TouchableOpacity>
                    )}

                    {currentStatus === "delivered" && (
                        <View style={s.completedBanner}>
                            <Ionicons name="checkmark-circle" size={24} color={colors.tag.green.fg} />
                            <Text style={s.completedText}>Sipariş teslim edildi ✓</Text>
                        </View>
                    )}

                    {currentStatus === "cancelled" && (
                        <View style={[s.completedBanner, { backgroundColor: colors.tag.red.bg }]}>
                            <Ionicons name="close-circle" size={24} color={colors.tag.red.fg} />
                            <Text style={[s.completedText, { color: colors.tag.red.fg }]}>Sipariş iptal edildi</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

function InfoRow({ icon, label, value, highlight }: { icon: any; label: string; value: string; highlight?: boolean }) {
    return (
        <View style={s.infoRow}>
            <Ionicons name={icon} size={16} color={highlight ? colors.interactive : colors.fg.muted} />
            <Text style={s.infoLabel}>{label}</Text>
            <Text style={[s.infoValue, highlight && { color: colors.interactive, fontWeight: "600" }]}>{value}</Text>
        </View>
    )
}

function getStatusLabel(status: string) {
    const labels: Record<string, string> = {
        pending: "Bekliyor", confirmed: "Onay", preparing: "Hazırlık",
        ready: "Hazır", delivered: "Teslim", cancelled: "İptal",
    }
    return labels[status] || status
}

function getNextAction(status: string) {
    const actions: Record<string, string> = {
        confirmed: "Siparişi Onayla", preparing: "Hazırlamaya Başla",
        ready: "Hazır Olarak İşaretle", delivered: "Teslim Edildi",
    }
    return actions[status] || "İlerle"
}

function getNextIcon(status: string): any {
    const icons: Record<string, string> = {
        confirmed: "checkmark-circle-outline", preparing: "flame-outline",
        ready: "checkmark-done-outline", delivered: "bicycle-outline",
    }
    return icons[status] || "arrow-forward-outline"
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg.subtle },
    header: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
        backgroundColor: colors.bg.base, borderBottomWidth: 1, borderBottomColor: colors.border.base,
    },
    backBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
    headerTitle: { ...typography.h2 },
    scroll: { padding: spacing.lg, paddingBottom: 100 },
    card: {
        backgroundColor: colors.bg.base, borderRadius: radius.lg,
        padding: spacing.lg, marginBottom: spacing.md,
        borderWidth: 1, borderColor: colors.border.base,
    },
    cardTitle: { ...typography.h3, marginBottom: spacing.md },
    progressRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
    progressItem: { alignItems: "center", flex: 1 },
    progressDot: {
        width: 12, height: 12, borderRadius: 6,
        backgroundColor: colors.border.base, marginBottom: spacing.xs,
    },
    progressDotActive: { backgroundColor: colors.tag.green.fg },
    progressDotCurrent: { backgroundColor: colors.interactive, width: 16, height: 16, borderRadius: 8 },
    progressLabel: { ...typography.caption, textAlign: "center" },
    progressLabelActive: { color: colors.fg.base, fontWeight: "500" },
    progressLine: {
        position: "absolute", top: 6, left: "55%", right: "-45%",
        height: 2, backgroundColor: colors.border.base,
    },
    progressLineActive: { backgroundColor: colors.tag.green.fg },
    infoRow: {
        flexDirection: "row", alignItems: "center", gap: spacing.sm,
        paddingVertical: spacing.xs,
    },
    infoLabel: { ...typography.small, width: 70, color: colors.fg.muted },
    infoValue: { ...typography.body, flex: 1, color: colors.fg.base },
    itemRow: {
        flexDirection: "row", alignItems: "center", gap: spacing.md,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1, borderBottomColor: colors.border.base,
    },
    itemQty: {
        width: 32, height: 32, borderRadius: radius.sm,
        backgroundColor: colors.bg.field,
        justifyContent: "center", alignItems: "center",
    },
    itemQtyText: { ...typography.label, fontWeight: "700" },
    itemName: { ...typography.body, color: colors.fg.base },
    itemNote: { ...typography.caption, fontStyle: "italic", color: colors.fg.muted },
    itemPrice: { ...typography.h3 },
    summarySection: {
        marginTop: spacing.md, paddingTop: spacing.md,
        borderTopWidth: 1, borderTopColor: colors.border.base,
    },
    summaryRow: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingVertical: 4,
    },
    summaryLabel: { ...typography.body, color: colors.fg.muted },
    summaryValue: { ...typography.body, color: colors.fg.base },
    grandTotalRow: {
        marginTop: spacing.sm, paddingTop: spacing.sm,
        borderTopWidth: 1, borderTopColor: colors.border.base,
    },
    grandTotalLabel: { ...typography.h3 },
    grandTotalValue: { ...typography.h1, color: colors.interactive },
    actions: { gap: spacing.md, marginTop: spacing.md },
    primaryBtn: {
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm,
        backgroundColor: colors.interactive, borderRadius: radius.md,
        height: 50,
    },
    primaryBtnText: { fontSize: 15, fontWeight: "600", color: colors.fg.on_color },
    cancelBtn: {
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm,
        backgroundColor: colors.tag.red.bg, borderRadius: radius.md,
        height: 48,
    },
    cancelBtnText: { fontSize: 14, fontWeight: "600", color: colors.tag.red.fg },
    completedBanner: {
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm,
        backgroundColor: colors.tag.green.bg, borderRadius: radius.md,
        height: 48,
    },
    completedText: { fontSize: 14, fontWeight: "600", color: colors.tag.green.fg },
    emptyText: { ...typography.body, color: colors.fg.muted },
})
