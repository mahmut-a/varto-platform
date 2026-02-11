import React from "react"
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    useColorScheme,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { getColors, getTypography, spacing, radius, shadow } from "../theme/tokens"

const CATEGORY_MAP: Record<string, { label: string; icon: string }> = {
    restaurant: { label: "Restoran", icon: "restaurant-outline" },
    market: { label: "Market", icon: "cart-outline" },
    pharmacy: { label: "Eczane", icon: "medkit-outline" },
    stationery: { label: "Kırtasiye", icon: "pencil-outline" },
    barber: { label: "Berber", icon: "cut-outline" },
    other: { label: "Diğer", icon: "ellipsis-horizontal-outline" },
}

// Placeholder menu items — in production these come from a product catalog
const SAMPLE_PRODUCTS = [
    { id: "1", name: "Klasik Menü", price: 120, desc: "Ana yemek + içecek + tatlı" },
    { id: "2", name: "Özel Menü", price: 180, desc: "Seçkin ana yemek + salata + tatlı" },
    { id: "3", name: "Ekonomik Menü", price: 85, desc: "Günün yemeği + içecek" },
    { id: "4", name: "Ekstra İçecek", price: 25, desc: "Soğuk / sıcak içecek" },
]

export default function VendorDetailScreen({ route, navigation }: any) {
    const scheme = useColorScheme()
    const c = getColors()
    const t = getTypography()
    const vendor = route.params?.vendor

    if (!vendor) return null

    const cat = CATEGORY_MAP[vendor.category] || CATEGORY_MAP.other

    const addToCart = (product: any) => {
        navigation.navigate("CartTab", {
            screen: "Cart",
            params: {
                addItem: {
                    product_name: product.name,
                    unit_price: product.price,
                    quantity: 1,
                    notes: "",
                },
                vendor,
            },
        })
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: c.bg.base }]} contentContainerStyle={{ paddingBottom: spacing.xxxl }}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: c.bg.subtle, borderBottomColor: c.border.base }]}>
                <View style={[styles.iconCircle, { backgroundColor: c.bg.field }]}>
                    <Ionicons name={cat.icon as any} size={40} color={c.interactive} />
                </View>
                <Text style={[t.h1, { marginTop: spacing.md, textAlign: "center" }]}>{vendor.name}</Text>
                <View style={[styles.catBadge, { backgroundColor: c.interactive + "18" }]}>
                    <Text style={{ fontSize: 12, fontWeight: "500", color: c.interactive }}>{cat.label}</Text>
                </View>
            </View>

            {/* Info */}
            <View style={[styles.section, { borderBottomColor: c.border.base }]}>
                <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={16} color={c.fg.muted} />
                    <Text style={[t.body, { marginLeft: spacing.sm, flex: 1 }]}>{vendor.address}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={16} color={c.fg.muted} />
                    <Text style={[t.body, { marginLeft: spacing.sm }]}>{vendor.phone}</Text>
                </View>
                {vendor.description ? (
                    <View style={styles.infoRow}>
                        <Ionicons name="information-circle-outline" size={16} color={c.fg.muted} />
                        <Text style={[t.body, { marginLeft: spacing.sm, flex: 1 }]}>{vendor.description}</Text>
                    </View>
                ) : null}
            </View>

            {/* Menu */}
            <View style={styles.menuSection}>
                <Text style={[t.h2, { marginBottom: spacing.lg }]}>Menü</Text>
                {SAMPLE_PRODUCTS.map((p) => (
                    <View key={p.id} style={[styles.menuCard, { backgroundColor: c.bg.component, borderColor: c.border.base }, shadow.sm]}>
                        <View style={{ flex: 1 }}>
                            <Text style={[t.h3]}>{p.name}</Text>
                            <Text style={[t.small, { marginTop: 2 }]}>{p.desc}</Text>
                            <Text style={[t.price, { marginTop: spacing.xs }]}>₺{p.price}</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.addBtn, { backgroundColor: c.interactive }]}
                            onPress={() => addToCart(p)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="add" size={20} color={c.fg.on_color} />
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { alignItems: "center", paddingVertical: spacing.xxxl, paddingHorizontal: spacing.xl, borderBottomWidth: 1 },
    iconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center" },
    catBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, marginTop: spacing.sm },
    section: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderBottomWidth: 1, gap: spacing.md },
    infoRow: { flexDirection: "row", alignItems: "flex-start" },
    menuSection: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
    menuCard: { flexDirection: "row", alignItems: "center", padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, marginBottom: spacing.md },
    addBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
})
