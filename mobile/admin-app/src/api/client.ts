import axios from "axios"

// Android emülatörde localhost yerine 10.0.2.2 kullanılır
// Fiziksel cihazda bilgisayarın IP adresini kullanın
const BASE_URL = "http://10.0.2.2:9000"

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

let authToken: string | null = null

export const setAuthToken = (token: string) => {
    authToken = token
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`
}

// ── Auth ──
export const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/user/emailpass", { email, password })
    setAuthToken(data.token)
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

export const updateListing = async (id: string, listingData: any) => {
    const { data } = await api.post(`/admin/listings/${id}`, listingData)
    return data.listing
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

// ── Appointments ──
export const getAppointments = async () => {
    const { data } = await api.get("/admin/appointments")
    return data.appointments
}

export default api
