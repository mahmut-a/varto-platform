import React, { useState, useEffect, useRef } from "react"
import { StatusBar } from "expo-status-bar"
import { NavigationContainer, NavigationContainerRef } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"
import * as Notifications from "expo-notifications"
import { colors } from "./src/theme/tokens"
import LoginScreen from "./src/screens/LoginScreen"
import DashboardScreen from "./src/screens/DashboardScreen"
import OrdersScreen from "./src/screens/OrdersScreen"
import OrderDetailScreen from "./src/screens/OrderDetailScreen"
import MenuScreen from "./src/screens/MenuScreen"
import SettingsScreen from "./src/screens/SettingsScreen"
import {
    configureNotificationHandler,
    setupNotificationChannel,
    registerForPushNotificationsAsync,
    savePushTokenToBackend,
    removePushTokenFromBackend,
} from "./src/api/notifications"

// Bildirim görünümünü ayarla (uygulama açıkken de göster + ses çal)
configureNotificationHandler()

const Tab = createBottomTabNavigator()
const OrderStack = createNativeStackNavigator()

function OrdersStack() {
    return (
        <OrderStack.Navigator screenOptions={{ headerShown: false }}>
            <OrderStack.Screen name="OrdersList" component={OrdersScreen} />
            <OrderStack.Screen name="OrderDetail" component={OrderDetailScreen} />
        </OrderStack.Navigator>
    )
}

function VendorTabs({ vendor, onLogout, onVendorUpdate }: { vendor: any; onLogout: () => void; onVendorUpdate: (v: any) => void }) {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
                        Ana: "grid-outline",
                        Sipariş: "receipt-outline",
                        Menü: "fast-food-outline",
                        Ayarlar: "settings-outline",
                    }
                    return <Ionicons name={icons[route.name] || "apps-outline"} size={20} color={color} />
                },
                tabBarActiveTintColor: colors.interactive,
                tabBarInactiveTintColor: colors.fg.muted,
                tabBarStyle: {
                    backgroundColor: colors.bg.base,
                    borderTopColor: colors.border.base,
                    borderTopWidth: 1,
                    paddingBottom: 4,
                    height: 56,
                },
                tabBarLabelStyle: { fontSize: 11, fontWeight: "500" },
                headerShown: false,
            })}
        >
            <Tab.Screen name="Ana" options={{ title: "Ana Sayfa" }}>
                {(props) => <DashboardScreen {...props} vendor={vendor} />}
            </Tab.Screen>
            <Tab.Screen name="Sipariş" component={OrdersStack} options={{ title: "Siparişler" }} />
            <Tab.Screen name="Menü" component={MenuScreen} />
            <Tab.Screen name="Ayarlar">
                {(props) => <SettingsScreen {...props} vendor={vendor} onLogout={onLogout} onVendorUpdate={onVendorUpdate} />}
            </Tab.Screen>
        </Tab.Navigator>
    )
}

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [vendor, setVendor] = useState<any>(null)
    const navigationRef = useRef<NavigationContainerRef<any>>(null)
    const [isNavigationReady, setIsNavigationReady] = useState(false)
    const notificationListener = useRef<Notifications.EventSubscription | null>(null)
    const responseListener = useRef<Notifications.EventSubscription | null>(null)
    // Bekleyen navigation (login olmadan önce bildirime tıklanırsa)
    const pendingNavigation = useRef<{ orderId: string } | null>(null)

    // Push notification kanalını ayarla
    useEffect(() => {
        setupNotificationChannel()
    }, [])

    // Bildirime tıklanınca OrderDetail'e yönlendir
    const navigateToOrder = (orderId: string) => {
        if (!isLoggedIn || !isNavigationReady || !navigationRef.current) {
            // Henüz login olmamış veya navigation hazır değil, beklet
            pendingNavigation.current = { orderId }
            return
        }
        try {
            // Sipariş tab'ına geç, ardından OrderDetail'e git
            navigationRef.current.navigate("Sipariş", {
                screen: "OrderDetail",
                params: { orderId },
            })
        } catch (err) {
            console.error("Navigation hatası:", err)
        }
    }

    // Bildirim dinleyicilerini kur
    useEffect(() => {
        // Uygulama açıkken gelen bildirim
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log("📬 Bildirim alındı:", notification.request.content.title)
        })

        // Bildirime tıklandığında
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data
            console.log("📬 Bildirime tıklandı:", data)

            if (data?.type === "new_order" && data?.order_id) {
                navigateToOrder(data.order_id as string)
            }
        })

        // Uygulama kapalıyken bildirime tıklanarak açıldıysa
        Notifications.getLastNotificationResponseAsync().then(response => {
            if (response) {
                const data = response.notification.request.content.data
                if (data?.type === "new_order" && data?.order_id) {
                    navigateToOrder(data.order_id as string)
                }
            }
        })

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove()
            }
            if (responseListener.current) {
                responseListener.current.remove()
            }
        }
    }, [isLoggedIn, isNavigationReady])

    // Bekleyen navigation'ı işle (login olduktan sonra)
    useEffect(() => {
        if (isLoggedIn && isNavigationReady && pendingNavigation.current) {
            const { orderId } = pendingNavigation.current
            pendingNavigation.current = null
            // Küçük bir gecikme ile navigate et (navigation tamamen hazır olsun)
            setTimeout(() => navigateToOrder(orderId), 500)
        }
    }, [isLoggedIn, isNavigationReady])

    const handleLogin = async (vendorData: any) => {
        setVendor(vendorData)
        setIsLoggedIn(true)

        // Push notification token'ı al ve backend'e kaydet
        const pushToken = await registerForPushNotificationsAsync()
        if (pushToken && vendorData?.id) {
            await savePushTokenToBackend(vendorData.id, pushToken)
        }
    }

    const handleLogout = async () => {
        // Logout olurken push token'ı backend'den sil
        if (vendor?.id) {
            await removePushTokenFromBackend(vendor.id)
        }
        setIsLoggedIn(false)
        setVendor(null)
    }

    if (!isLoggedIn) {
        return (
            <>
                <StatusBar style="dark" />
                <LoginScreen onLogin={handleLogin} />
            </>
        )
    }

    return (
        <>
            <StatusBar style="dark" />
            <NavigationContainer
                ref={navigationRef}
                onReady={() => setIsNavigationReady(true)}
            >
                <VendorTabs vendor={vendor} onLogout={handleLogout} onVendorUpdate={setVendor} />
            </NavigationContainer>
        </>
    )
}
