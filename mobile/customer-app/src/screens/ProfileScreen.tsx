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
    useColorScheme,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { getColors, getTypography, spacing, radius } from "../theme/tokens"
import { getMe, updateProfile } from "../api/client"

export default function ProfileScreen({ customer, onLogout, onUpdateCustomer }: {
    customer: any
    onLogout: () => void
    onUpdateCustomer: (c: any) => void
}) {
    const c = getColors()
    const t = getTypography()

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
    logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, paddingVertical: spacing.lg, borderRadius: radius.md, borderWidth: 1, marginTop: spacing.xxl },
    logoutText: { fontSize: 14, fontWeight: "600" },
})
