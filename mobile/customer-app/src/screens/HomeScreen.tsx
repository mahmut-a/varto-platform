import React, { useState, useEffect, useCallback } from "react"
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    TextInput,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { spacing, radius, shadow } from "../theme/tokens"
import { useTheme } from "../context/ThemeContext"
import { getVendors } from "../api/client"

const CATEGORY_MAP: Record<string, { label: string; icon: string }> = {
    restaurant: { label: "Restoran", icon: "restaurant-outline" },
    market: { label: "Market", icon: "cart-outline" },
    pharmacy: { label: "Eczane", icon: "medkit-outline" },
    stationery: { label: "Kırtasiye", icon: "pencil-outline" },
    barber: { label: "Berber", icon: "cut-outline" },
    other: { label: "Diğer", icon: "ellipsis-horizontal-outline" },
}

export default function HomeScreen({ navigation }: any) {
    const { colors: c, typography: t } = useTheme()

    const [vendors, setVendors] = useState<any[]>([])
    const [filtered, setFiltered] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [search, setSearch] = useState("")
    const [selectedCat, setSelectedCat] = useState<string | null>(null)

    const fetchVendors = useCallback(async () => {
        try {
            const data = await getVendors()
            setVendors(data || [])
        } catch { }
        finally { setLoading(false); setRefreshing(false) }
    }, [])

    useEffect(() => { fetchVendors() }, [fetchVendors])

    useEffect(() => {
        let list = vendors
        if (search.trim()) {
            const q = search.toLowerCase()
            list = list.filter((v: any) => v.name.toLowerCase().includes(q) || (v.address || "").toLowerCase().includes(q))
        }
        if (selectedCat) list = list.filter((v: any) => v.category === selectedCat)
        setFiltered(list)
    }, [vendors, search, selectedCat])

    if (loading) return <View style={[styles.center, { backgroundColor: c.bg.base }]}><ActivityIndicator color={c.fg.muted} /></View>

    return (
        <View style={[styles.container, { backgroundColor: c.bg.base }]}>
            {/* Search */}
            <View style={[styles.searchBar, { backgroundColor: c.bg.field, borderColor: c.border.base }]}>
                <Ionicons name="search-outline" size={18} color={c.fg.muted} />
                <TextInput
                    style={[styles.searchInput, { color: c.fg.base }]}
                    placeholder="İşletme ara..."
                    placeholderTextColor={c.fg.muted}
                    value={search}
                    onChangeText={setSearch}
                />
                {search ? (
                    <TouchableOpacity onPress={() => setSearch("")}>
                        <Ionicons name="close-circle" size={18} color={c.fg.muted} />
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* Category Filter */}
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={[{ value: null, label: "Tümü", icon: "grid-outline" }, ...Object.entries(CATEGORY_MAP).map(([value, v]) => ({ value, ...v }))]}
                keyExtractor={(item) => item.value || "all"}
                contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.md }}
                renderItem={({ item }) => {
                    const active = selectedCat === item.value
                    return (
                        <TouchableOpacity
                            style={[styles.chip, { backgroundColor: active ? c.interactive : c.bg.field, borderColor: active ? c.interactive : c.border.base }]}
                            onPress={() => setSelectedCat(item.value)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name={item.icon as any} size={14} color={active ? c.fg.on_color : c.fg.subtle} />
                            <Text style={[styles.chipText, { color: active ? c.fg.on_color : c.fg.subtle }]}>{item.label}</Text>
                        </TouchableOpacity>
                    )
                }}
                ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
            />

            {/* Vendor List */}
            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchVendors() }} tintColor={c.fg.muted} />}
                contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl }}
                ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
                renderItem={({ item }) => {
                    const cat = CATEGORY_MAP[item.category] || CATEGORY_MAP.other
                    return (
                        <TouchableOpacity
                            style={[styles.card, { backgroundColor: c.bg.component, borderColor: c.border.base }, shadow.sm]}
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate("VendorDetail", { vendor: item })}
                        >
                            <View style={[styles.cardIcon, { backgroundColor: c.bg.field }]}>
                                <Ionicons name={cat.icon as any} size={28} color={c.interactive} />
                            </View>
                            <View style={styles.cardBody}>
                                <Text style={[t.h3]} numberOfLines={1}>{item.name}</Text>
                                <View style={styles.cardMeta}>
                                    <Ionicons name="location-outline" size={12} color={c.fg.muted} />
                                    <Text style={[t.small, { marginLeft: 2, flex: 1 }]} numberOfLines={1}>{item.address}</Text>
                                </View>
                                <View style={[styles.catBadge, { backgroundColor: c.bg.field }]}>
                                    <Text style={[{ fontSize: 11, fontWeight: "500", color: c.fg.subtle }]}>{cat.label}</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={c.fg.muted} />
                        </TouchableOpacity>
                    )
                }}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="storefront-outline" size={48} color={c.fg.disabled} />
                        <Text style={[t.body, { marginTop: spacing.md, textAlign: "center" }]}>
                            {search || selectedCat ? "Sonuç bulunamadı" : "Henüz işletme yok"}
                        </Text>
                    </View>
                }
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    searchBar: { flexDirection: "row", alignItems: "center", marginHorizontal: spacing.xl, marginTop: spacing.md, marginBottom: spacing.md, paddingHorizontal: spacing.lg, borderRadius: radius.md, borderWidth: 1, height: 44 },
    searchInput: { flex: 1, marginLeft: spacing.sm, fontSize: 14 },
    chip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radius.full, borderWidth: 1 },
    chipText: { fontSize: 12, fontWeight: "500" },
    card: { flexDirection: "row", alignItems: "center", padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, gap: spacing.md },
    cardIcon: { width: 52, height: 52, borderRadius: radius.md, justifyContent: "center", alignItems: "center" },
    cardBody: { flex: 1, gap: 3 },
    cardMeta: { flexDirection: "row", alignItems: "center" },
    catBadge: { alignSelf: "flex-start", paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm, marginTop: 2 },
    empty: { alignItems: "center", paddingTop: 80 },
})
