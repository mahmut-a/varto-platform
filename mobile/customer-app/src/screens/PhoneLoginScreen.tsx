import React, { useState } from "react"
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    useColorScheme,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { getColors, getTypography, spacing, radius } from "../theme/tokens"
import { sendOtp, getApiBaseUrl } from "../api/client"

export default function PhoneLoginScreen({ onOtpSent }: { onOtpSent: (phone: string) => void }) {
    const c = getColors()
    const t = getTypography()

    const [phone, setPhone] = useState("")
    const [loading, setLoading] = useState(false)

    const formatPhone = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, "")
        return cleaned.slice(0, 11)
    }

    const handleSendOtp = async () => {
        if (phone.length < 10) {
            Alert.alert("Hata", "Geçerli bir telefon numarası girin")
            return
        }
        setLoading(true)
        try {
            await sendOtp(phone)
            onOtpSent(phone)
        } catch (e: any) {
            Alert.alert("Hata", e?.response?.data?.message || "Bağlantı hatası")
        } finally {
            setLoading(false)
        }
    }

    return (
        <KeyboardAvoidingView style={[styles.container, { backgroundColor: c.bg.base }]} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={styles.content}>
                {/* Logo / Header */}
                <View style={styles.header}>
                    <View style={[styles.iconCircle, { backgroundColor: c.interactive + "15" }]}>
                        <Ionicons name="storefront" size={40} color={c.interactive} />
                    </View>
                    <Text style={[t.h1, { marginTop: spacing.xl, textAlign: "center" }]}>Varto'ya Hoş Geldiniz</Text>
                    <Text style={[t.body, { marginTop: spacing.sm, textAlign: "center" }]}>
                        Sipariş vermek için telefon numaranızla giriş yapın
                    </Text>
                </View>

                {/* Phone Input */}
                <View style={styles.form}>
                    <Text style={[t.label, { marginBottom: spacing.sm }]}>Telefon Numarası</Text>
                    <View style={[styles.phoneRow, { backgroundColor: c.bg.field, borderColor: c.border.base }]}>
                        <Text style={[t.h3, { color: c.fg.muted, marginRight: spacing.sm }]}>+90</Text>
                        <TextInput
                            style={[styles.phoneInput, { color: c.fg.base }]}
                            value={phone}
                            onChangeText={(text) => setPhone(formatPhone(text))}
                            placeholder="5XX XXX XXXX"
                            placeholderTextColor={c.fg.muted}
                            keyboardType="phone-pad"
                            maxLength={11}
                            autoFocus
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: c.interactive, opacity: loading ? 0.5 : 1 }]}
                        onPress={handleSendOtp}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color={c.fg.on_color} size="small" />
                        ) : (
                            <>
                                <Text style={[styles.buttonText, { color: c.fg.on_color }]}>Devam Et</Text>
                                <Ionicons name="arrow-forward" size={18} color={c.fg.on_color} />
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <Text style={[t.small, { textAlign: "center", marginTop: spacing.xxl }]}>
                    Sunucu: {getApiBaseUrl()}
                </Text>
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, justifyContent: "center", paddingHorizontal: spacing.xxxl },
    header: { alignItems: "center", marginBottom: spacing.xxxl },
    iconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center" },
    form: {},
    phoneRow: { flexDirection: "row", alignItems: "center", borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.lg, height: 52 },
    phoneInput: { flex: 1, fontSize: 16, fontWeight: "500", letterSpacing: 1 },
    button: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, paddingVertical: spacing.lg, borderRadius: radius.md, marginTop: spacing.xl },
    buttonText: { fontSize: 15, fontWeight: "600" },
})
