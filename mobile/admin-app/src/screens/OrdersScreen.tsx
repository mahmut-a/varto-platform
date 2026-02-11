import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    Modal,
    TextInput,
    ScrollView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { colors, spacing, radius, typography } from "../theme/tokens"
import { getVartoOrders, updateVartoOrder, deleteVartoOrder, getOrderItems, createOrderItem, deleteOrderItem } from "../api/client"

const STATUS_MAP: Record<string, { label: string; tag: keyof typeof colors.tag }> = {
    pending: { label: "Bekliyor", tag: "orange" },
    confirmed: { label: "Onaylandı", tag: "blue" },
    preparing: { label: "Hazırlanıyor", tag: "purple" },
    ready: { label: "Hazır", tag: "blue" },
    assigned: { label: "Atandı", tag: "purple" },
    accepted: { label: "Kabul Edildi", tag: "blue" },
    delivering: { label: "Teslimatta", tag: "orange" },
    delivered: { label: "Teslim Edildi", tag: "green" },
    cancelled: { label: "İptal", tag: "red" },
}
const STATUS_OPTIONS = Object.entries(STATUS_MAP).map(([value, { label }]) => ({ value, label }))

const emptyItem = { product_name: "", quantity: "1", unit_price: "" }

export default function OrdersScreen() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [detailModalOpen, setDetailModalOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [items, setItems] = useState<any[]>([])
    const [itemsLoading, setItemsLoading] = useState(false)
    const [newItem, setNewItem] = useState({ ...emptyItem })
    const [statusPickerOpen, setStatusPickerOpen] = useState(false)
    const [orderStatus, setOrderStatus] = useState("")

    const fetchOrders = async () => {
        try { const data = await getVartoOrders(); setOrders(data || []) }
        catch { } finally { setLoading(false); setRefreshing(false) }
    }

    useEffect(() => { fetchOrders() }, [])

    const openDetail = async (order: any) => {
        setSelectedOrder(order)
        setOrderStatus(order.varto_status)
        setDetailModalOpen(true)
        setItemsLoading(true)
        try { const data = await getOrderItems(order.id); setItems(data || []) }
        catch { setItems([]) } finally { setItemsLoading(false) }
    }

    const handleStatusUpdate = async () => {
        if (!selectedOrder || orderStatus === selectedOrder.varto_status) return
        try {
            await updateVartoOrder(selectedOrder.id, { varto_status: orderStatus })
            setOrders((prev) => prev.map((o) => o.id === selectedOrder.id ? { ...o, varto_status: orderStatus } : o))
            setSelectedOrder({ ...selectedOrder, varto_status: orderStatus })
            Alert.alert("Başarılı", "Durum güncellendi.")
        } catch { Alert.alert("Hata", "Güncelleme başarısız.") }
    }

    const handleAddItem = async () => {
        if (!newItem.product_name || !newItem.unit_price) { Alert.alert("Hata", "Ürün adı ve birim fiyat zorunludur."); return }
        try {
            const qty = Number(newItem.quantity) || 1
            const price = Number(newItem.unit_price)
            const item = await createOrderItem(selectedOrder.id, {
                product_name: newItem.product_name, quantity: qty,
                unit_price: price, total_price: qty * price,
            })
            setItems((prev) => [...prev, item])
            setNewItem({ ...emptyItem })
        } catch { Alert.alert("Hata", "Kalem eklenemedi.") }
    }

    const handleDeleteItem = (itemId: string) => {
        Alert.alert("Sil", "Bu kalemi silmek istediğinizden emin misiniz?", [
            { text: "İptal", style: "cancel" },
            {
                text: "Sil", style: "destructive", onPress: async () => {
                    try { await deleteOrderItem(selectedOrder.id, itemId); setItems((prev) => prev.filter((i) => i.id !== itemId)) }
                    catch { Alert.alert("Hata", "Silme başarısız.") }
                }
            },
        ])
    }

    const handleDeleteOrder = () => {
        if (!selectedOrder) return
        Alert.alert("Siparişi Sil", "Bu sipariş kalıcı olarak silinecek. Emin misiniz?", [
            { text: "İptal", style: "cancel" },
            {
                text: "Sil", style: "destructive", onPress: async () => {
                    try {
                        await deleteVartoOrder(selectedOrder.id)
                        setOrders((prev) => prev.filter((o) => o.id !== selectedOrder.id))
                        setDetailModalOpen(false)
                    } catch { Alert.alert("Hata", "Silme başarısız.") }
                }
            },
        ])
    }

    if (loading) return <View style={styles.center}><ActivityIndicator size="small" color={colors.fg.muted} /></View>

    return (
        <View style={styles.container}>
            <FlatList
                data={orders}
                keyExtractor={(item) => item.id}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders() }} tintColor={colors.fg.muted} />}
                contentContainerStyle={{ padding: spacing.xl }}
                ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
                renderItem={({ item }) => {
                    const status = STATUS_MAP[item.varto_status] || { label: item.varto_status, tag: "neutral" as const }
                    const tagColors = colors.tag[status.tag]
                    const address = item.delivery_address || {}
                    return (
                        <TouchableOpacity style={styles.card} onPress={() => openDetail(item)} activeOpacity={0.7}>
                            <View style={styles.cardRow}>
                                <Text style={styles.orderId}>#{item.id?.slice(-6).toUpperCase()}</Text>
                                <View style={[styles.tag, { backgroundColor: tagColors.bg }]}>
                                    <Text style={[styles.tagText, { color: tagColors.fg }]}>{status.label}</Text>
                                </View>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="location-outline" size={14} color={colors.fg.muted} />
                                <Text style={styles.detail} numberOfLines={1}>
                                    {[address.neighborhood, address.street, address.building].filter(Boolean).join(", ") || "Adres yok"}
                                </Text>
                            </View>
                            {item.delivery_notes && (
                                <View style={styles.detailRow}>
                                    <Ionicons name="chatbubble-outline" size={14} color={colors.fg.muted} />
                                    <Text style={styles.detail} numberOfLines={1}>{item.delivery_notes}</Text>
                                </View>
                            )}
                            <View style={styles.footer}>
                                <Text style={styles.footerText}>{item.payment_method?.toUpperCase()}</Text>
                                <Text style={styles.footerText}>{new Date(item.created_at).toLocaleDateString("tr-TR")}</Text>
                            </View>
                        </TouchableOpacity>
                    )
                }}
                ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>Henüz sipariş yok</Text></View>}
            />

            {/* Detail Modal */}
            <Modal visible={detailModalOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setDetailModalOpen(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setDetailModalOpen(false)}><Text style={styles.modalCancel}>Kapat</Text></TouchableOpacity>
                        <Text style={styles.modalTitle}>Sipariş #{selectedOrder?.id?.slice(-6).toUpperCase()}</Text>
                        <View style={{ width: 40 }} />
                    </View>
                    <ScrollView contentContainerStyle={styles.formContent}>
                        {/* Status Update */}
                        <Text style={styles.sectionTitle}>Durum Güncelle</Text>
                        <View style={{ flexDirection: "row", gap: spacing.sm }}>
                            <TouchableOpacity style={[styles.input, { flex: 1 }]} onPress={() => setStatusPickerOpen(true)}>
                                <Text style={{ color: colors.fg.base }}>{STATUS_MAP[orderStatus]?.label || orderStatus}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveStatusBtn} onPress={handleStatusUpdate}>
                                <Text style={styles.saveStatusText}>Kaydet</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Order Items */}
                        <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Sipariş Kalemleri</Text>
                        {itemsLoading ? (
                            <ActivityIndicator size="small" color={colors.fg.muted} />
                        ) : items.length === 0 ? (
                            <Text style={styles.emptyItemsText}>Henüz kalem yok</Text>
                        ) : (
                            items.map((item) => (
                                <View key={item.id} style={styles.itemRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.itemName}>{item.product_name}</Text>
                                        <Text style={styles.itemDetail}>{item.quantity}x ₺{Number(item.unit_price).toFixed(2)} = ₺{Number(item.total_price).toFixed(2)}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => handleDeleteItem(item.id)}>
                                        <Ionicons name="trash-outline" size={16} color={colors.tag.red.fg} />
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}

                        {/* Add Item */}
                        <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Yeni Kalem Ekle</Text>
                        <TextInput style={styles.input} value={newItem.product_name} onChangeText={(v) => setNewItem({ ...newItem, product_name: v })} placeholder="Ürün adı" placeholderTextColor={colors.fg.muted} />
                        <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm }}>
                            <TextInput style={[styles.input, { flex: 1 }]} value={newItem.quantity} onChangeText={(v) => setNewItem({ ...newItem, quantity: v })} placeholder="Adet" keyboardType="numeric" placeholderTextColor={colors.fg.muted} />
                            <TextInput style={[styles.input, { flex: 1 }]} value={newItem.unit_price} onChangeText={(v) => setNewItem({ ...newItem, unit_price: v })} placeholder="Birim fiyat" keyboardType="numeric" placeholderTextColor={colors.fg.muted} />
                        </View>
                        <TouchableOpacity style={styles.addItemBtn} onPress={handleAddItem} activeOpacity={0.7}>
                            <Ionicons name="add" size={18} color={colors.fg.on_color} />
                            <Text style={styles.addItemText}>Kalem Ekle</Text>
                        </TouchableOpacity>

                        {/* Delete Order */}
                        <TouchableOpacity style={styles.deleteOrderBtn} onPress={handleDeleteOrder} activeOpacity={0.7}>
                            <Ionicons name="trash-outline" size={16} color={colors.tag.red.fg} />
                            <Text style={styles.deleteOrderText}>Siparişi Sil</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* Status Picker */}
                <Modal visible={statusPickerOpen} transparent animationType="fade" onRequestClose={() => setStatusPickerOpen(false)}>
                    <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setStatusPickerOpen(false)}>
                        <View style={styles.pickerContent}>
                            <ScrollView style={{ maxHeight: 350 }}>
                                {STATUS_OPTIONS.map((s) => (
                                    <TouchableOpacity key={s.value} style={styles.pickerItem} onPress={() => { setOrderStatus(s.value); setStatusPickerOpen(false) }}>
                                        <Text style={[styles.pickerItemText, orderStatus === s.value && { color: colors.interactive, fontWeight: "600" }]}>{s.label}</Text>
                                        {orderStatus === s.value && <Ionicons name="checkmark" size={18} color={colors.interactive} />}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg.base },
    center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg.base },
    card: { backgroundColor: colors.bg.base, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border.base, padding: spacing.lg },
    cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md },
    orderId: { ...typography.mono, fontWeight: "600" },
    tag: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm },
    tagText: { fontSize: 12, fontWeight: "500" },
    detailRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: 4 },
    detail: { ...typography.small, flex: 1 },
    footer: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border.base },
    footerText: { ...typography.small },
    empty: { alignItems: "center", paddingTop: 60 },
    emptyText: { ...typography.body },

    // Modal
    modalContainer: { flex: 1, backgroundColor: colors.bg.base },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border.base },
    modalCancel: { ...typography.body, color: colors.fg.subtle },
    modalTitle: { ...typography.h2 },
    formContent: { padding: spacing.xl, gap: spacing.sm },
    sectionTitle: { ...typography.h3, marginBottom: spacing.sm },
    input: { borderWidth: 1, borderColor: colors.border.base, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, fontSize: 14, color: colors.fg.base, backgroundColor: colors.bg.field },
    saveStatusBtn: { backgroundColor: colors.interactive, paddingHorizontal: spacing.xl, borderRadius: radius.md, justifyContent: "center" },
    saveStatusText: { color: colors.fg.on_color, fontWeight: "500", fontSize: 13 },

    // Items
    emptyItemsText: { ...typography.small, textAlign: "center", paddingVertical: spacing.lg },
    itemRow: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border.base },
    itemName: { ...typography.label },
    itemDetail: { ...typography.small, marginTop: 2 },
    addItemBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs, backgroundColor: colors.interactive, paddingVertical: spacing.md, borderRadius: radius.md, marginTop: spacing.md },
    addItemText: { color: colors.fg.on_color, fontWeight: "500", fontSize: 14 },
    deleteOrderBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs, paddingVertical: spacing.lg, marginTop: spacing.xxxl, borderTopWidth: 1, borderTopColor: colors.border.base },
    deleteOrderText: { color: colors.tag.red.fg, fontWeight: "500", fontSize: 14 },

    // Picker
    pickerOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.4)" },
    pickerContent: { backgroundColor: colors.bg.base, borderRadius: radius.lg, padding: spacing.md, width: 280 },
    pickerItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: spacing.md, paddingHorizontal: spacing.md },
    pickerItemText: { ...typography.body },
})
