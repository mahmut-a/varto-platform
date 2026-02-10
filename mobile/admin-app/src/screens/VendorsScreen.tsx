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
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { colors, spacing, radius, typography } from "../theme/tokens"
import { getVendors, deleteVendor } from "../api/client"

const CATEGORY_MAP: Record<string, string> = {
    restaurant: "Restoran",
    market: "Market",
    pharmacy: "Eczane",
    stationery: "Kırtasiye",
    barber: "Berber",
    other: "Diğer",
}

export default function VendorsScreen() {
    const [vendors, setVendors] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchVendors = async () => {
        try {
            const data = await getVendors()
            setVendors(data || [])
        } catch { } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => { fetchVendors() }, [])

    const handleDelete = (id: string, name: string) => {
        Alert.alert("Sil", `"${name}" silinecek. Emin misiniz?`, [
            { text: "İptal", style: "cancel" },
            {
                text: "Sil",
                style: "destructive",
                onPress: async () => {
                    try {
                        await deleteVendor(id)
                        setVendors((prev) => prev.filter((v) => v.id !== id))
                    } catch {
                        Alert.alert("Hata", "Silme başarısız oldu.")
                    }
                },
            },
        ])
    }

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="small" color={colors.fg.muted} /></View>
    }

    return (
        <FlatList
            style={styles.container}
            data={vendors}
            keyExtractor={(item) => item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchVendors() }} tintColor={colors.fg.muted} />}
            contentContainerStyle={{ padding: spacing.xl }}
            ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
            renderItem={({ item }) => (
                <View style={styles.card}>
                    <View style={styles.cardRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.meta}>{CATEGORY_MAP[item.category] || item.category}</Text>
                        </View>
                        <View style={[styles.tag, item.is_active ? styles.tagGreen : styles.tagRed]}>
                            <Text style={[styles.tagText, { color: item.is_active ? colors.tag.green.fg : colors.tag.red.fg }]}>
                                {item.is_active ? "Aktif" : "Pasif"}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="call-outline" size={14} color={colors.fg.muted} />
                        <Text style={styles.detail}>{item.phone}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={14} color={colors.fg.muted} />
                        <Text style={styles.detail} numberOfLines={1}>{item.address}</Text>
                    </View>

                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id, item.name)}>
                        <Ionicons name="trash-outline" size={14} color={colors.tag.red.fg} />
                        <Text style={styles.deleteText}>Sil</Text>
                    </TouchableOpacity>
                </View>
            )}
            ListEmptyComponent={
                <View style={styles.empty}>
                    <Text style={styles.emptyText}>Henüz işletme yok</Text>
                </View>
            }
        />
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg.base },
    center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg.base },
    card: {
        backgroundColor: colors.bg.base,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border.base,
        padding: spacing.lg,
    },
    cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.md },
    name: { ...typography.h3 },
    meta: { ...typography.small, marginTop: 2 },
    tag: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm },
    tagGreen: { backgroundColor: colors.tag.green.bg },
    tagRed: { backgroundColor: colors.tag.red.bg },
    tagText: { fontSize: 12, fontWeight: "500" },
    detailRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: 4 },
    detail: { ...typography.small, flex: 1 },
    deleteBtn: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-end", marginTop: spacing.sm, paddingVertical: 4 },
    deleteText: { fontSize: 13, color: colors.tag.red.fg, fontWeight: "500" },
    empty: { alignItems: "center", paddingTop: 60 },
    emptyText: { ...typography.body },
})
