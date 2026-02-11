import axios from "axios"
import Constants from "expo-constants"

const getBaseUrl = () => {
    const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost
    if (debuggerHost) {
        const host = debuggerHost.split(":")[0]
        return `http://${host}:9000`
    }
    return "http://localhost:9000"
}

const BASE_URL = getBaseUrl()

const api = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
})

export const getApiBaseUrl = () => BASE_URL

// ── Vendors ──
export const getVendors = async () => {
    const { data } = await api.get("/store/vendors")
    return data.vendors
}

export const getVendorBySlug = async (slug: string) => {
    const { data } = await api.get(`/store/vendors/${slug}`)
    return data.vendor
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
