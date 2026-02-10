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
import { getListings, updateListing } from "../api/client"

const STATUS_MAP: Record<string, { label: string; tag: keyof typeof colors.tag }> = {
    pending: { label: "Bekliyor", tag: "orange" },
    approved: { label: "Onaylı", tag: "green" },
    rejected: { label: "Reddedildi", tag: "red" },
    expired: { label: "Süresi Doldu", tag: "neutral" },
}

const CATEGORY_MAP: Record<string, string> = {
    rental: "Kiralık",
    sale: "Satılık",
    job: "İş İlanı",
    service: "Hizmet",
    other: "Diğer",
}

export default function ListingsScreen() {
    const [listings, setListings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchListings = async () => {
        try {
            const data = await getListings()
            setListings(data || [])
        } catch { } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => { fetchListings() }, [])

    const handleApprove = async (id: string) => {
        try {
            await updateListing(id, { status: "approved" })
            setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status: "approved" } : l)))
        } catch {
            Alert.alert("Hata", "Onaylama başarısız.")
        }
    }

    const handleReject = async (id: string) => {
        try {
            await updateListing(id, { status: "rejected" })
            setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status: "rejected" } : l)))
        } catch {
            Alert.alert("Hata", "Reddetme başarısız.")
        }
    }

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="small" color={colors.fg.muted} /></View>
    }

    return (
        <FlatList
            style={styles.container}
            data={listings}
            keyExtractor={(item) => item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchListings() }} tintColor={colors.fg.muted} />}
            contentContainerStyle={{ padding: spacing.xl }}
            ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
            renderItem={({ item }) => {
                const status = STATUS_MAP[item.status] || { label: item.status, tag: "neutral" as const }
                const tagColors = colors.tag[status.tag]

                return (
                    <View style={styles.card}>
                        <View style={styles.cardRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.title}>{item.title}</Text>
                                <Text style={styles.meta}>{CATEGORY_MAP[item.category] || item.category}</Text>
                            </View>
                            <View style={[styles.tag, { backgroundColor: tagColors.bg }]}>
                                <Text style={[styles.tagText, { color: tagColors.fg }]}>{status.label}</Text>
                            </View>
                        </View>

                        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

                        <View style={styles.metaRow}>
                            {item.price != null && (
                                <Text style={styles.price}>₺{Number(item.price).toLocaleString("tr-TR")}</Text>
                            )}
                            {item.location && <Text style={styles.location}>{item.location}</Text>}
                        </View>

                        <View style={styles.contactRow}>
                            <Ionicons name="person-outline" size={13} color={colors.fg.muted} />
                            <Text style={styles.contactText}>{item.contact_name} · {item.contact_phone}</Text>
                        </View>

                        {item.status === "pending" && (
                            <View style={styles.actions}>
                                <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(item.id)} activeOpacity={0.7}>
                                    <Text style={styles.approveBtnText}>Onayla</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(item.id)} activeOpacity={0.7}>
                                    <Text style={styles.rejectBtnText}>Reddet</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )
            }}
            ListEmptyComponent={
                <View style={styles.empty}><Text style={styles.emptyText}>Henüz ilan yok</Text></View>
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
    cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.sm },
    title: { ...typography.h3 },
    meta: { ...typography.small, marginTop: 2 },
    tag: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm },
    tagText: { fontSize: 12, fontWeight: "500" },
    description: { ...typography.body, marginBottom: spacing.md },
    metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
    price: { fontSize: 16, fontWeight: "600", color: colors.fg.base },
    location: { ...typography.small },
    contactRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: spacing.sm },
    contactText: { ...typography.small },
    actions: {
        flexDirection: "row",
        gap: spacing.sm,
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border.base,
    },
    approveBtn: {
        flex: 1,
        backgroundColor: colors.interactive,
        paddingVertical: spacing.sm + 2,
        borderRadius: radius.md,
        alignItems: "center",
    },
    approveBtnText: { color: colors.fg.on_color, fontSize: 13, fontWeight: "500" },
    rejectBtn: {
        flex: 1,
        backgroundColor: colors.bg.field,
        paddingVertical: spacing.sm + 2,
        borderRadius: radius.md,
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border.base,
    },
    rejectBtnText: { color: colors.fg.subtle, fontSize: 13, fontWeight: "500" },
    empty: { alignItems: "center", paddingTop: 60 },
    emptyText: { ...typography.body },
})
