import axios from "axios"
import Constants from "expo-constants"

const VPS_URL = "https://api.vartoyazilim.com"

const getBaseUrl = () => {
    // Production build → VPS backend
    if (!__DEV__) return VPS_URL
    // Development → local backend via Expo debuggerHost
    const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost
    if (debuggerHost) {
        const host = debuggerHost.split(":")[0]
        return `http://${host}:9000`
    }
    return "http://localhost:9000"
}

const BASE_URL = getBaseUrl()

const PUBLISHABLE_API_KEY = "pk_a4f8a56d304ae736b3c551d0ba44c0b22424fb404e4ad251d52828dc3b9efed5"

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": PUBLISHABLE_API_KEY,
    },
})

let customerToken: string | null = null

export const setCustomerToken = (token: string | null) => {
    customerToken = token
    if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`
    } else {
        delete api.defaults.headers.common["Authorization"]
    }
}

export const getCustomerToken = () => customerToken
export const getApiBaseUrl = () => BASE_URL

// ── Auth ──
export const sendOtp = async (phone: string) => {
    const { data } = await api.post("/store/customer-auth/send-otp", { phone })
    return data
}

export const verifyOtp = async (phone: string, otp: string) => {
    const { data } = await api.post("/store/customer-auth/verify-otp", { phone, otp })
    if (data.token) setCustomerToken(data.token)
    return data
}

export const getMe = async () => {
    const { data } = await api.get("/store/customer-auth/me")
    return data.customer
}

export const updateProfile = async (profileData: any) => {
    const { data } = await api.post("/store/customer-auth/me", profileData)
    return data.customer
}

// ── Vendors ──
export const getVendors = async () => {
    const { data } = await api.get("/store/vendors")
    return data.vendors
}

export const getVendorBySlug = async (slug: string) => {
    const { data } = await api.get(`/store/vendors/${slug}`)
    return data.vendor
}

// ── Vendor Products (Menü) ──
export const getVendorProducts = async (vendorId: string) => {
    const { data } = await api.get("/store/vendor-products", {
        params: { vendor_id: vendorId, is_available: "true" },
    })
    return data.vendor_products
}

// ── Listings ──
export const getListings = async () => {
    const { data } = await api.get("/store/listings")
    return data.listings
}

export const createListing = async (listingData: any) => {
    const { data } = await api.post("/store/listings", listingData)
    return data.listing
}

// ── Orders ──
export const createOrder = async (orderData: any) => {
    const { data } = await api.post("/store/varto-orders", orderData)
    return data.varto_order
}

export const getOrder = async (id: string) => {
    const { data } = await api.get(`/store/varto-orders/${id}`)
    return data.varto_order
}

export const getCustomerOrders = async (customerId: string) => {
    const { data } = await api.get(`/store/customers/${customerId}/orders`)
    return data.varto_orders
}

// ── Appointments ──
export const getAppointments = async (customerId?: string) => {
    const params = customerId ? { customer_id: customerId } : {}
    const { data } = await api.get("/store/appointments", { params })
    return data.appointments
}

export const createAppointment = async (appointmentData: any) => {
    const { data } = await api.post("/store/appointments", appointmentData)
    return data.appointment
}

export default api
