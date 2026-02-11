import React, { useState } from "react"
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { colors, spacing, radius, typography } from "../theme/tokens"
import { login, setAuthToken, setCurrentVendorId, getVendors } from "../api/client"

interface Props {
    onLogin: (vendor: any) => void
}

export default function LoginScreen({ onLogin }: Props) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("Hata", "Email ve şifre giriniz")
            return
        }
        setLoading(true)
        try {
            const data = await login(email.trim(), password.trim())
            setAuthToken(data.token)

            // Vendor listesinden bu kullanıcının vendor'ını bul
            const vendors = await getVendors()
            if (vendors && vendors.length > 0) {
                const vendor = vendors[0] // İlk vendor'ı al (ileride user-vendor bağlantısı kurulacak)
                setCurrentVendorId(vendor.id)
                onLogin(vendor)
            } else {
                Alert.alert("Hata", "Bu hesaba bağlı işletme bulunamadı")
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Giriş başarısız"
            Alert.alert("Giriş Hatası", msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <SafeAreaView style={s.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={s.inner}
            >
                {/* Logo / Header */}
                <View style={s.header}>
                    <View style={s.iconCircle}>
                        <Ionicons name="storefront" size={36} color={colors.interactive} />
                    </View>
                    <Text style={s.title}>Varto İşletme</Text>
                    <Text style={s.subtitle}>İşletme panelinize giriş yapın</Text>
                </View>

                {/* Form */}
                <View style={s.form}>
                    <View style={s.fieldGroup}>
                        <Text style={s.fieldLabel}>Email</Text>
                        <View style={s.inputRow}>
                            <Ionicons name="mail-outline" size={18} color={colors.fg.muted} style={s.inputIcon} />
                            <TextInput
                                style={s.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="ornek@email.com"
                                placeholderTextColor={colors.fg.muted}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                    </View>

                    <View style={s.fieldGroup}>
                        <Text style={s.fieldLabel}>Şifre</Text>
                        <View style={s.inputRow}>
                            <Ionicons name="lock-closed-outline" size={18} color={colors.fg.muted} style={s.inputIcon} />
                            <TextInput
                                style={s.input}
                                value={password}
                                onChangeText={setPassword}
                                placeholder="••••••••"
                                placeholderTextColor={colors.fg.muted}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
                                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.fg.muted} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[s.loginBtn, loading && s.loginBtnDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.fg.on_color} size="small" />
                        ) : (
                            <Text style={s.loginBtnText}>Giriş Yap</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <Text style={s.footer}>Varto Yazılım © 2026</Text>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg.base },
    inner: { flex: 1, justifyContent: "center", paddingHorizontal: spacing.xxl },
    header: { alignItems: "center", marginBottom: spacing.xxxl },
    iconCircle: {
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: "#FFF7ED",
        justifyContent: "center", alignItems: "center",
        marginBottom: spacing.lg,
    },
    title: { ...typography.h1, fontSize: 26, marginBottom: spacing.xs },
    subtitle: { ...typography.body, color: colors.fg.muted },
    form: { gap: spacing.lg },
    fieldGroup: { gap: spacing.xs },
    fieldLabel: { ...typography.label, marginLeft: spacing.xs },
    inputRow: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: colors.bg.field,
        borderRadius: radius.md,
        borderWidth: 1, borderColor: colors.border.base,
        paddingHorizontal: spacing.md,
        height: 48,
    },
    inputIcon: { marginRight: spacing.sm },
    input: { flex: 1, fontSize: 15, color: colors.fg.base },
    eyeBtn: { padding: spacing.xs },
    loginBtn: {
        backgroundColor: colors.interactive,
        borderRadius: radius.md,
        height: 48,
        justifyContent: "center", alignItems: "center",
        marginTop: spacing.sm,
    },
    loginBtnDisabled: { opacity: 0.6 },
    loginBtnText: { fontSize: 15, fontWeight: "600", color: colors.fg.on_color },
    footer: { ...typography.caption, textAlign: "center", marginTop: spacing.xxxl },
})
