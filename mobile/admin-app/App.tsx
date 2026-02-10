import React, { useState } from "react"
import { StatusBar } from "expo-status-bar"
import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"
import LoginScreen from "./src/screens/LoginScreen"
import DashboardScreen from "./src/screens/DashboardScreen"
import VendorsScreen from "./src/screens/VendorsScreen"
import CouriersScreen from "./src/screens/CouriersScreen"
import OrdersScreen from "./src/screens/OrdersScreen"
import ListingsScreen from "./src/screens/ListingsScreen"
import AppointmentsScreen from "./src/screens/AppointmentsScreen"

const Tab = createBottomTabNavigator()

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  if (!isLoggedIn) {
    return (
      <>
        <StatusBar style="light" />
        <LoginScreen onLogin={() => setIsLoggedIn(true)} />
      </>
    )
  }

  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap = "apps"
              if (route.name === "Dashboard") iconName = focused ? "grid" : "grid-outline"
              else if (route.name === "Vendors") iconName = focused ? "storefront" : "storefront-outline"
              else if (route.name === "Couriers") iconName = focused ? "bicycle" : "bicycle-outline"
              else if (route.name === "Orders") iconName = focused ? "cart" : "cart-outline"
              else if (route.name === "Listings") iconName = focused ? "megaphone" : "megaphone-outline"
              else if (route.name === "Appointments") iconName = focused ? "calendar" : "calendar-outline"
              return <Ionicons name={iconName} size={size} color={color} />
            },
            tabBarActiveTintColor: "#6366f1",
            tabBarInactiveTintColor: "#64748b",
            tabBarStyle: {
              backgroundColor: "#1e293b",
              borderTopColor: "#334155",
              paddingBottom: 4,
              height: 60,
            },
            headerStyle: { backgroundColor: "#0f172a" },
            headerTintColor: "#f8fafc",
            headerTitleStyle: { fontWeight: "700" },
          })}
        >
          <Tab.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ title: "Ana Sayfa", headerShown: false }}
          />
          <Tab.Screen
            name="Vendors"
            component={VendorsScreen}
            options={{ title: "İşletmeler" }}
          />
          <Tab.Screen
            name="Orders"
            component={OrdersScreen}
            options={{ title: "Siparişler" }}
          />
          <Tab.Screen
            name="Couriers"
            component={CouriersScreen}
            options={{ title: "Kuryeler" }}
          />
          <Tab.Screen
            name="Listings"
            component={ListingsScreen}
            options={{ title: "İlanlar" }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  )
}
