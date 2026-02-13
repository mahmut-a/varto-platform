import * as Notifications from "expo-notifications"
import * as Device from "expo-device"
import { Platform } from "react-native"
import Constants from "expo-constants"
import { api } from "./client"

// ── Android bildirim kanalı oluştur ──
export async function setupNotificationChannel() {
    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("orders", {
            name: "Siparişler",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#F97316",
            sound: "default",
            enableVibrate: true,
            showBadge: true,
        })
    }
}

// ── Push notification izni al ve token döndür ──
export async function registerForPushNotificationsAsync(): Promise<string | null> {
    // Fiziksel cihaz kontrolü
    if (!Device.isDevice) {
        console.log("Push notification sadece fiziksel cihazlarda çalışır")
        return null
    }

    // Mevcut izin durumunu kontrol et
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    // İzin yoksa iste
    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
    }

    if (finalStatus !== "granted") {
        console.log("Push notification izni reddedildi")
        return null
    }

    // Expo Push Token al
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
        console.log("Expo Push Token:", tokenData.data)
        return tokenData.data
    } catch (err) {
        console.error("Push token alınamadı:", err)
        return null
    }
}

// ── Push token'ı backend'e kaydet ──
export async function savePushTokenToBackend(vendorId: string, pushToken: string) {
    try {
        await api.post(`/admin/vendors/${vendorId}/push-token`, {
            push_token: pushToken,
        })
        console.log("Push token backend'e kaydedildi")
    } catch (err) {
        console.error("Push token kaydetme hatası:", err)
    }
}

// ── Push token'ı backend'den sil (logout) ──
export async function removePushTokenFromBackend(vendorId: string) {
    try {
        await api.delete(`/admin/vendors/${vendorId}/push-token`)
        console.log("Push token backend'den silindi")
    } catch (err) {
        console.error("Push token silme hatası:", err)
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
