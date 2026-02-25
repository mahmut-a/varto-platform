import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { spacing, radius } from "../theme/tokens"
import { getMe, updateProfile } from "../api/client"
import { useTheme, ThemeMode } from "../context/ThemeContext"

export default function ProfileScreen({ navigation, customer, onLogout, onUpdateCustomer }: {
    navigation: any
    customer: any
    onLogout: () => void
    onUpdateCustomer: (c: any) => void
}) {
    const { themeMode, setThemeMode, colors: c, typography: t } = useTheme()

    const [name, setName] = useState(customer?.name || "")
    const [email, setEmail] = useState(customer?.email || "")
    const [address, setAddress] = useState(customer?.address || "")
    const [saving, setSaving] = useState(false)
    const [edited, setEdited] = useState(false)

    useEffect(() => {
        setName(customer?.name || "")
        setEmail(customer?.email || "")
        setAddress(customer?.address || "")
    }, [customer])

    const handleSave = async () => {
        setSaving(true)
        try {
            const updated = await updateProfile({ name, email, address })
            onUpdateCustomer(updated)
            setEdited(false)
            Alert.alert("Başarılı", "Profil güncellendi")
        } catch (e: any) {
            Alert.alert("Hata", e?.response?.data?.message || "Güncelleme başarısız")
        } finally {
            setSaving(false)
        }
    }

    const field = (label: string, value: string, setter: (v: string) => void, icon: string, keyboard?: string) => (
        <View style={styles.fieldWrap} key={label}>
            <Text style={[t.label, { marginBottom: spacing.xs }]}>{label}</Text>
            <View style={[styles.fieldRow, { backgroundColor: c.bg.field, borderColor: c.border.base }]}>
                <Ionicons name={icon as any} size={18} color={c.fg.muted} />
                <TextInput
                    style={[styles.fieldInput, { color: c.fg.base }]}
                    value={value}
                    onChangeText={(text) => { setter(text); setEdited(true) }}
                    placeholder={label}
                    placeholderTextColor={c.fg.muted}
                    keyboardType={keyboard as any || "default"}
                    autoCapitalize={keyboard === "email-address" ? "none" : "words"}
                />
            </View>
        </View>
    )

    const themeModes: { mode: ThemeMode; label: string; icon: string }[] = [
        { mode: "system", label: "Sistem", icon: "phone-portrait-outline" },
        { mode: "light", label: "Açık", icon: "sunny-outline" },
        { mode: "dark", label: "Koyu", icon: "moon-outline" },
    ]

    const menuItem = (icon: string, label: string, onPress: () => void, color?: string) => (
        <TouchableOpacity
            key={label}
            style={[styles.menuRow, { borderColor: c.border.base }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Ionicons name={icon as any} size={20} color={color || c.fg.subtle} />
            <Text style={[t.h3, { flex: 1, marginLeft: spacing.md, color: color || c.fg.base }]}>{label}</Text>
            <Ionicons name="chevron-forward" size={16} color={c.fg.muted} />
        </TouchableOpacity>
    )

    return (
        <ScrollView style={[styles.container, { backgroundColor: c.bg.base }]} contentContainerStyle={styles.scrollContent}>
            {/* Avatar */}
            <View style={styles.avatarSection}>
                <View style={[styles.avatar, { backgroundColor: c.interactive + "15" }]}>
                    <Text style={{ fontSize: 32, fontWeight: "700", color: c.interactive }}>
                        {(customer?.name || customer?.phone || "?")[0].toUpperCase()}
                    </Text>
                </View>
                <Text style={[t.h2, { marginTop: spacing.md }]}>{customer?.name || "İsimsiz"}</Text>
                <Text style={[t.body, { marginTop: spacing.xs }]}>{customer?.phone}</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
                {field("Ad Soyad", name, setName, "person-outline")}
                {field("E-posta", email, setEmail, "mail-outline", "email-address")}
                {field("Adres", address, setAddress, "location-outline")}
            </View>

            {/* Phone (read-only) */}
            <View style={styles.fieldWrap}>
                <Text style={[t.label, { marginBottom: spacing.xs }]}>Telefon</Text>
                <View style={[styles.fieldRow, { backgroundColor: c.bg.subtle, borderColor: c.border.base }]}>
                    <Ionicons name="call-outline" size={18} color={c.fg.muted} />
                    <Text style={[styles.fieldInput, { color: c.fg.disabled }]}>{customer?.phone}</Text>
                    <Ionicons name="lock-closed-outline" size={14} color={c.fg.disabled} />
                </View>
            </View>

            {/* Save Button */}
            {edited && (
                <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: c.interactive, opacity: saving ? 0.5 : 1 }]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color={c.fg.on_color} size="small" />
                    ) : (
                        <Text style={[styles.saveBtnText, { color: c.fg.on_color }]}>Kaydet</Text>
                    )}
                </TouchableOpacity>
            )}

            {/* Theme Selection */}
            <View style={[styles.sectionHeader, { borderTopColor: c.border.base }]}>
                <Ionicons name="color-palette-outline" size={18} color={c.fg.subtle} />
                <Text style={[t.h3, { marginLeft: spacing.sm }]}>Tema</Text>
            </View>
            <View style={styles.themeRow}>
                {themeModes.map((tm) => {
                    const active = themeMode === tm.mode
                    return (
                        <TouchableOpacity
                            key={tm.mode}
                            style={[
                                styles.themeBtn,
                                {
                                    backgroundColor: active ? c.interactive : c.bg.field,
                                    borderColor: active ? c.interactive : c.border.base,
                                },
                            ]}
                            onPress={() => setThemeMode(tm.mode)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name={tm.icon as any} size={18} color={active ? c.fg.on_color : c.fg.subtle} />
                            <Text style={[styles.themeBtnText, { color: active ? c.fg.on_color : c.fg.subtle }]}>
                                {tm.label}
                            </Text>
                        </TouchableOpacity>
                    )
                })}
            </View>

            {/* Menu Links */}
            <View style={[styles.menuSection, { borderTopColor: c.border.base }]}>
                {menuItem("receipt-outline", "Sipariş Geçmişi", () => navigation.navigate("OrderHistory"))}
                {menuItem("heart-outline", "Favorilerim", () => navigation.navigate("Favorites"))}
            </View>

            {/* Logout */}
            <TouchableOpacity style={[styles.logoutBtn, { borderColor: c.border.base }]} onPress={onLogout}>
                <Ionicons name="log-out-outline" size={20} color={c.tag.red.fg} />
                <Text style={[styles.logoutText, { color: c.tag.red.fg }]}>Çıkış Yap</Text>
            </TouchableOpacity>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: spacing.xl, paddingBottom: 80 },
    avatarSection: { alignItems: "center", paddingVertical: spacing.xxl },
    avatar: { width: 72, height: 72, borderRadius: 36, justifyContent: "center", alignItems: "center" },
    form: { gap: spacing.md },
    fieldWrap: { marginBottom: spacing.md },
    fieldRow: { flexDirection: "row", alignItems: "center", borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.md, height: 48, gap: spacing.sm },
    fieldInput: { flex: 1, fontSize: 14, fontWeight: "500" },
    saveBtn: { paddingVertical: spacing.md, borderRadius: radius.md, alignItems: "center", marginTop: spacing.xl },
    saveBtnText: { fontSize: 15, fontWeight: "600" },
    sectionHeader: { flexDirection: "row", alignItems: "center", marginTop: spacing.xxl, paddingTop: spacing.xl, borderTopWidth: 1, marginBottom: spacing.md },
    themeRow: { flexDirection: "row", gap: spacing.sm },
    themeBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
    },
    themeBtnText: { fontSize: 13, fontWeight: "600" },
    menuSection: { marginTop: spacing.xxl, paddingTop: spacing.xl, borderTopWidth: 1 },
    menuRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
    },
    logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, paddingVertical: spacing.lg, borderRadius: radius.md, borderWidth: 1, marginTop: spacing.xxl },
    logoutText: { fontSize: 14, fontWeight: "600" },
})
