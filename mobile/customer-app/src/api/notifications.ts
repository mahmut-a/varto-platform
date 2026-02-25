import * as Notifications from "expo-notifications"
import * as Device from "expo-device"
import { Platform } from "react-native"
import Constants from "expo-constants"
import { api } from "./client"

// ── Android bildirim kanalı oluştur ──
export async function setupNotificationChannel() {
    if (Platform.OS === "android") {
        try {
            await Notifications.deleteNotificationChannelAsync("orders")
        } catch (_) { }

        await Notifications.setNotificationChannelAsync("orders", {
            name: "Sipariş Bildirimleri",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#6366F1",
            enableVibrate: true,
            showBadge: true,
        })
    }
}

// ── Push notification izni al ve token döndür ──
export async function registerForPushNotificationsAsync(): Promise<string | null> {
    if (!Device.isDevice) {
        console.log("Push notification sadece fiziksel cihazlarda çalışır")
        return null
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
    }

    if (finalStatus !== "granted") {
        console.log("Push notification izni reddedildi")
        return null
    }

    try {
        const projectId =
            Constants?.expoConfig?.extra?.eas?.projectId ??
            Constants?.easConfig?.projectId
        if (!projectId) {
            throw new Error("Project ID not found")
        }
        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId,
        })
        console.log("Customer Expo Push Token:", tokenData.data)
        return tokenData.data
    } catch (err) {
        console.error("Push token alınamadı:", err)
        return null
    }
}

// ── Push token'ı backend'e kaydet ──
export async function savePushTokenToBackend(customerId: string, pushToken: string) {
    try {
        await api.post(`/store/customers/${customerId}/push-token`, {
            push_token: pushToken,
        })
        console.log("Customer push token backend'e kaydedildi")
    } catch (err) {
        console.error("Customer push token kaydetme hatası:", err)
    }
}

// ── Push token'ı backend'den sil (logout) ──
export async function removePushTokenFromBackend(customerId: string) {
    try {
        await api.delete(`/store/customers/${customerId}/push-token`)
        console.log("Customer push token backend'den silindi")
    } catch (err) {
        console.error("Customer push token silme hatası:", err)
    }
}

// ── Bildirim ayarları ──
export function configureNotificationHandler() {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        }),
    })
}
