import React, { useState } from "react"
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { getColors, getTypography, spacing, radius } from "../theme/tokens"
import { updateProfile } from "../api/client"

export default function RegisterScreen({ customer, onComplete }: {
    customer: any
    onComplete: (updatedCustomer: any) => void
}) {
    const c = getColors()
    const t = getTypography()

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [address, setAddress] = useState("")
    const [saving, setSaving] = useState(false)

    const handleRegister = async () => {
        if (!name.trim()) {
            Alert.alert("Hata", "Ad Soyad zorunludur")
            return
        }

        setSaving(true)
        try {
            const updated = await updateProfile({
                name: name.trim(),
                email: email.trim() || null,
                address: address.trim() || null,
            })
            onComplete(updated)
        } catch (e: any) {
            Alert.alert("Hata", e?.response?.data?.message || "Kayıt sırasında hata oluştu")
        } finally {
            setSaving(false)
        }
    }

    return (
        <KeyboardAvoidingView style={[styles.container, { backgroundColor: c.bg.base }]} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                {/* Header */}
                <View style={styles.header}>
                    <View style={[styles.iconCircle, { backgroundColor: c.tag.green.bg }]}>
                        <Ionicons name="person-add-outline" size={36} color={c.tag.green.fg} />
                    </View>
                    <Text style={[t.h1, { marginTop: spacing.xl, textAlign: "center" }]}>Hoş Geldiniz!</Text>
                    <Text style={[t.body, { marginTop: spacing.sm, textAlign: "center" }]}>
                        Hesabınız oluşturuldu. Bilgilerinizi tamamlayın.
                    </Text>
                    <View style={[styles.phoneBadge, { backgroundColor: c.bg.subtle, borderColor: c.border.base }]}>
                        <Ionicons name="call-outline" size={14} color={c.fg.muted} />
                        <Text style={[t.small, { marginLeft: spacing.xs, fontWeight: "600" }]}>{customer?.phone}</Text>
                    </View>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.fieldWrap}>
                        <Text style={[t.label, { marginBottom: spacing.xs }]}>Ad Soyad *</Text>
                        <View style={[styles.fieldRow, { backgroundColor: c.bg.field, borderColor: c.border.base }]}>
                            <Ionicons name="person-outline" size={18} color={c.fg.muted} />
                            <TextInput
                                style={[styles.fieldInput, { color: c.fg.base }]}
                                value={name}
                                onChangeText={setName}
                                placeholder="Adınız ve Soyadınız"
                                placeholderTextColor={c.fg.muted}
                                autoCapitalize="words"
                                autoFocus
                            />
                        </View>
                    </View>

                    <View style={styles.fieldWrap}>
                        <Text style={[t.label, { marginBottom: spacing.xs }]}>E-posta (opsiyonel)</Text>
                        <View style={[styles.fieldRow, { backgroundColor: c.bg.field, borderColor: c.border.base }]}>
                            <Ionicons name="mail-outline" size={18} color={c.fg.muted} />
                            <TextInput
                                style={[styles.fieldInput, { color: c.fg.base }]}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="ornek@mail.com"
                                placeholderTextColor={c.fg.muted}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <View style={styles.fieldWrap}>
                        <Text style={[t.label, { marginBottom: spacing.xs }]}>Adres (opsiyonel)</Text>
                        <View style={[styles.fieldRow, { backgroundColor: c.bg.field, borderColor: c.border.base, minHeight: 60, alignItems: "flex-start", paddingTop: spacing.md }]}>
                            <Ionicons name="location-outline" size={18} color={c.fg.muted} style={{ marginTop: 2 }} />
                            <TextInput
                                style={[styles.fieldInput, { color: c.fg.base }]}
                                value={address}
                                onChangeText={setAddress}
                                placeholder="Teslimat adresiniz"
                                placeholderTextColor={c.fg.muted}
                                multiline
                            />
                        </View>
                    </View>
                </View>

                {/* Submit */}
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: c.interactive, opacity: saving ? 0.5 : 1 }]}
                    onPress={handleRegister}
                    disabled={saving}
                    activeOpacity={0.8}
                >
                    {saving ? (
                        <ActivityIndicator color={c.fg.on_color} size="small" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle-outline" size={20} color={c.fg.on_color} />
                            <Text style={[styles.buttonText, { color: c.fg.on_color }]}>Kaydı Tamamla</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Skip */}
                <TouchableOpacity style={styles.skipBtn} onPress={() => onComplete(customer)} activeOpacity={0.6}>
                    <Text style={[t.body, { color: c.fg.muted }]}>Şimdilik geç →</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: spacing.xxxl, paddingTop: 60 },
    header: { alignItems: "center", marginBottom: spacing.xxxl },
    iconCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: "center", alignItems: "center" },
    phoneBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, borderWidth: 1, marginTop: spacing.lg },
    form: { gap: spacing.md },
    fieldWrap: {},
    fieldRow: { flexDirection: "row", alignItems: "center", borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.md, height: 48, gap: spacing.sm },
    fieldInput: { flex: 1, fontSize: 14, fontWeight: "500" },
    button: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, paddingVertical: spacing.lg, borderRadius: radius.md, marginTop: spacing.xxl },
    buttonText: { fontSize: 15, fontWeight: "600" },
    skipBtn: { alignItems: "center", paddingVertical: spacing.xl },
})
