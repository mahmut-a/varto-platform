import React, { useState, useEffect, useCallback } from "react"
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    useColorScheme,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { getColors, getTypography, spacing, radius, shadow } from "../theme/tokens"
import { getListings } from "../api/client"

const CATEGORY_MAP: Record<string, string> = {
    rental: "Kiralık",
    sale: "Satılık",
    job: "İş İlanı",
    service: "Hizmet",
    other: "Diğer",
}

export default function ListingsScreen() {
    const c = getColors()
    const t = getTypography()

    const [listings, setListings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchListings = useCallback(async () => {
        try { const data = await getListings(); setListings(data || []) }
        catch { } finally { setLoading(false); setRefreshing(false) }
    }, [])

    useEffect(() => { fetchListings() }, [fetchListings])

    if (loading) return <View style={[styles.center, { backgroundColor: c.bg.base }]}><ActivityIndicator color={c.fg.muted} /></View>

    return (
        <View style={[styles.container, { backgroundColor: c.bg.base }]}>
            <FlatList
                data={listings}
                keyExtractor={(item) => item.id}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchListings() }} tintColor={c.fg.muted} />}
                contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxxl }}
                ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
                renderItem={({ item }) => (
                    <View style={[styles.card, { backgroundColor: c.bg.component, borderColor: c.border.base }, shadow.sm]}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.catBadge, { backgroundColor: c.tag.blue.bg }]}>
                                <Text style={{ fontSize: 11, fontWeight: "500", color: c.tag.blue.fg }}>
                                    {CATEGORY_MAP[item.category] || item.category}
                                </Text>
                            </View>
                            {item.price != null && (
                                <Text style={[t.price]}>₺{Number(item.price).toLocaleString("tr-TR")}</Text>
                            )}
                        </View>
                        <Text style={[t.h3, { marginTop: spacing.sm }]}>{item.title}</Text>
                        <Text style={[t.body, { marginTop: spacing.xs }]} numberOfLines={2}>{item.description}</Text>
                        <View style={[styles.cardFooter, { borderTopColor: c.border.base }]}>
                            <View style={styles.footerItem}>
                                <Ionicons name="location-outline" size={13} color={c.fg.muted} />
                                <Text style={[t.small, { marginLeft: 3 }]}>{item.location}</Text>
                            </View>
                            <View style={styles.footerItem}>
                                <Ionicons name="person-outline" size={13} color={c.fg.muted} />
                                <Text style={[t.small, { marginLeft: 3 }]}>{item.contact_name}</Text>
                            </View>
                            <View style={styles.footerItem}>
                                <Ionicons name="call-outline" size={13} color={c.fg.muted} />
                                <Text style={[t.small, { marginLeft: 3 }]}>{item.contact_phone}</Text>
                            </View>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="document-text-outline" size={48} color={c.fg.disabled} />
                        <Text style={[t.body, { marginTop: spacing.md }]}>Henüz ilan yok</Text>
                    </View>
                }
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    card: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1 },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    catBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm },
    cardFooter: { flexDirection: "row", flexWrap: "wrap", gap: spacing.lg, marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1 },
    footerItem: { flexDirection: "row", alignItems: "center" },
    empty: { alignItems: "center", paddingTop: 80 },
})
