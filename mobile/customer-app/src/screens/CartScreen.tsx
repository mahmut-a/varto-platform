import React, { useState } from "react"
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
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { spacing, radius, shadow } from "../theme/tokens"
import { createOrder } from "../api/client"
import { useCart } from "../context/CartContext"
import { useTheme } from "../context/ThemeContext"

export default function CartScreen({ navigation, customer }: any) {
    const { colors: c, typography: t } = useTheme()
    const { cart, updateQuantity, clearVendor, clearAll } = useCart()

    const [address, setAddress] = useState(customer?.address || "")
    const [notes, setNotes] = useState("")
    const [phone, setPhone] = useState(customer?.phone || "")
    const [submitting, setSubmitting] = useState(false)

    const vendors = Object.entries(cart)
    const isEmpty = vendors.length === 0

    const grandTotal = vendors.reduce((sum, [, vc]) =>
        sum + vc.items.reduce((s, i) => s + i.unit_price * i.quantity, 0), 0)
    const deliveryFee = 15
    const totalDeliveryFees = vendors.length * deliveryFee

    const handleSubmit = async () => {
        if (isEmpty) { Alert.alert("Hata", "Sepetiniz boş."); return }
        if (!address.trim()) { Alert.alert("Hata", "Teslimat adresi zorunludur."); return }
        if (!phone.trim()) { Alert.alert("Hata", "Telefon numarası zorunludur."); return }

        setSubmitting(true)
        try {
            const results: { vendorName: string; orderId: string }[] = []
            const errors: string[] = []

            // Create one order per vendor
            for (const [vendorId, vc] of vendors) {
                try {
                    const order = await createOrder({
                        vendor_id: vendorId,
                        customer_id: customer?.id || null,
                        customer_name: customer?.name || null,
                        customer_phone: customer?.phone || phone,
                        delivery_address: { address, phone },
                        delivery_notes: notes || null,
                        delivery_fee: deliveryFee,
                        payment_method: "iban",
                        iban_info: vc.vendor.iban,
                        items: vc.items.map((i) => ({
                            product_name: i.product_name,
                            quantity: i.quantity,
                            unit_price: i.unit_price,
                        })),
                    })
                    results.push({ vendorName: vc.vendor.name, orderId: order.id })
                    clearVendor(vendorId)
                } catch (e: any) {
                    errors.push(`${vc.vendor.name}: ${e?.response?.data?.message || "Hata"}`)
                }
            }

            if (results.length > 0) {
                const msg = results.map(r => `• ${r.vendorName} — #${r.orderId.slice(-6)}`).join("\n")
                Alert.alert(
                    `${results.length} Sipariş Verildi! ✅`,
                    msg + (errors.length > 0 ? `\n\nHatalar:\n${errors.join("\n")}` : ""),
                    [
                        { text: "Takip Et", onPress: () => navigation.navigate("OrdersTab", { screen: "OrderTracking", params: { orderId: results[0].orderId } }) },
                        { text: "Tamam" },
                    ]
                )
            } else {
                Alert.alert("Sipariş Hatası", errors.join("\n"))
            }
        } catch (e: any) {
            Alert.alert("Sipariş Hatası", "Bir hata oluştu. Lütfen tekrar deneyin.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <KeyboardAvoidingView style={[styles.container, { backgroundColor: c.bg.base }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {isEmpty ? (
                    <View style={styles.empty}>
                        <Ionicons name="bag-outline" size={56} color={c.fg.disabled} />
                        <Text style={[t.body, { marginTop: spacing.lg, textAlign: "center" }]}>Sepetiniz boş</Text>
                        <Text style={[t.small, { textAlign: "center", marginTop: spacing.xs }]}>İşletme sayfasından ürün ekleyin</Text>
                    </View>
                ) : (
                    <>
                        <Text style={[t.h2, { marginBottom: spacing.md }]}>Sepetiniz</Text>

                        {/* Vendor groups */}
                        {vendors.map(([vendorId, vc]) => {
                            const vendorTotal = vc.items.reduce((s, i) => s + i.unit_price * i.quantity, 0)
                            return (
                                <View key={vendorId} style={{ marginBottom: spacing.xl }}>
                                    {/* Vendor header */}
                                    <View style={[styles.vendorBar, { backgroundColor: c.bg.subtle, borderColor: c.border.base }]}>
                                        <Ionicons name="storefront-outline" size={18} color={c.interactive} />
                                        <Text style={[t.h3, { marginLeft: spacing.sm, flex: 1 }]}>{vc.vendor.name}</Text>
                                        <TouchableOpacity onPress={() => {
                                            Alert.alert("Temizle", `${vc.vendor.name} sepetini temizlemek istiyor musunuz?`, [
                                                { text: "İptal", style: "cancel" },
                                                { text: "Temizle", style: "destructive", onPress: () => clearVendor(vendorId) },
                                            ])
                                        }}>
                                            <Ionicons name="trash-outline" size={18} color={c.tag.red.fg} />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Items */}
                                    {vc.items.map((item, idx) => (
                                        <View key={idx} style={[styles.itemCard, { backgroundColor: c.bg.component, borderColor: c.border.base }]}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[t.h3]}>{item.product_name}</Text>
                                                <Text style={[t.price, { marginTop: 2 }]}>₺{item.unit_price.toFixed(2)}</Text>
                                            </View>
                                            <View style={styles.qtyRow}>
                                                <TouchableOpacity style={[styles.qtyBtn, { backgroundColor: c.bg.field }]} onPress={() => updateQuantity(vendorId, item.product_name, -1)}>
                                                    <Ionicons name="remove" size={16} color={c.fg.subtle} />
                                                </TouchableOpacity>
                                                <Text style={[t.h3, { minWidth: 28, textAlign: "center" }]}>{item.quantity}</Text>
                                                <TouchableOpacity style={[styles.qtyBtn, { backgroundColor: c.bg.field }]} onPress={() => updateQuantity(vendorId, item.product_name, 1)}>
                                                    <Ionicons name="add" size={16} color={c.fg.subtle} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ))}

                                    {/* Vendor subtotal */}
                                    <View style={[styles.vendorSubtotal, { borderTopColor: c.border.base }]}>
                                        <Text style={[t.label]}>Ara toplam</Text>
                                        <Text style={[t.label, { color: c.fg.base }]}>₺{vendorTotal.toFixed(2)}</Text>
                                    </View>
                                </View>
                            )
                        })}

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
                                <Text style={[t.body]}>Ürünler Toplamı</Text>
                                <Text style={[t.body]}>₺{grandTotal.toFixed(2)}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={[t.body]}>Teslimat ({vendors.length} satıcı × ₺{deliveryFee})</Text>
                                <Text style={[t.body]}>₺{totalDeliveryFees}</Text>
                            </View>
                            <View style={[styles.summaryRow, { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: c.border.base }]}>
                                <Text style={[t.h2]}>Toplam</Text>
                                <Text style={[t.h2, { color: c.interactive }]}>₺{(grandTotal + totalDeliveryFees).toFixed(2)}</Text>
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>

            {!isEmpty && (
                <View style={[styles.bottomBar, { backgroundColor: c.bg.component, borderTopColor: c.border.base }]}>
                    <TouchableOpacity
                        style={[styles.submitBtn, { backgroundColor: c.interactive, opacity: submitting ? 0.5 : 1 }]}
                        onPress={handleSubmit}
                        disabled={submitting}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="checkmark-circle-outline" size={20} color={c.fg.on_color} />
                        <Text style={[styles.submitText, { color: c.fg.on_color }]}>
                            {submitting ? "Gönderiliyor..." : `Sipariş Ver — ₺${(grandTotal + totalDeliveryFees).toFixed(2)}`}
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
    vendorBar: { flexDirection: "row", alignItems: "center", padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, marginBottom: spacing.md },
    empty: { alignItems: "center", paddingTop: 80 },
    itemCard: { flexDirection: "row", alignItems: "center", padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, marginBottom: spacing.md },
    qtyRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    qtyBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
    vendorSubtotal: { flexDirection: "row", justifyContent: "space-between", paddingTop: spacing.sm, borderTopWidth: 1, marginTop: spacing.xs },
    formSection: { marginTop: spacing.xl, paddingTop: spacing.xl, borderTopWidth: 1 },
    input: { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontSize: 14, minHeight: 44 },
    summary: { marginTop: spacing.xl, paddingTop: spacing.lg, borderTopWidth: 1 },
    summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xs },
    bottomBar: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderTopWidth: 1 },
    submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, paddingVertical: spacing.lg, borderRadius: radius.lg },
    submitText: { fontSize: 15, fontWeight: "600" },
})
