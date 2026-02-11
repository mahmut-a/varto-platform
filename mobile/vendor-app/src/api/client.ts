import axios from "axios"
import Constants from "expo-constants"
import { Platform } from "react-native"

// ── Dual-mode API base ──
const LOCAL_URL = Platform.select({
    android: `http://${Constants.expoConfig?.hostUri?.split(":")[0] || "10.0.2.2"}:9000`,
    ios: "http://localhost:9000",
    default: "http://localhost:9000",
})
const VPS_URL = "http://173.212.246.83"

const BASE = __DEV__ ? LOCAL_URL : VPS_URL

const api = axios.create({ baseURL: BASE, timeout: 15000 })

// ── Auth state ──
let authToken: string | null = null
let currentVendorId: string | null = null

api.interceptors.request.use((cfg) => {
    if (authToken) cfg.headers.Authorization = `Bearer ${authToken}`
    return cfg
})

export const setAuthToken = (token: string) => { authToken = token }
export const setCurrentVendorId = (id: string) => { currentVendorId = id }
export const getCurrentVendorId = () => currentVendorId

// ── Auth ──
export const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/user/emailpass", { email, password })
    authToken = data.token
    return data
}

// ── Vendor Profile ──
export const getVendors = async () => {
    const { data } = await api.get("/admin/vendors")
    return data.vendors
}

export const getVendorById = async (id: string) => {
    const { data } = await api.get(`/admin/vendors/${id}`)
    return data.vendor
}

export const updateVendor = async (id: string, payload: any) => {
    const { data } = await api.post(`/admin/vendors/${id}`, payload)
    return data.vendor
}

// ── Orders ──
export const getVendorOrders = async (vendorId?: string) => {
    const vid = vendorId || currentVendorId
    const { data } = await api.get("/admin/varto-orders", {
        params: vid ? { vendor_id: vid } : {},
    })
    return data.varto_orders
}

export const updateOrderStatus = async (orderId: string, status: string) => {
    const { data } = await api.post(`/admin/varto-orders/${orderId}`, { status })
    return data.varto_order
}

// ── Vendor Products (Menu) ──
export const getVendorProducts = async (vendorId?: string) => {
    const vid = vendorId || currentVendorId
    const { data } = await api.get("/admin/vendor-products", {
        params: vid ? { vendor_id: vid } : {},
    })
    return data.vendor_products
}

export const createVendorProduct = async (productData: any) => {
    const { data } = await api.post("/admin/vendor-products", productData)
    return data.vendor_product
}

export const updateVendorProduct = async (id: string, productData: any) => {
    const { data } = await api.post(`/admin/vendor-products/${id}`, productData)
    return data.vendor_product
}

export const deleteVendorProduct = async (id: string) => {
    await api.delete(`/admin/vendor-products/${id}`)
}
