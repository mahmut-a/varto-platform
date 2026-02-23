import React, { useState, useEffect, useCallback } from "react"
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Alert, ActivityIndicator, Linking,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { colors, spacing, radius, typography } from "../theme/tokens"
import {
    getOrderById, assignCourierToOrder, acceptOrder,
    startDelivery, completeDelivery, getCurrentCourierId,
    getVendorById,
} from "../api/client"

const COURIER_STATUS_FLOW = ["confirmed", "assigned", "accepted", "delivering", "delivered"]

interface Props {
    route: any
    navigation: any
}

export default function OrderDetailScreen({ route, navigation }: Props) {
    const { order: initialOrder, orderId: paramOrderId } = route.params || {}

    const [order, setOrder] = useState<any>(initialOrder || null)
    const [vendor, setVendor] = useState<any>(null)
    const [loading, setLoading] = useState(!initialOrder)
    const [updating, setUpdating] = useState(false)

    const courierId = getCurrentCourierId()

    const fetchOrder = useCallback(async () => {
        const oid = paramOrderId || initialOrder?.id
        if (!oid) return
        try {
            setLoading(true)
            const fetched = await getOrderById(oid)
            setOrder(fetched)

            // Vendor bilgisini al
            if (fetched.vendor_id) {
                try {
                    const v = await getVendorById(fetched.vendor_id)
                    setVendor(v)
                } catch { }
            }
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
        fetchOrder()
    }, [fetchOrder])

    const currentStatus = order?.varto_status || "confirmed"
    const isMyOrder = order?.courier_id === courierId
    const isAvailable = currentStatus === "confirmed" && !order?.courier_id

    const handleAssign = async () => {
        if (!order || !courierId) return
        Alert.alert("Teslimatı Al", "Bu siparişi almak istiyor musunuz?", [
            { text: "Vazgeç", style: "cancel" },
            {
                text: "Teslimatı Al",
                onPress: async () => {
                    setUpdating(true)
                    try {
                        const updated = await assignCourierToOrder(order.id, courierId)
                        setOrder({ ...order, ...updated, courier_id: courierId, varto_status: "assigned" })
                        Alert.alert("Başarılı", "Teslimat size atandı!")
                    } catch (err) {
                        Alert.alert("Hata", "Teslimat atanamadı")
                    } finally {
                        setUpdating(false)
                    }
                },
            },
        ])
    }

    const handleAccept = async () => {
        if (!order) return
        setUpdating(true)
        try {
            await acceptOrder(order.id)
            setOrder({ ...order, varto_status: "accepted" })
            Alert.alert("Başarılı", "Teslimat kabul edildi")
        } catch (err) {
            Alert.alert("Hata", "İşlem başarısız")
        } finally {
            setUpdating(false)
        }
    }

    const handleStartDelivery = async () => {
        if (!order) return
        setUpdating(true)
        try {
            await startDelivery(order.id)
            setOrder({ ...order, varto_status: "delivering" })
            Alert.alert("Başarılı", "Teslimat başlatıldı")
        } catch (err) {
            Alert.alert("Hata", "İşlem başarısız")
        } finally {
            setUpdating(false)
        }
    }

    const handleComplete = async () => {
        if (!order) return
        Alert.alert("Teslim Edildi", "Siparişi teslim edildi olarak işaretlemek istiyor musunuz?", [
            { text: "Vazgeç", style: "cancel" },
            {
                text: "Teslim Edildi",
                onPress: async () => {
                    setUpdating(true)
                    try {
                        await completeDelivery(order.id)
                        setOrder({ ...order, varto_status: "delivered" })
                        Alert.alert("Başarılı", "Teslimat tamamlandı! 🎉")
                    } catch (err) {
                        Alert.alert("Hata", "İşlem başarısız")
                    } finally {
                        setUpdating(false)
                    }
                },
            },
        ])
    }

    const handleCall = (phone: string) => {
        Linking.openURL(`tel:${phone}`)
    }

    const handleOpenMaps = () => {
        if (!order?.delivery_address) return
        const addr = typeof order.delivery_address === "object"
            ? (order.delivery_address?.address || "")
            : (order.delivery_address || "")
        if (addr) {
            const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`
            Linking.openURL(url)
        }
    }

    // Loading state
    if (loading || !order) {
        return (
            <SafeAreaView style={s.container} edges={["top"]}>
                <View style={s.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                        <Ionicons name="arrow-back" size={22} color={colors.fg.base} />
                    </TouchableOpacity>
                    <Text style={s.headerTitle}>Teslimat Detayı</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" color={colors.interactive} />
                    <Text style={[s.emptyText, { marginTop: spacing.md }]}>Yükleniyor...</Text>
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
                    <Text style={s.cardTitle}>Teslimat Durumu</Text>
                    <View style={s.progressRow}>
                        {COURIER_STATUS_FLOW.map((status, i) => {
                            const currentIndex = COURIER_STATUS_FLOW.indexOf(currentStatus)
                            const isActive = i <= currentIndex
                            const isCurrent = status === currentStatus
                            return (
                                <View key={status} style={s.progressItem}>
                                    <View style={[s.progressDot, isActive && s.progressDotActive, isCurrent && s.progressDotCurrent]} />
                                    <Text style={[s.progressLabel, isActive && s.progressLabelActive]}>
                                        {getStatusLabel(status)}
                                    </Text>
                                    {i < COURIER_STATUS_FLOW.length - 1 && (
                                        <View style={[s.progressLine, isActive && s.progressLineActive]} />
                                    )}
                                </View>
                            )
                        })}
                    </View>
                </View>

                {/* İşletme Bilgisi */}
                <View style={s.card}>
                    <Text style={s.cardTitle}>🏪 İşletme</Text>
                    <InfoRow icon="storefront-outline" label="İşletme" value={vendor?.name || "—"} />
                    {vendor?.phone && (
                        <TouchableOpacity onPress={() => handleCall(vendor.phone)}>
                            <InfoRow icon="call-outline" label="Telefon" value={vendor.phone} highlight />
                        </TouchableOpacity>
                    )}
                    {vendor?.address && (
                        <InfoRow icon="location-outline" label="Adres" value={vendor.address} />
                    )}
                </View>

                {/* Teslimat Adresi */}
                <View style={s.card}>
                    <Text style={s.cardTitle}>📍 Teslimat</Text>
                    <InfoRow icon="location-outline" label="Adres" value={deliveryAddress} />
                    {order.customer_phone && (
                        <TouchableOpacity onPress={() => handleCall(order.customer_phone)}>
                            <InfoRow icon="call-outline" label="Müşteri" value={order.customer_phone} highlight />
                        </TouchableOpacity>
                    )}
                    {deliveryPhone && deliveryPhone !== order.customer_phone && (
                        <TouchableOpacity onPress={() => handleCall(deliveryPhone)}>
                            <InfoRow icon="call-outline" label="Tel (Tes.)" value={deliveryPhone} highlight />
                        </TouchableOpacity>
                    )}
                    {order.delivery_notes && (
                        <InfoRow icon="chatbubble-outline" label="Not" value={order.delivery_notes} />
                    )}

                    {/* Haritada Aç */}
                    <TouchableOpacity style={s.mapBtn} onPress={handleOpenMaps} activeOpacity={0.7}>
                        <Ionicons name="map-outline" size={16} color={colors.interactive} />
                        <Text style={s.mapBtnText}>Haritada Aç</Text>
                    </TouchableOpacity>
                </View>

                {/* Ürünler */}
                <View style={s.card}>
                    <Text style={s.cardTitle}>📦 Ürünler ({(order.items || []).length} kalem)</Text>
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
                                <Text style={[s.summaryValue, { color: colors.tag.green.fg }]}>₺{deliveryFee.toFixed(2)}</Text>
                            </View>
                        )}
                        <View style={[s.summaryRow, s.grandTotalRow]}>
                            <Text style={s.grandTotalLabel}>Toplam</Text>
                            <Text style={s.grandTotalValue}>₺{grandTotal.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                {/* Actions */}
                <View style={s.actions}>
                    {/* Teslimatı Al - sadece confirmed ve courier_id yoksa */}
                    {isAvailable && (
                        <TouchableOpacity
                            style={s.primaryBtn}
                            onPress={handleAssign}
                            disabled={updating}
                            activeOpacity={0.8}
                        >
                            {updating ? (
                                <ActivityIndicator color={colors.fg.on_color} size="small" />
                            ) : (
                                <>
                                    <Ionicons name="hand-left-outline" size={18} color={colors.fg.on_color} />
                                    <Text style={s.primaryBtnText}>Teslimatı Al</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}

                    {/* Kabul Et - sadece assigned ve benim siparişim */}
                    {isMyOrder && currentStatus === "assigned" && (
                        <TouchableOpacity
                            style={s.primaryBtn}
                            onPress={handleAccept}
                            disabled={updating}
                            activeOpacity={0.8}
                        >
                            {updating ? (
                                <ActivityIndicator color={colors.fg.on_color} size="small" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle-outline" size={18} color={colors.fg.on_color} />
                                    <Text style={s.primaryBtnText}>Kabul Et</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}

                    {/* Yola Çık - sadece accepted */}
                    {isMyOrder && currentStatus === "accepted" && (
                        <TouchableOpacity
                            style={[s.primaryBtn, { backgroundColor: colors.tag.purple.fg }]}
                            onPress={handleStartDelivery}
                            disabled={updating}
                            activeOpacity={0.8}
                        >
                            {updating ? (
                                <ActivityIndicator color={colors.fg.on_color} size="small" />
                            ) : (
                                <>
                                    <Ionicons name="navigate-outline" size={18} color={colors.fg.on_color} />
                                    <Text style={s.primaryBtnText}>Yola Çık</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}

                    {/* Teslim Et - sadece delivering */}
                    {isMyOrder && currentStatus === "delivering" && (
                        <TouchableOpacity
                            style={[s.primaryBtn, { backgroundColor: colors.tag.green.fg }]}
                            onPress={handleComplete}
                            disabled={updating}
                            activeOpacity={0.8}
                        >
                            {updating ? (
                                <ActivityIndicator color={colors.fg.on_color} size="small" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-done-outline" size={18} color={colors.fg.on_color} />
                                    <Text style={s.primaryBtnText}>Teslim Edildi</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}

                    {/* Teslim edildi banner */}
                    {currentStatus === "delivered" && (
                        <View style={s.completedBanner}>
                            <Ionicons name="checkmark-circle" size={24} color={colors.tag.green.fg} />
                            <Text style={s.completedText}>Teslimat tamamlandı ✓</Text>
                        </View>
                    )}

                    {/* İptal banner */}
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
        confirmed: "Onay", assigned: "Atandı", accepted: "Kabul",
        delivering: "Yolda", delivered: "Teslim", cancelled: "İptal",
    }
    return labels[status] || status
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
    mapBtn: {
        flexDirection: "row", alignItems: "center", justifyContent: "center",
        gap: spacing.xs, marginTop: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: "#EFF6FF", borderRadius: radius.md,
    },
    mapBtnText: { ...typography.label, color: colors.interactive },
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
    completedBanner: {
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm,
        backgroundColor: colors.tag.green.bg, borderRadius: radius.md,
        height: 48,
    },
    completedText: { fontSize: 14, fontWeight: "600", color: colors.tag.green.fg },
    emptyText: { ...typography.body, color: colors.fg.muted },
})
