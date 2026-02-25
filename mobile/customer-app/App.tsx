import React, { useState, useEffect } from "react"
import { ActivityIndicator, View } from "react-native"
import { StatusBar } from "expo-status-bar"
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { SafeAreaProvider } from "react-native-safe-area-context"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Ionicons } from "@expo/vector-icons"
import { setCustomerToken, getMe } from "./src/api/client"
import { ThemeProvider, useTheme } from "./src/context/ThemeContext"
import { CartProvider, useCart } from "./src/context/CartContext"
import {
    configureNotificationHandler,
    setupNotificationChannel,
    registerForPushNotificationsAsync,
    savePushTokenToBackend,
    removePushTokenFromBackend,
} from "./src/api/notifications"

import PhoneLoginScreen from "./src/screens/PhoneLoginScreen"
import OTPScreen from "./src/screens/OTPScreen"
import RegisterScreen from "./src/screens/RegisterScreen"
import HomeScreen from "./src/screens/HomeScreen"
import VendorDetailScreen from "./src/screens/VendorDetailScreen"
import CartScreen from "./src/screens/CartScreen"
import OrderTrackingScreen from "./src/screens/OrderTrackingScreen"
import ListingsScreen from "./src/screens/ListingsScreen"
import ProfileScreen from "./src/screens/ProfileScreen"
import OrderHistoryScreen from "./src/screens/OrderHistoryScreen"
import FavoritesScreen from "./src/screens/FavoritesScreen"

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

const STORAGE_KEYS = { token: "@varto_token", customer: "@varto_customer" }

// Bildirim görünümünü ayarla (uygulama açıkken de göster)
configureNotificationHandler()

// ─── Stack Navigators ───
function HomeStack() {
    const { colors } = useTheme()
    const headerOpts = {
        headerStyle: { backgroundColor: colors.bg.base },
        headerTintColor: colors.fg.base,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: "600" as const, fontSize: 16 },
    }
    return (
        <Stack.Navigator screenOptions={headerOpts}>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: "İşletmeler" }} />
            <Stack.Screen name="VendorDetail" component={VendorDetailScreen} options={({ route }: any) => ({ title: route.params?.vendor?.name || "İşletme" })} />
        </Stack.Navigator>
    )
}

function CartStack({ customer }: { customer: any }) {
    const { colors } = useTheme()
    return (
        <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.bg.base }, headerTintColor: colors.fg.base, headerShadowVisible: false, headerTitleStyle: { fontWeight: "600" as const, fontSize: 16 } }}>
            <Stack.Screen name="Cart" options={{ title: "Sepet" }}>
                {(props) => <CartScreen {...props} customer={customer} />}
            </Stack.Screen>
        </Stack.Navigator>
    )
}

function OrdersStack({ customer }: { customer: any }) {
    const { colors } = useTheme()
    return (
        <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.bg.base }, headerTintColor: colors.fg.base, headerShadowVisible: false, headerTitleStyle: { fontWeight: "600" as const, fontSize: 16 } }}>
            <Stack.Screen name="OrderTracking" options={{ title: "Sipariş Takip" }}>
                {(props) => <OrderTrackingScreen {...props} customer={customer} />}
            </Stack.Screen>
        </Stack.Navigator>
    )
}

function ProfileStack({ customer, onLogout, onUpdateCustomer }: { customer: any; onLogout: () => void; onUpdateCustomer: (c: any) => void }) {
    const { colors } = useTheme()
    const headerOpts = { headerStyle: { backgroundColor: colors.bg.base }, headerTintColor: colors.fg.base, headerShadowVisible: false, headerTitleStyle: { fontWeight: "600" as const, fontSize: 16 } }
    return (
        <Stack.Navigator screenOptions={headerOpts}>
            <Stack.Screen name="Profile" options={{ title: "Profilim" }}>
                {(props) => <ProfileScreen {...props} customer={customer} onLogout={onLogout} onUpdateCustomer={onUpdateCustomer} />}
            </Stack.Screen>
            <Stack.Screen name="OrderHistory" options={{ title: "Sipariş Geçmişi" }}>
                {(props) => <OrderHistoryScreen {...props} customer={customer} />}
            </Stack.Screen>
            <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: "Favorilerim" }} />
            <Stack.Screen name="OrderTrackingDetail" options={{ title: "Sipariş Detayı" }}>
                {(props) => <OrderTrackingScreen {...props} customer={customer} />}
            </Stack.Screen>
        </Stack.Navigator>
    )
}

// ─── Inner App (uses contexts) ───
function AppInner() {
    const { colorScheme, colors } = useTheme()
    const { getCartCount } = useCart()

    const [authState, setAuthState] = useState<"loading" | "phone" | "otp" | "register" | "authenticated">("loading")
    const [phone, setPhone] = useState("")
    const [isNewUser, setIsNewUser] = useState(false)
    const [customer, setCustomer] = useState<any>(null)

    // Push notification kanalını ayarla
    useEffect(() => {
        setupNotificationChannel()
    }, [])

    // Restore session on startup
    useEffect(() => {
        (async () => {
            try {
                const token = await AsyncStorage.getItem(STORAGE_KEYS.token)
                const stored = await AsyncStorage.getItem(STORAGE_KEYS.customer)
                if (token && stored) {
                    setCustomerToken(token)
                    setCustomer(JSON.parse(stored))
                    try {
                        const fresh = await getMe()
                        setCustomer(fresh)
                        setAuthState("authenticated")
                        // Session restore sonrası push token güncelle
                        registerAndSavePushToken(fresh.id)
                    } catch {
                        await AsyncStorage.multiRemove([STORAGE_KEYS.token, STORAGE_KEYS.customer])
                        setCustomerToken(null)
                        setAuthState("phone")
                    }
                } else {
                    setAuthState("phone")
                }
            } catch {
                setAuthState("phone")
            }
        })()
    }, [])

    const handleOtpSent = (phoneNum: string, isNew: boolean) => {
        setPhone(phoneNum)
        setIsNewUser(isNew)
        setAuthState("otp")
    }

    const handleVerified = async (cust: any, token: string) => {
        setCustomer(cust)
        await AsyncStorage.setItem(STORAGE_KEYS.token, token)
        await AsyncStorage.setItem(STORAGE_KEYS.customer, JSON.stringify(cust))
        if (isNewUser && !cust.name) {
            setAuthState("register")
        } else {
            setAuthState("authenticated")
        }
        // Push token kaydet
        registerAndSavePushToken(cust.id)
    }

    const registerAndSavePushToken = async (customerId: string) => {
        try {
            const pushToken = await registerForPushNotificationsAsync()
            if (pushToken && customerId) {
                await savePushTokenToBackend(customerId, pushToken)
            }
        } catch (err) {
            console.error("Push token kayıt hatası:", err)
        }
    }

    const handleRegistrationComplete = async (updatedCustomer: any) => {
        setCustomer(updatedCustomer)
        await AsyncStorage.setItem(STORAGE_KEYS.customer, JSON.stringify(updatedCustomer))
        setAuthState("authenticated")
        // Push token kaydet (kayıt sonrası ilk kez authenticated oluyor)
        registerAndSavePushToken(updatedCustomer.id)
    }

    const handleLogout = async () => {
        // Push token sil
        if (customer?.id) {
            await removePushTokenFromBackend(customer.id)
        }
        await AsyncStorage.multiRemove([STORAGE_KEYS.token, STORAGE_KEYS.customer])
        setCustomerToken(null)
        setCustomer(null)
        setAuthState("phone")
    }

    const handleUpdateCustomer = async (cust: any) => {
        setCustomer(cust)
        await AsyncStorage.setItem(STORAGE_KEYS.customer, JSON.stringify(cust))
    }

    const MedusaTheme = {
        ...(colorScheme === "dark" ? DarkTheme : DefaultTheme),
        colors: {
            ...(colorScheme === "dark" ? DarkTheme.colors : DefaultTheme.colors),
            primary: colors.interactive,
            background: colors.bg.base,
            card: colors.bg.base,
            text: colors.fg.base,
            border: colors.border.base,
        },
    }

    // ── Loading ──
    if (authState === "loading") {
        return (
            <SafeAreaProvider>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg.base }}>
                    <ActivityIndicator size="large" color={colors.interactive} />
                </View>
                <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
            </SafeAreaProvider>
        )
    }

    // ── Auth Flow ──
    if (authState === "phone") {
        return (
            <SafeAreaProvider>
                <PhoneLoginScreen onOtpSent={handleOtpSent} />
                <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
            </SafeAreaProvider>
        )
    }

    if (authState === "otp") {
        return (
            <SafeAreaProvider>
                <OTPScreen phone={phone} onVerified={handleVerified} onBack={() => setAuthState("phone")} />
                <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
            </SafeAreaProvider>
        )
    }

    if (authState === "register") {
        return (
            <SafeAreaProvider>
                <RegisterScreen customer={customer} onComplete={handleRegistrationComplete} />
                <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
            </SafeAreaProvider>
        )
    }

    const cartCount = getCartCount()

    // ── Authenticated ──
    return (
        <SafeAreaProvider>
            <NavigationContainer theme={MedusaTheme}>
                <Tab.Navigator
                    screenOptions={({ route }) => ({
                        headerShown: false,
                        tabBarStyle: { backgroundColor: colors.bg.base, borderTopColor: colors.border.base },
                        tabBarActiveTintColor: colors.interactive,
                        tabBarInactiveTintColor: colors.fg.muted,
                        tabBarLabelStyle: { fontSize: 11, fontWeight: "500" },
                        tabBarIcon: ({ color, size }) => {
                            const icons: Record<string, string> = {
                                HomeTab: "storefront-outline",
                                ListingsTab: "document-text-outline",
                                CartTab: "bag-outline",
                                OrdersTab: "receipt-outline",
                                ProfileTab: "person-outline",
                            }
                            return <Ionicons name={(icons[route.name] || "ellipse-outline") as any} size={size} color={color} />
                        },
                        tabBarBadge: route.name === "CartTab" && cartCount > 0 ? cartCount : undefined,
                        tabBarBadgeStyle: route.name === "CartTab" ? { backgroundColor: colors.interactive, color: colors.fg.on_color, fontSize: 10, minWidth: 18, height: 18, lineHeight: 18 } : undefined,
                    })}
                >
                    <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: "İşletmeler" }} />
                    <Tab.Screen name="ListingsTab" component={ListingsScreen} options={{ title: "İlanlar", headerShown: true, headerStyle: { backgroundColor: colors.bg.base }, headerTintColor: colors.fg.base, headerShadowVisible: false, headerTitle: "İlanlar" }} />
                    <Tab.Screen name="CartTab" options={{ title: "Sepet" }}>
                        {() => <CartStack customer={customer} />}
                    </Tab.Screen>
                    <Tab.Screen name="OrdersTab" options={{ title: "Takip" }}>
                        {() => <OrdersStack customer={customer} />}
                    </Tab.Screen>
                    <Tab.Screen name="ProfileTab" options={{ title: "Profil" }}>
                        {() => <ProfileStack customer={customer} onLogout={handleLogout} onUpdateCustomer={handleUpdateCustomer} />}
                    </Tab.Screen>
                </Tab.Navigator>
            </NavigationContainer>
            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        </SafeAreaProvider>
    )
}

// ─── Root App ───
export default function App() {
    return (
        <ThemeProvider>
            <CartProvider>
                <AppInner />
            </CartProvider>
        </ThemeProvider>
    )
}
