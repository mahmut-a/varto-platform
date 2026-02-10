import React, { useState } from "react"
import { StatusBar } from "expo-status-bar"
import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"
import { colors } from "./src/theme/tokens"
import LoginScreen from "./src/screens/LoginScreen"
import DashboardScreen from "./src/screens/DashboardScreen"
import VendorsScreen from "./src/screens/VendorsScreen"
import CouriersScreen from "./src/screens/CouriersScreen"
import OrdersScreen from "./src/screens/OrdersScreen"
import ListingsScreen from "./src/screens/ListingsScreen"

const Tab = createBottomTabNavigator()

function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Dashboard: "grid-outline",
            Vendors: "storefront-outline",
            Orders: "bag-outline",
            Couriers: "bicycle-outline",
            Listings: "document-text-outline",
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
        headerStyle: { backgroundColor: colors.bg.base, elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: colors.border.base },
        headerTintColor: colors.fg.base,
        headerTitleStyle: { fontSize: 16, fontWeight: "600" },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Ana Sayfa", headerShown: false }} />
      <Tab.Screen name="Vendors" component={VendorsScreen} options={{ title: "İşletmeler" }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ title: "Siparişler" }} />
      <Tab.Screen name="Couriers" component={CouriersScreen} options={{ title: "Kuryeler" }} />
      <Tab.Screen name="Listings" component={ListingsScreen} options={{ title: "İlanlar" }} />
    </Tab.Navigator>
  )
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  if (!isLoggedIn) {
    return (
      <>
        <StatusBar style="dark" />
        <LoginScreen onLogin={() => setIsLoggedIn(true)} />
      </>
    )
  }

  return (
    <>
      <StatusBar style="dark" />
      <NavigationContainer>
        <AdminTabs />
      </NavigationContainer>
    </>
  )
}
