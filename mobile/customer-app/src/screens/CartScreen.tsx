import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    useColorScheme,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { getColors, getTypography, spacing, radius, shadow } from "../theme/tokens"
import { createOrder } from "../api/client"

interface CartItem {
    product_name: string
    unit_price: number
    quantity: number
    notes: string
}

export default function CartScreen({ route, navigation, customer }: any) {
    const c = getColors()
    const t = getTypography()

    const [items, setItems] = useState<CartItem[]>([])
    const [vendor, setVendor] = useState<any>(null)
    const [address, setAddress] = useState(customer?.address || "")
    const [notes, setNotes] = useState("")
    const [phone, setPhone] = useState(customer?.phone || "")
    const [submitting, setSubmitting] = useState(false)
    const [orderId, setOrderId] = useState<string | null>(null)

    // Receive items from VendorDetail
    useEffect(() => {
        if (route.params?.addItem && route.params?.vendor) {
            const newItem = route.params.addItem as CartItem
            setVendor(route.params.vendor)
            setItems((prev) => {
                const existing = prev.findIndex((i) => i.product_name === newItem.product_name)
                if (existing >= 0) {
                    const updated = [...prev]
                    updated[existing].quantity += 1
                    return updated
                }
                return [...prev, newItem]
            })
            // Clear params
            navigation.setParams({ addItem: undefined, vendor: undefined })
        }
    }, [route.params?.addItem])

    const updateQty = (idx: number, delta: number) => {
        setItems((prev) => {
            const updated = [...prev]
            updated[idx].quantity = Math.max(0, updated[idx].quantity + delta)
            return updated.filter((i) => i.quantity > 0)
        })
    }

    const total = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0)
    const deliveryFee = 15

    const handleSubmit = async () => {
        if (!vendor) { Alert.alert("Hata", "Lütfen bir işletmeden ürün ekleyin."); return }
        if (items.length === 0) { Alert.alert("Hata", "Sepetiniz boş."); return }
        if (!address.trim()) { Alert.alert("Hata", "Teslimat adresi zorunludur."); return }
        if (!phone.trim()) { Alert.alert("Hata", "Telefon numarası zorunludur."); return }

        setSubmitting(true)
        try {
            const order = await createOrder({
                vendor_id: vendor.id,
                customer_id: customer?.id || null,
                customer_phone: customer?.phone || phone,
                delivery_address: { address, phone },
                delivery_notes: notes || null,
                delivery_fee: deliveryFee,
                payment_method: "iban",
                iban_info: vendor.iban,
                items: items.map((i) => ({
                    product_name: i.product_name,
                    quantity: i.quantity,
                    unit_price: i.unit_price,
                })),
            })
            setOrderId(order.id)
            setItems([])
            setVendor(null)
            Alert.alert("Sipariş Verildi! ✅", `Sipariş #${order.id.slice(-6)} oluşturuldu.`, [
                { text: "Takip Et", onPress: () => navigation.navigate("OrdersTab", { screen: "OrderTracking", params: { orderId: order.id } }) },
                { text: "Tamam" },
            ])
        } catch (e: any) {
            Alert.alert("Hata", e?.response?.data?.message || "Sipariş oluşturulamadı.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <KeyboardAvoidingView style={[styles.container, { backgroundColor: c.bg.base }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Vendor info */}
                {vendor && (
                    <View style={[styles.vendorBar, { backgroundColor: c.bg.subtle, borderColor: c.border.base }]}>
                        <Ionicons name="storefront-outline" size={18} color={c.interactive} />
                        <Text style={[t.h3, { marginLeft: spacing.sm, flex: 1 }]}>{vendor.name}</Text>
                    </View>
                )}

                {/* Items */}
                {items.length === 0 ? (
                    <View style={styles.empty}>
                        <Ionicons name="bag-outline" size={56} color={c.fg.disabled} />
                        <Text style={[t.body, { marginTop: spacing.lg, textAlign: "center" }]}>Sepetiniz boş</Text>
                        <Text style={[t.small, { textAlign: "center", marginTop: spacing.xs }]}>İşletme sayfasından ürün ekleyin</Text>
                    </View>
                ) : (
                    <>
                        <Text style={[t.h2, { marginBottom: spacing.md }]}>Sepetiniz</Text>
                        {items.map((item, idx) => (
                            <View key={idx} style={[styles.itemCard, { backgroundColor: c.bg.component, borderColor: c.border.base }]}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[t.h3]}>{item.product_name}</Text>
                                    <Text style={[t.price, { marginTop: 2 }]}>₺{item.unit_price}</Text>
                                </View>
                                <View style={styles.qtyRow}>
                                    <TouchableOpacity style={[styles.qtyBtn, { backgroundColor: c.bg.field }]} onPress={() => updateQty(idx, -1)}>
                                        <Ionicons name="remove" size={16} color={c.fg.subtle} />
                                    </TouchableOpacity>
                                    <Text style={[t.h3, { minWidth: 28, textAlign: "center" }]}>{item.quantity}</Text>
                                    <TouchableOpacity style={[styles.qtyBtn, { backgroundColor: c.bg.field }]} onPress={() => updateQty(idx, 1)}>
                                        <Ionicons name="add" size={16} color={c.fg.subtle} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}

                        {/* Order form */}
                        <View style={[styles.formSection, { borderTopColor: c.border.base }]}>
                            <Text style={[t.h2, { marginBottom: spacing.md }]}>Teslimat Bilgileri</Text>

                            <Text style={[t.label, { marginBottom: spacing.xs }]}>Adres *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: c.bg.field, borderColor: c.border.base, color: c.fg.base }]}
                                value={address}
                                onChangeText={setAddress}
                                placeholder="Teslimat adresi"
                                placeholderTextColor={c.fg.muted}
                                multiline
                            />

                            <Text style={[t.label, { marginTop: spacing.md, marginBottom: spacing.xs }]}>Telefon *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: c.bg.field, borderColor: c.border.base, color: c.fg.base }]}
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="05XX XXX XXXX"
                                placeholderTextColor={c.fg.muted}
                                keyboardType="phone-pad"
                            />

                            <Text style={[t.label, { marginTop: spacing.md, marginBottom: spacing.xs }]}>Not (opsiyonel)</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: c.bg.field, borderColor: c.border.base, color: c.fg.base }]}
                                value={notes}
                                onChangeText={setNotes}
                                placeholder="Kapı no, kat, vs."
                                placeholderTextColor={c.fg.muted}
                            />
                        </View>

                        {/* Summary */}
                        <View style={[styles.summary, { borderTopColor: c.border.base }]}>
                            <View style={styles.summaryRow}>
                                <Text style={[t.body]}>Ara Toplam</Text>
                                <Text style={[t.body]}>₺{total.toLocaleString("tr-TR")}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={[t.body]}>Teslimat</Text>
                                <Text style={[t.body]}>₺{deliveryFee}</Text>
                            </View>
                            <View style={[styles.summaryRow, { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: c.border.base }]}>
                                <Text style={[t.h2]}>Toplam</Text>
                                <Text style={[t.h2, { color: c.interactive }]}>₺{(total + deliveryFee).toLocaleString("tr-TR")}</Text>
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>

            {items.length > 0 && (
                <View style={[styles.bottomBar, { backgroundColor: c.bg.component, borderTopColor: c.border.base }]}>
                    <TouchableOpacity
                        style={[styles.submitBtn, { backgroundColor: c.interactive, opacity: submitting ? 0.5 : 1 }]}
                        onPress={handleSubmit}
                        disabled={submitting}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="checkmark-circle-outline" size={20} color={c.fg.on_color} />
                        <Text style={[styles.submitText, { color: c.fg.on_color }]}>
                            {submitting ? "Gönderiliyor..." : `Sipariş Ver — ₺${(total + deliveryFee).toLocaleString("tr-TR")}`}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: spacing.xl, paddingBottom: 100 },
    vendorBar: { flexDirection: "row", alignItems: "center", padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, marginBottom: spacing.xl },
    empty: { alignItems: "center", paddingTop: 80 },
    itemCard: { flexDirection: "row", alignItems: "center", padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, marginBottom: spacing.md },
    qtyRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    qtyBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
    formSection: { marginTop: spacing.xl, paddingTop: spacing.xl, borderTopWidth: 1 },
    input: { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontSize: 14, minHeight: 44 },
    summary: { marginTop: spacing.xl, paddingTop: spacing.lg, borderTopWidth: 1 },
    summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xs },
    bottomBar: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderTopWidth: 1 },
    submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, paddingVertical: spacing.lg, borderRadius: radius.lg },
    submitText: { fontSize: 15, fontWeight: "600" },
})
