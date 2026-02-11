import React, { useState } from "react"
import { StatusBar } from "expo-status-bar"
import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"
import { colors } from "./src/theme/tokens"
import LoginScreen from "./src/screens/LoginScreen"
import DashboardScreen from "./src/screens/DashboardScreen"
import OrdersScreen from "./src/screens/OrdersScreen"
import OrderDetailScreen from "./src/screens/OrderDetailScreen"
import MenuScreen from "./src/screens/MenuScreen"
import SettingsScreen from "./src/screens/SettingsScreen"

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

    const handleLogin = (vendorData: any) => {
        setVendor(vendorData)
        setIsLoggedIn(true)
    }

    const handleLogout = () => {
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
            <NavigationContainer>
                <VendorTabs vendor={vendor} onLogout={handleLogout} onVendorUpdate={setVendor} />
            </NavigationContainer>
        </>
    )
}
