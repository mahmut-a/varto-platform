import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { colors, spacing, radius, typography } from "../theme/tokens"
import { getCouriers } from "../api/client"

const VEHICLE_MAP: Record<string, string> = {
    motorcycle: "Motosiklet",
    bicycle: "Bisiklet",
    car: "Araba",
    on_foot: "Yaya",
}

export default function CouriersScreen() {
    const [couriers, setCouriers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchCouriers = async () => {
        try {
            const data = await getCouriers()
            setCouriers(data || [])
        } catch { } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => { fetchCouriers() }, [])

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="small" color={colors.fg.muted} /></View>
    }

    return (
        <FlatList
            style={styles.container}
            data={couriers}
            keyExtractor={(item) => item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCouriers() }} tintColor={colors.fg.muted} />}
            contentContainerStyle={{ padding: spacing.xl }}
            ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
            renderItem={({ item }) => (
                <View style={styles.card}>
                    <View style={styles.cardRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.meta}>{VEHICLE_MAP[item.vehicle_type] || item.vehicle_type}</Text>
                        </View>
                        <View style={styles.tags}>
                            <View style={[styles.tag, item.is_active ? styles.tagGreen : styles.tagRed]}>
                                <Text style={[styles.tagText, { color: item.is_active ? colors.tag.green.fg : colors.tag.red.fg }]}>
                                    {item.is_active ? "Aktif" : "Pasif"}
                                </Text>
                            </View>
                            <View style={[styles.tag, item.is_available ? styles.tagBlue : styles.tagNeutral]}>
                                <Text style={[styles.tagText, { color: item.is_available ? colors.tag.blue.fg : colors.fg.muted }]}>
                                    {item.is_available ? "Müsait" : "Meşgul"}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="call-outline" size={14} color={colors.fg.muted} />
                        <Text style={styles.detail}>{item.phone}</Text>
                    </View>
                    {item.email && (
                        <View style={styles.detailRow}>
                            <Ionicons name="mail-outline" size={14} color={colors.fg.muted} />
                            <Text style={styles.detail}>{item.email}</Text>
                        </View>
                    )}
                </View>
            )}
            ListEmptyComponent={
                <View style={styles.empty}><Text style={styles.emptyText}>Henüz kurye yok</Text></View>
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
    tags: { flexDirection: "row", gap: spacing.xs },
    tag: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm },
    tagGreen: { backgroundColor: colors.tag.green.bg },
    tagRed: { backgroundColor: colors.tag.red.bg },
    tagBlue: { backgroundColor: colors.tag.blue.bg },
    tagNeutral: { backgroundColor: colors.tag.neutral.bg },
    tagText: { fontSize: 12, fontWeight: "500" },
    detailRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: 4 },
    detail: { ...typography.small },
    empty: { alignItems: "center", paddingTop: 60 },
    emptyText: { ...typography.body },
})
