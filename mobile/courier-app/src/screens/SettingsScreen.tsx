import React, { useState } from "react"
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Switch, Alert, ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { colors, spacing, radius, typography } from "../theme/tokens"
import { updateCourier } from "../api/client"

interface Props {
    courier: any
    onLogout: () => void
    onCourierUpdate: (c: any) => void
}

export default function SettingsScreen({ courier, onLogout, onCourierUpdate }: Props) {
    const [isAvailable, setIsAvailable] = useState(courier?.is_available ?? true)
    const [saving, setSaving] = useState(false)

    const vehicleLabels: Record<string, string> = {
        motorcycle: "🏍️ Motosiklet",
        bicycle: "🚲 Bisiklet",
        car: "🚗 Araba",
        on_foot: "🚶 Yaya",
    }

    const toggleAvailability = async (value: boolean) => {
        setIsAvailable(value)
        setSaving(true)
        try {
            const updated = await updateCourier(courier.id, { is_available: value })
            onCourierUpdate({ ...courier, is_available: value })
        } catch (err) {
            setIsAvailable(!value) // geri al
            Alert.alert("Hata", "Durum güncellenemedi")
        } finally {
            setSaving(false)
        }
    }

    const handleLogout = () => {
        Alert.alert("Çıkış", "Çıkış yapmak istediğinize emin misiniz?", [
            { text: "Vazgeç", style: "cancel" },
            { text: "Çıkış Yap", style: "destructive", onPress: onLogout },
        ])
    }

    return (
        <SafeAreaView style={s.container} edges={["top"]}>
            <View style={s.header}>
                <Text style={s.headerTitle}>Ayarlar</Text>
            </View>

            <ScrollView contentContainerStyle={s.scroll}>
                {/* Profil Kartı */}
                <View style={s.profileCard}>
                    <View style={s.avatarLarge}>
                        <Ionicons name="person" size={32} color={colors.interactive} />
                    </View>
                    <Text style={s.profileName}>{courier?.name || "Kurye"}</Text>
                    <Text style={s.profileEmail}>{courier?.email || "—"}</Text>
                    <View style={[s.vehicleBadge]}>
                        <Text style={s.vehicleText}>
                            {vehicleLabels[courier?.vehicle_type] || courier?.vehicle_type || "—"}
                        </Text>
                    </View>
                </View>

                {/* Bilgiler */}
                <View style={s.card}>
                    <Text style={s.cardTitle}>Kurye Bilgileri</Text>
                    <SettingRow icon="call-outline" label="Telefon" value={courier?.phone || "—"} />
                    <SettingRow icon="mail-outline" label="Email" value={courier?.email || "—"} />
                    <SettingRow
                        icon="shield-checkmark-outline"
                        label="Durum"
                        value={courier?.is_active ? "Aktif" : "Deaktif"}
                        valueColor={courier?.is_active ? colors.tag.green.fg : colors.tag.red.fg}
                    />
                </View>

                {/* Müsaitlik Toggle */}
                <View style={s.card}>
                    <Text style={s.cardTitle}>Müsaitlik</Text>
                    <View style={s.toggleRow}>
                        <View style={s.toggleLeft}>
                            <Ionicons
                                name={isAvailable ? "radio-button-on" : "radio-button-off"}
                                size={20}
                                color={isAvailable ? colors.tag.green.fg : colors.fg.muted}
                            />
                            <View>
                                <Text style={s.toggleLabel}>
                                    {isAvailable ? "Müsait — Teslimat alabilirsiniz" : "Meşgul — Teslimat almıyorsunuz"}
                                </Text>
                                <Text style={s.toggleSub}>
                                    {isAvailable ? "Yeni teslimat bildirimleri alacaksınız" : "Bildirimler duraklatıldı"}
                                </Text>
                            </View>
                        </View>
                        {saving ? (
                            <ActivityIndicator size="small" color={colors.interactive} />
                        ) : (
                            <Switch
                                value={isAvailable}
                                onValueChange={toggleAvailability}
                                trackColor={{ false: colors.border.base, true: "#BBF7D0" }}
                                thumbColor={isAvailable ? colors.tag.green.fg : colors.fg.muted}
                            />
                        )}
                    </View>
                </View>

                {/* Uygulama Bilgisi */}
                <View style={s.card}>
                    <Text style={s.cardTitle}>Uygulama</Text>
                    <SettingRow icon="information-circle-outline" label="Versiyon" value="1.0.0" />
                    <SettingRow icon="server-outline" label="Sunucu" value="api.vartoyazilim.com" />
                </View>

                {/* Çıkış */}
                <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                    <Ionicons name="log-out-outline" size={18} color={colors.tag.red.fg} />
                    <Text style={s.logoutText}>Çıkış Yap</Text>
                </TouchableOpacity>

                <Text style={s.footer}>Varto Yazılım © 2026</Text>
            </ScrollView>
        </SafeAreaView>
    )
}

function SettingRow({ icon, label, value, valueColor }: {
    icon: any; label: string; value: string; valueColor?: string
}) {
    return (
        <View style={s.settingRow}>
            <Ionicons name={icon} size={18} color={colors.fg.muted} />
            <Text style={s.settingLabel}>{label}</Text>
            <Text style={[s.settingValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
        </View>
    )
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg.subtle },
    header: {
        flexDirection: "row", alignItems: "center", justifyContent: "center",
        paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
        backgroundColor: colors.bg.base,
        borderBottomWidth: 1, borderBottomColor: colors.border.base,
    },
    headerTitle: { ...typography.h2 },
    scroll: { padding: spacing.lg, paddingBottom: 100 },
    profileCard: {
        backgroundColor: colors.bg.base, borderRadius: radius.lg,
        padding: spacing.xxl, marginBottom: spacing.md,
        alignItems: "center",
        borderWidth: 1, borderColor: colors.border.base,
    },
    avatarLarge: {
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: "#EFF6FF",
        justifyContent: "center", alignItems: "center",
        marginBottom: spacing.md,
    },
    profileName: { ...typography.h1, fontSize: 20, marginBottom: spacing.xs },
    profileEmail: { ...typography.body, color: colors.fg.muted, marginBottom: spacing.sm },
    vehicleBadge: {
        backgroundColor: colors.bg.field,
        paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
        borderRadius: radius.md,
    },
    vehicleText: { ...typography.label },
    card: {
        backgroundColor: colors.bg.base, borderRadius: radius.lg,
        padding: spacing.lg, marginBottom: spacing.md,
        borderWidth: 1, borderColor: colors.border.base,
    },
    cardTitle: { ...typography.h3, marginBottom: spacing.md },
    settingRow: {
        flexDirection: "row", alignItems: "center", gap: spacing.sm,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1, borderBottomColor: colors.border.base,
    },
    settingLabel: { ...typography.body, flex: 1, color: colors.fg.muted },
    settingValue: { ...typography.body, color: colors.fg.base, fontWeight: "500" },
    toggleRow: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    },
    toggleLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flex: 1 },
    toggleLabel: { ...typography.body, color: colors.fg.base, fontWeight: "500" },
    toggleSub: { ...typography.caption, marginTop: 2 },
    logoutBtn: {
        flexDirection: "row", alignItems: "center", justifyContent: "center",
        gap: spacing.sm, backgroundColor: colors.tag.red.bg,
        borderRadius: radius.md, height: 48, marginTop: spacing.md,
    },
    logoutText: { fontSize: 14, fontWeight: "600", color: colors.tag.red.fg },
    footer: { ...typography.caption, textAlign: "center", marginTop: spacing.xxl },
})
