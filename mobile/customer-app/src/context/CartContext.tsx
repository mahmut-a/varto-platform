import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

export interface CartItem {
    product_name: string
    unit_price: number
    quantity: number
    notes: string
}

export interface VendorCart {
    vendor: any
    items: CartItem[]
}

// vendorId -> VendorCart
type CartState = Record<string, VendorCart>

interface CartContextValue {
    cart: CartState
    addItem: (vendor: any, product: { name: string; price: number | string }) => void
    removeItem: (vendorId: string, productName: string) => void
    updateQuantity: (vendorId: string, productName: string, delta: number) => void
    clearVendor: (vendorId: string) => void
    clearAll: () => void
    getCartCount: () => number
    getVendorCount: () => number
}

const STORAGE_KEY = "@varto_cart"

const CartContext = createContext<CartContextValue>({
    cart: {},
    addItem: () => { },
    removeItem: () => { },
    updateQuantity: () => { },
    clearVendor: () => { },
    clearAll: () => { },
    getCartCount: () => 0,
    getVendorCount: () => 0,
})

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartState>({})
    const [loaded, setLoaded] = useState(false)

    // Load persisted cart
    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY).then((val) => {
            if (val) {
                try { setCart(JSON.parse(val)) } catch { }
            }
            setLoaded(true)
        })
    }, [])

    // Persist on change
    useEffect(() => {
        if (loaded) {
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
        }
    }, [cart, loaded])

    const addItem = useCallback((vendor: any, product: { name: string; price: number | string }) => {
        setCart((prev) => {
            const vendorId = vendor.id
            const existing = prev[vendorId]
            const newItem: CartItem = {
                product_name: product.name,
                unit_price: Number(product.price) || 0,
                quantity: 1,
                notes: "",
            }

            if (!existing) {
                return { ...prev, [vendorId]: { vendor, items: [newItem] } }
            }

            const itemIdx = existing.items.findIndex((i) => i.product_name === product.name)
            if (itemIdx >= 0) {
                const updatedItems = [...existing.items]
                updatedItems[itemIdx] = { ...updatedItems[itemIdx], quantity: updatedItems[itemIdx].quantity + 1 }
                return { ...prev, [vendorId]: { ...existing, items: updatedItems } }
            }

            return { ...prev, [vendorId]: { ...existing, items: [...existing.items, newItem] } }
        })
    }, [])

    const removeItem = useCallback((vendorId: string, productName: string) => {
        setCart((prev) => {
            const vc = prev[vendorId]
            if (!vc) return prev
            const items = vc.items.filter((i) => i.product_name !== productName)
            if (items.length === 0) {
                const { [vendorId]: _, ...rest } = prev
                return rest
            }
            return { ...prev, [vendorId]: { ...vc, items } }
        })
    }, [])

    const updateQuantity = useCallback((vendorId: string, productName: string, delta: number) => {
        setCart((prev) => {
            const vc = prev[vendorId]
            if (!vc) return prev
            const items = vc.items
                .map((i) => i.product_name === productName ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
                .filter((i) => i.quantity > 0)
            if (items.length === 0) {
                const { [vendorId]: _, ...rest } = prev
                return rest
            }
            return { ...prev, [vendorId]: { ...vc, items } }
        })
    }, [])

    const clearVendor = useCallback((vendorId: string) => {
        setCart((prev) => {
            const { [vendorId]: _, ...rest } = prev
            return rest
        })
    }, [])

    const clearAll = useCallback(() => setCart({}), [])

    const getCartCount = useCallback(() => {
        return Object.values(cart).reduce((sum, vc) => sum + vc.items.reduce((s, i) => s + i.quantity, 0), 0)
    }, [cart])

    const getVendorCount = useCallback(() => Object.keys(cart).length, [cart])

    return (
        <CartContext.Provider value={{ cart, addItem, removeItem, updateQuantity, clearVendor, clearAll, getCartCount, getVendorCount }}>
            {loaded ? children : null}
        </CartContext.Provider>
    )
}

export const useCart = () => useContext(CartContext)
