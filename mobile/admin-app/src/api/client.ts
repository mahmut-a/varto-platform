import axios from "axios"
import Constants from "expo-constants"

const VPS_URL = "http://173.212.246.83"

// Expo Dev Server'ın IP adresini otomatik al
// Expo Go uygulamasında çalışırken debuggerHost üzerinden bulunur
const getBaseUrl = () => {
    // Production build → VPS backend
    if (!__DEV__) return VPS_URL
    // Development → local backend via Expo debuggerHost
    const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost
    if (debuggerHost) {
        const host = debuggerHost.split(":")[0]
        return `http://${host}:9000`
    }
    // Fallback
    return "http://localhost:9000"
}

const BASE_URL = getBaseUrl()

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
})

let authToken: string | null = null

export const setAuthToken = (token: string) => {
    authToken = token
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`
}

export const getApiBaseUrl = () => BASE_URL

// ── Auth ──
export const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/user/emailpass", { email, password })
    const token = data.token
    if (!token) throw new Error("No token received")
    setAuthToken(token)
    return data
}

// ── Vendors ──
export const getVendors = async () => {
    const { data } = await api.get("/admin/vendors")
    return data.vendors
}

export const getVendor = async (id: string) => {
    const { data } = await api.get(`/admin/vendors/${id}`)
    return data.vendor
}

export const createVendor = async (vendorData: any) => {
    const { data } = await api.post("/admin/vendors", vendorData)
    return data.vendor
}

export const updateVendor = async (id: string, vendorData: any) => {
    const { data } = await api.post(`/admin/vendors/${id}`, vendorData)
    return data.vendor
}

export const deleteVendor = async (id: string) => {
    await api.delete(`/admin/vendors/${id}`)
}

// ── Couriers ──
export const getCouriers = async () => {
    const { data } = await api.get("/admin/couriers")
    return data.couriers
}

export const createCourier = async (courierData: any) => {
    const { data } = await api.post("/admin/couriers", courierData)
    return data.courier
}

export const updateCourier = async (id: string, courierData: any) => {
    const { data } = await api.post(`/admin/couriers/${id}`, courierData)
    return data.courier
}

export const deleteCourier = async (id: string) => {
    await api.delete(`/admin/couriers/${id}`)
}

// ── Listings ──
export const getListings = async () => {
    const { data } = await api.get("/admin/listings")
    return data.listings
}

export const createListing = async (listingData: any) => {
    const { data } = await api.post("/admin/listings", listingData)
    return data.listing
}

export const updateListing = async (id: string, listingData: any) => {
    const { data } = await api.post(`/admin/listings/${id}`, listingData)
    return data.listing
}

export const deleteListing = async (id: string) => {
    await api.delete(`/admin/listings/${id}`)
}

// ── VartoOrders ──
export const getVartoOrders = async () => {
    const { data } = await api.get("/admin/varto-orders")
    return data.varto_orders
}

export const getVartoOrder = async (id: string) => {
    const { data } = await api.get(`/admin/varto-orders/${id}`)
    return data.varto_order
}

export const updateVartoOrder = async (id: string, orderData: any) => {
    const { data } = await api.post(`/admin/varto-orders/${id}`, orderData)
    return data.varto_order
}

export const deleteVartoOrder = async (id: string) => {
    await api.delete(`/admin/varto-orders/${id}`)
}

// ── Order Items ──
export const getOrderItems = async (orderId: string) => {
    const { data } = await api.get(`/admin/varto-orders/${orderId}/items`)
    return data.varto_order_items
}

export const createOrderItem = async (orderId: string, itemData: any) => {
    const { data } = await api.post(`/admin/varto-orders/${orderId}/items`, itemData)
    return data.varto_order_item
}

export const deleteOrderItem = async (orderId: string, itemId: string) => {
    await api.delete(`/admin/varto-orders/${orderId}/items/${itemId}`)
}

// ── Appointments ──
export const getAppointments = async () => {
    const { data } = await api.get("/admin/appointments")
    return data.appointments
}

export const createAppointment = async (appointmentData: any) => {
    const { data } = await api.post("/admin/appointments", appointmentData)
    return data.appointment
}

export const updateAppointment = async (id: string, appointmentData: any) => {
    const { data } = await api.post(`/admin/appointments/${id}`, appointmentData)
    return data.appointment
}

export const deleteAppointment = async (id: string) => {
    await api.delete(`/admin/appointments/${id}`)
}

export default api
