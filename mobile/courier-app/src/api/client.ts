import axios from "axios"
import Constants from "expo-constants"
import { Platform } from "react-native"

const VPS_URL = "https://api.vartoyazilim.com"

// Local backend kullanmak istiyorsanız true yapın
const USE_LOCAL_BACKEND = false

const getBaseUrl = () => {
    if (USE_LOCAL_BACKEND && __DEV__) {
        return Platform.select({
            android: `http://${Constants.expoConfig?.hostUri?.split(":")[0] || "10.0.2.2"}:9000`,
            ios: "http://localhost:9000",
            default: "http://localhost:9000",
        })
    }
    return VPS_URL
}

const BASE = getBaseUrl()

export const api = axios.create({ baseURL: BASE, timeout: 15000 })

// ── Auth state ──
let authToken: string | null = null
let currentCourierId: string | null = null

api.interceptors.request.use((cfg) => {
    if (authToken) cfg.headers.Authorization = `Bearer ${authToken}`
    return cfg
})

export const setAuthToken = (token: string) => { authToken = token }
export const setCurrentCourierId = (id: string) => { currentCourierId = id }
export const getCurrentCourierId = () => currentCourierId

// ── Auth ──
export const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/user/emailpass", { email, password })
    authToken = data.token
    return data
}

/**
 * Login olan admin user'ın bilgilerini al
 */
export const getMe = async () => {
    const { data } = await api.get("/admin/users/me")
    return data.user
}

/**
 * Admin user ID ile bağlı courier'ı bul
 */
export const getCourierByUserId = async (userId: string) => {
    const { data } = await api.get("/admin/couriers/by-user", {
        params: { user_id: userId },
    })
    return data.courier
}

// ── Courier Profile ──
export const getCouriers = async () => {
    const { data } = await api.get("/admin/couriers")
    return data.couriers
}

export const getCourierById = async (id: string) => {
    const { data } = await api.get(`/admin/couriers/${id}`)
    return data.courier
}

export const updateCourier = async (id: string, payload: any) => {
    const { data } = await api.post(`/admin/couriers/${id}`, payload)
    return data.courier
}

// ── Orders ──
export const getAllOrders = async () => {
    const { data } = await api.get("/admin/varto-orders")
    return data.varto_orders
}

export const getOrderById = async (orderId: string) => {
    const { data } = await api.get(`/admin/varto-orders/${orderId}`)
    return data.varto_order
}

export const updateOrderStatus = async (orderId: string, status: string) => {
    const { data } = await api.post(`/admin/varto-orders/${orderId}`, { varto_status: status })
    return data.varto_order
}

export const assignCourierToOrder = async (orderId: string, courierId: string) => {
    const { data } = await api.post(`/admin/varto-orders/${orderId}`, {
        courier_id: courierId,
        varto_status: "assigned",
    })
    return data.varto_order
}

export const acceptOrder = async (orderId: string) => {
    const { data } = await api.post(`/admin/varto-orders/${orderId}`, {
        varto_status: "accepted",
    })
    return data.varto_order
}

export const startDelivery = async (orderId: string) => {
    const { data } = await api.post(`/admin/varto-orders/${orderId}`, {
        varto_status: "delivering",
    })
    return data.varto_order
}

export const completeDelivery = async (orderId: string) => {
    const { data } = await api.post(`/admin/varto-orders/${orderId}`, {
        varto_status: "delivered",
    })
    return data.varto_order
}

// ── Vendors ──
export const getVendorById = async (id: string) => {
    const { data } = await api.get(`/admin/vendors/${id}`)
    return data.vendor
}
