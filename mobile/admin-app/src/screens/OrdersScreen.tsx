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
import { getVartoOrders } from "../api/client"

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

export default function OrdersScreen() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchOrders = async () => {
        try {
            const data = await getVartoOrders()
            setOrders(data || [])
        } catch { } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => { fetchOrders() }, [])

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="small" color={colors.fg.muted} /></View>
    }

    return (
        <FlatList
            style={styles.container}
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
                    <View style={styles.card}>
                        <View style={styles.cardRow}>
                            <Text style={styles.orderId}>#{item.id?.slice(-6).toUpperCase()}</Text>
                            <View style={[styles.tag, { backgroundColor: tagColors.bg }]}>
                                <Text style={[styles.tagText, { color: tagColors.fg }]}>{status.label}</Text>
                            </View>
                        </View>

                        <View style={styles.detailRow}>
                            <Ionicons name="location-outline" size={14} color={colors.fg.muted} />
                            <Text style={styles.detail} numberOfLines={1}>
                                {[address.neighborhood, address.street, address.building].filter(Boolean).join(", ")}
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
                    </View>
                )
            }}
            ListEmptyComponent={
                <View style={styles.empty}><Text style={styles.emptyText}>Henüz sipariş yok</Text></View>
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
    cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md },
    orderId: { ...typography.mono, fontWeight: "600" },
    tag: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm },
    tagText: { fontSize: 12, fontWeight: "500" },
    detailRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: 4 },
    detail: { ...typography.small, flex: 1 },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border.base,
    },
    footerText: { ...typography.small },
    empty: { alignItems: "center", paddingTop: 60 },
    emptyText: { ...typography.body },
})
