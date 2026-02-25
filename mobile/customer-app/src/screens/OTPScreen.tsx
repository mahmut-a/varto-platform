import React, { useState, useRef, useEffect } from "react"
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

} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { spacing, radius } from "../theme/tokens"
import { useTheme } from "../context/ThemeContext"
import { verifyOtp } from "../api/client"

const OTP_LENGTH = 6

export default function OTPScreen({ phone, onVerified, onBack }: {
    phone: string
    onVerified: (customer: any, token: string) => void
    onBack: () => void
}) {
    const { colors: c, typography: t } = useTheme()

    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""))
    const [loading, setLoading] = useState(false)
    const inputs = useRef<(TextInput | null)[]>([])

    const handleChange = (text: string, index: number) => {
        const digit = text.replace(/[^0-9]/g, "").slice(-1)
        const newOtp = [...otp]
        newOtp[index] = digit
        setOtp(newOtp)

        // Auto-advance to next input
        if (digit && index < OTP_LENGTH - 1) {
            inputs.current[index + 1]?.focus()
        }
    }

    const handleKeyPress = (key: string, index: number) => {
        if (key === "Backspace" && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus()
            const newOtp = [...otp]
            newOtp[index - 1] = ""
            setOtp(newOtp)
        }
    }

    const otpString = otp.join("")

    const handleVerify = async () => {
        if (otpString.length !== OTP_LENGTH) {
            Alert.alert("Hata", "6 haneli kodu girin")
            return
        }
        setLoading(true)
        try {
            const result = await verifyOtp(phone, otpString)
            onVerified(result.customer, result.token)
        } catch (e: any) {
            Alert.alert("Hata", e?.response?.data?.message || "Doğrulama başarısız")
            setOtp(Array(OTP_LENGTH).fill(""))
            inputs.current[0]?.focus()
        } finally {
            setLoading(false)
        }
    }

    // Auto-submit when all digits entered
    useEffect(() => {
        if (otpString.length === OTP_LENGTH) {
            handleVerify()
        }
    }, [otpString])

    return (
        <KeyboardAvoidingView style={[styles.container, { backgroundColor: c.bg.base }]} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={styles.content}>
                {/* Back button */}
                <TouchableOpacity style={styles.backBtn} onPress={onBack}>
                    <Ionicons name="arrow-back" size={24} color={c.fg.base} />
                </TouchableOpacity>

                <View style={styles.header}>
                    <View style={[styles.iconCircle, { backgroundColor: c.interactive + "15" }]}>
                        <Ionicons name="shield-checkmark-outline" size={36} color={c.interactive} />
                    </View>
                    <Text style={[t.h1, { marginTop: spacing.xl, textAlign: "center" }]}>Doğrulama Kodu</Text>
                    <Text style={[t.body, { marginTop: spacing.sm, textAlign: "center" }]}>
                        {phone} numarasına gönderilen 6 haneli kodu girin
                    </Text>
                </View>

                {/* OTP Input Boxes */}
                <View style={styles.otpRow}>
                    {otp.map((digit, idx) => (
                        <TextInput
                            key={idx}
                            ref={(ref) => { inputs.current[idx] = ref }}
                            style={[
                                styles.otpBox,
                                {
                                    backgroundColor: c.bg.field,
                                    borderColor: digit ? c.interactive : c.border.base,
                                    color: c.fg.base,
                                },
                            ]}
                            value={digit}
                            onChangeText={(text) => handleChange(text, idx)}
                            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, idx)}
                            keyboardType="number-pad"
                            maxLength={1}
                            textContentType="oneTimeCode"
                            autoFocus={idx === 0}
                        />
                    ))}
                </View>

                {loading && <ActivityIndicator style={{ marginTop: spacing.xl }} color={c.interactive} />}

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: c.interactive, opacity: loading || otpString.length < OTP_LENGTH ? 0.5 : 1 }]}
                    onPress={handleVerify}
                    disabled={loading || otpString.length < OTP_LENGTH}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.buttonText, { color: c.fg.on_color }]}>Doğrula</Text>
                </TouchableOpacity>

                {/* Hint */}
                <View style={[styles.hint, { backgroundColor: c.bg.subtle, borderColor: c.border.base }]}>
                    <Ionicons name="information-circle-outline" size={16} color={c.fg.muted} />
                    <Text style={[t.small, { marginLeft: spacing.sm, flex: 1 }]}>
                        Test modu: doğrulama kodu 123456
                    </Text>
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, justifyContent: "center", paddingHorizontal: spacing.xxxl },
    backBtn: { position: "absolute", top: 60, left: spacing.xl },
    header: { alignItems: "center", marginBottom: spacing.xxxl },
    iconCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: "center", alignItems: "center" },
    otpRow: { flexDirection: "row", justifyContent: "center", gap: spacing.sm },
    otpBox: { width: 46, height: 56, borderRadius: radius.md, borderWidth: 2, textAlign: "center", fontSize: 22, fontWeight: "700" },
    button: { paddingVertical: spacing.lg, borderRadius: radius.md, alignItems: "center", marginTop: spacing.xxl },
    buttonText: { fontSize: 15, fontWeight: "600" },
    hint: { flexDirection: "row", alignItems: "center", padding: spacing.md, borderRadius: radius.md, borderWidth: 1, marginTop: spacing.xxl },
})
