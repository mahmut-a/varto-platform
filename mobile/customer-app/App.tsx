import React from "react"
import { useColorScheme } from "react-native"
import { StatusBar } from "expo-status-bar"
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { getColors } from "./src/theme/tokens"

import HomeScreen from "./src/screens/HomeScreen"
import VendorDetailScreen from "./src/screens/VendorDetailScreen"
import CartScreen from "./src/screens/CartScreen"
import OrderTrackingScreen from "./src/screens/OrderTrackingScreen"
import ListingsScreen from "./src/screens/ListingsScreen"

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function HomeStack() {
    const c = getColors()
    return (
        <Stack.Navigator screenOptions={{
            headerStyle: { backgroundColor: c.bg.base },
            headerTintColor: c.fg.base,
            headerShadowVisible: false,
            headerTitleStyle: { fontWeight: "600", fontSize: 16 },
        }}>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: "İşletmeler" }} />
            <Stack.Screen name="VendorDetail" component={VendorDetailScreen} options={({ route }: any) => ({ title: route.params?.vendor?.name || "İşletme" })} />
        </Stack.Navigator>
    )
}

function CartStack() {
    const c = getColors()
    return (
        <Stack.Navigator screenOptions={{
            headerStyle: { backgroundColor: c.bg.base },
            headerTintColor: c.fg.base,
            headerShadowVisible: false,
            headerTitleStyle: { fontWeight: "600", fontSize: 16 },
        }}>
            <Stack.Screen name="Cart" component={CartScreen} options={{ title: "Sepet" }} />
        </Stack.Navigator>
    )
}

function OrdersStack() {
    const c = getColors()
    return (
        <Stack.Navigator screenOptions={{
            headerStyle: { backgroundColor: c.bg.base },
            headerTintColor: c.fg.base,
            headerShadowVisible: false,
            headerTitleStyle: { fontWeight: "600", fontSize: 16 },
        }}>
            <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} options={{ title: "Siparişlerim" }} />
        </Stack.Navigator>
    )
}

function ListingsStack() {
    const c = getColors()
    return (
        <Stack.Navigator screenOptions={{
            headerStyle: { backgroundColor: c.bg.base },
            headerTintColor: c.fg.base,
            headerShadowVisible: false,
            headerTitleStyle: { fontWeight: "600", fontSize: 16 },
        }}>
            <Stack.Screen name="Listings" component={ListingsScreen} options={{ title: "İlanlar" }} />
        </Stack.Navigator>
    )
}

export default function App() {
    const scheme = useColorScheme()
    const c = getColors()

    const MedusaTheme = {
        ...(scheme === "dark" ? DarkTheme : DefaultTheme),
        colors: {
            ...(scheme === "dark" ? DarkTheme.colors : DefaultTheme.colors),
            primary: c.interactive,
            background: c.bg.base,
            card: c.bg.base,
            text: c.fg.base,
            border: c.border.base,
        },
    }

    return (
        <SafeAreaProvider>
            <NavigationContainer theme={MedusaTheme}>
                <Tab.Navigator
                    screenOptions={({ route }) => ({
                        headerShown: false,
                        tabBarStyle: { backgroundColor: c.bg.base, borderTopColor: c.border.base },
                        tabBarActiveTintColor: c.interactive,
                        tabBarInactiveTintColor: c.fg.muted,
                        tabBarLabelStyle: { fontSize: 11, fontWeight: "500" },
                        tabBarIcon: ({ color, size }) => {
                            const icons: Record<string, string> = {
                                HomeTab: "storefront-outline",
                                ListingsTab: "document-text-outline",
                                CartTab: "bag-outline",
                                OrdersTab: "receipt-outline",
                            }
                            return <Ionicons name={(icons[route.name] || "ellipse-outline") as any} size={size} color={color} />
                        },
                    })}
                >
                    <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: "İşletmeler" }} />
                    <Tab.Screen name="ListingsTab" component={ListingsStack} options={{ title: "İlanlar" }} />
                    <Tab.Screen name="CartTab" component={CartStack} options={{ title: "Sepet" }} />
                    <Tab.Screen name="OrdersTab" component={OrdersStack} options={{ title: "Siparişlerim" }} />
                </Tab.Navigator>
            </NavigationContainer>
            <StatusBar style={scheme === "dark" ? "light" : "dark"} />
        </SafeAreaProvider>
    )
}
