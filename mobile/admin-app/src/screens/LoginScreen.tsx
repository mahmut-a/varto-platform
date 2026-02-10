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
import { login } from "../api/client"

interface LoginScreenProps {
    onLogin: () => void
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
    const [email, setEmail] = useState("admin@varto.com")
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
        } catch (err: any) {
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
                <View style={styles.logoContainer}>
                    <Text style={styles.logo}>🏔️</Text>
                    <Text style={styles.appName}>Varto Admin</Text>
                    <Text style={styles.subtitle}>Yerel Süper Platform Yönetimi</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>E-posta</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="admin@varto.com"
                        placeholderTextColor="#475569"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Şifre</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••"
                        placeholderTextColor="#475569"
                        secureTextEntry
                    />

                    <TouchableOpacity
                        style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.loginButtonText}>Giriş Yap</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0f172a" },
    content: { flex: 1, justifyContent: "center", paddingHorizontal: 32 },
    logoContainer: { alignItems: "center", marginBottom: 48 },
    logo: { fontSize: 64 },
    appName: { fontSize: 32, fontWeight: "800", color: "#f8fafc", marginTop: 12 },
    subtitle: { fontSize: 14, color: "#94a3b8", marginTop: 4 },
    form: {},
    label: { fontSize: 14, fontWeight: "600", color: "#94a3b8", marginBottom: 6, marginTop: 16 },
    input: {
        backgroundColor: "#1e293b",
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: "#f8fafc",
        borderWidth: 1,
        borderColor: "#334155",
    },
    loginButton: {
        backgroundColor: "#6366f1",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        marginTop: 32,
    },
    loginButtonDisabled: { opacity: 0.6 },
    loginButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
})
