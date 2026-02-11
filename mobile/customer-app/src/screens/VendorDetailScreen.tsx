import React, { useEffect, useState } from "react"
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    useColorScheme,
    ActivityIndicator,
    RefreshControl,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { getColors, getTypography, spacing, radius, shadow } from "../theme/tokens"
import { getVendorProducts } from "../api/client"

const CATEGORY_MAP: Record<string, { label: string; icon: string }> = {
    restaurant: { label: "Restoran", icon: "restaurant-outline" },
    market: { label: "Market", icon: "cart-outline" },
    pharmacy: { label: "Eczane", icon: "medkit-outline" },
    stationery: { label: "Kırtasiye", icon: "pencil-outline" },
    barber: { label: "Berber", icon: "cut-outline" },
    other: { label: "Diğer", icon: "ellipsis-horizontal-outline" },
}

export default function VendorDetailScreen({ route, navigation }: any) {
    const c = getColors()
    const t = getTypography()
    const vendor = route.params?.vendor

    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    if (!vendor) return null

    const cat = CATEGORY_MAP[vendor.category] || CATEGORY_MAP.other

    const loadProducts = async () => {
        try {
            const data = await getVendorProducts(vendor.id)
            setProducts(data || [])
        } catch (err) {
            console.log("Ürün yükleme hatası:", err)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        loadProducts()
    }, [vendor.id])

    const onRefresh = () => {
        setRefreshing(true)
        loadProducts()
    }

    const addToCart = (product: any) => {
        navigation.navigate("CartTab", {
            screen: "Cart",
            params: {
                addItem: {
                    product_name: product.name,
                    unit_price: Number(product.price) || 0,
                    quantity: 1,
                    notes: "",
                },
                vendor,
            },
        })
    }

    // Ürünleri kategoriye göre grupla
    const grouped = products.reduce((acc: any, p: any) => {
        const cat = p.category || "Diğer"
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(p)
        return acc
    }, {})

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: c.bg.base }]}
            contentContainerStyle={{ paddingBottom: spacing.xxxl }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.interactive} />}
        >
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

                {loading ? (
                    <ActivityIndicator size="large" color={c.interactive} style={{ marginTop: spacing.xl }} />
                ) : products.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="fast-food-outline" size={48} color={c.fg.muted} />
                        <Text style={[t.body, { color: c.fg.muted, marginTop: spacing.md, textAlign: "center" }]}>
                            Bu işletmenin henüz menüsü eklenmemiş.
                        </Text>
                    </View>
                ) : (
                    Object.entries(grouped).map(([category, items]: [string, any]) => (
                        <View key={category} style={{ marginBottom: spacing.lg }}>
                            <Text style={[t.h3, { marginBottom: spacing.sm, color: c.fg.muted, textTransform: "capitalize" }]}>
                                {category}
                            </Text>
                            {items.map((p: any) => (
                                <View key={p.id} style={[styles.menuCard, { backgroundColor: c.bg.component, borderColor: c.border.base }, shadow.sm]}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[t.h3]}>{p.name}</Text>
                                        {p.description ? (
                                            <Text style={[t.small, { marginTop: 2 }]}>{p.description}</Text>
                                        ) : null}
                                        <Text style={[t.price, { marginTop: spacing.xs }]}>₺{Number(p.price).toFixed(2)}</Text>
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
                    ))
                )}
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
    emptyState: { alignItems: "center", paddingVertical: spacing.xxxl },
})
