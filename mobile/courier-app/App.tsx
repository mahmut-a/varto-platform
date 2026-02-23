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

function DeliveryStack() {
    return (
        <OrderStack.Navigator screenOptions={{ headerShown: false }}>
            <OrderStack.Screen name="OrdersList" component={OrdersScreen} />
            <OrderStack.Screen name="OrderDetail" component={OrderDetailScreen} />
        </OrderStack.Navigator>
    )
}

function CourierTabs({ courier, onLogout, onCourierUpdate }: { courier: any; onLogout: () => void; onCourierUpdate: (c: any) => void }) {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
                        Ana: "grid-outline",
                        Teslimat: "bicycle-outline",
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
                {(props) => <DashboardScreen {...props} courier={courier} />}
            </Tab.Screen>
            <Tab.Screen name="Teslimat" component={DeliveryStack} options={{ title: "Teslimatlar" }} />
            <Tab.Screen name="Ayarlar">
                {(props) => <SettingsScreen {...props} courier={courier} onLogout={onLogout} onCourierUpdate={onCourierUpdate} />}
            </Tab.Screen>
        </Tab.Navigator>
    )
}

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [courier, setCourier] = useState<any>(null)
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
            pendingNavigation.current = { orderId }
            return
        }
        try {
            navigationRef.current.navigate("Teslimat", {
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

            if (data?.type === "order_confirmed" && data?.order_id) {
                navigateToOrder(data.order_id as string)
            }
        })

        // Uygulama kapalıyken bildirime tıklanarak açıldıysa
        Notifications.getLastNotificationResponseAsync().then(response => {
            if (response) {
                const data = response.notification.request.content.data
                if (data?.type === "order_confirmed" && data?.order_id) {
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
            setTimeout(() => navigateToOrder(orderId), 500)
        }
    }, [isLoggedIn, isNavigationReady])

    const handleLogin = async (courierData: any) => {
        setCourier(courierData)
        setIsLoggedIn(true)

        // Push notification token'ı al ve backend'e kaydet
        const pushToken = await registerForPushNotificationsAsync()
        if (pushToken && courierData?.id) {
            await savePushTokenToBackend(courierData.id, pushToken)
        }
    }

    const handleLogout = async () => {
        // Logout olurken push token'ı backend'den sil
        if (courier?.id) {
            await removePushTokenFromBackend(courier.id)
        }
        setIsLoggedIn(false)
        setCourier(null)
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
                <CourierTabs courier={courier} onLogout={handleLogout} onCourierUpdate={setCourier} />
            </NavigationContainer>
        </>
    )
}
