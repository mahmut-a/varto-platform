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
} from "react-native"
import { colors, spacing, radius, typography } from "../theme/tokens"
import { login } from "../api/client"

interface LoginScreenProps {
    onLogin: () => void
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
    const [email, setEmail] = useState("vartoadmin@varto.com")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Hata", "E-posta ve şifre gereklidir.")
            return
        }
        setLoading(true)
        try {
            await login(email, password)
            onLogin()
        } catch {
            Alert.alert("Giriş Başarısız", "E-posta veya şifre hatalı.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Varto</Text>
                    <Text style={styles.subtitle}>Admin paneline giriş yapın</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>E-posta</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="admin@varto.com"
                        placeholderTextColor={colors.fg.muted}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Text style={[styles.label, { marginTop: spacing.lg }]}>Şifre</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••"
                        placeholderTextColor={colors.fg.muted}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.fg.on_color} size="small" />
                        ) : (
                            <Text style={styles.buttonText}>Giriş Yap</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg.base },
    content: { flex: 1, justifyContent: "center", paddingHorizontal: spacing.xxxl },
    header: { marginBottom: spacing.xxxl },
    title: { fontSize: 24, fontWeight: "600", color: colors.fg.base, letterSpacing: -0.5 },
    subtitle: { ...typography.body, marginTop: spacing.xs },
    form: {},
    label: { ...typography.label, marginBottom: spacing.sm },
    input: {
        backgroundColor: colors.bg.field,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border.base,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        fontSize: 14,
        color: colors.fg.base,
    },
    button: {
        backgroundColor: colors.interactive,
        borderRadius: radius.md,
        paddingVertical: spacing.md + 2,
        alignItems: "center",
        marginTop: spacing.xxl,
    },
    buttonDisabled: { opacity: 0.5 },
    buttonText: { color: colors.fg.on_color, fontSize: 14, fontWeight: "500" },
})
