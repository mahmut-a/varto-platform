import React, { useState, useEffect, useCallback } from "react"
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,

} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Ionicons } from "@expo/vector-icons"
import { spacing, radius } from "../theme/tokens"
import { useTheme } from "../context/ThemeContext"
import { getVendors } from "../api/client"

const FAVORITES_KEY = "@varto_favorites"

export const getFavoriteIds = async (): Promise<string[]> => {
    try {
        const json = await AsyncStorage.getItem(FAVORITES_KEY)
        return json ? JSON.parse(json) : []
    } catch {
        return []
    }
}

export const toggleFavorite = async (vendorId: string): Promise<boolean> => {
    const ids = await getFavoriteIds()
    const isFav = ids.includes(vendorId)
    const updated = isFav ? ids.filter(id => id !== vendorId) : [...ids, vendorId]
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated))
    return !isFav
}

export const isFavorite = async (vendorId: string): Promise<boolean> => {
    const ids = await getFavoriteIds()
    return ids.includes(vendorId)
}

export default function FavoritesScreen({ navigation }: any) {
    const { colors: c, typography: t } = useTheme()

    const [favorites, setFavorites] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchFavorites = useCallback(async () => {
        try {
            const favIds = await getFavoriteIds()
            if (favIds.length === 0) {
                setFavorites([])
                setLoading(false)
                return
            }
            const allVendors = await getVendors()
            const favVendors = allVendors.filter((v: any) => favIds.includes(v.id))
            setFavorites(favVendors)
        } catch (e) {
            console.error("Favorites error:", e)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        const unsubscribe = navigation?.addListener?.("focus", () => {
            fetchFavorites()
        })
        fetchFavorites()
        return unsubscribe
    }, [fetchFavorites, navigation])

    const handleRemove = async (vendorId: string) => {
        await toggleFavorite(vendorId)
        setFavorites(prev => prev.filter(v => v.id !== vendorId))
    }

    const categoryIcons: Record<string, string> = {
        restaurant: "restaurant-outline",
        cafe: "cafe-outline",
        market: "cart-outline",
        pharmacy: "medkit-outline",
        clothing: "shirt-outline",
        electronics: "hardware-chip-outline",
        other: "storefront-outline",
    }

    const renderVendor = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: c.bg.component, borderColor: c.border.base }]}
            onPress={() => navigation?.navigate?.("HomeTab", { screen: "VendorDetail", params: { vendor: item } })}
            activeOpacity={0.7}
        >
            <View style={styles.cardContent}>
                <View style={[styles.iconWrap, { backgroundColor: c.interactive + "15" }]}>
                    <Ionicons name={(categoryIcons[item.category] || "storefront-outline") as any} size={24} color={c.interactive} />
                </View>
                <View style={styles.info}>
                    <Text style={[t.h3, { marginBottom: 2 }]}>{item.name}</Text>
                    {item.address && <Text style={[t.small, { marginTop: 2 }]} numberOfLines={1}>{item.address}</Text>}
                    {item.category && (
                        <View style={[styles.categoryBadge, { backgroundColor: c.bg.subtle }]}>
                            <Text style={[t.small, { fontSize: 10, fontWeight: "600" }]}>{item.category.toUpperCase()}</Text>
                        </View>
                    )}
                </View>
                <TouchableOpacity onPress={() => handleRemove(item.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="heart" size={22} color={c.tag.red.fg} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    )

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: c.bg.base }]}>
                <ActivityIndicator size="large" color={c.interactive} />
            </View>
        )
    }

    return (
        <View style={[styles.container, { backgroundColor: c.bg.base }]}>
            {favorites.length === 0 ? (
                <View style={styles.center}>
                    <View style={[styles.emptyIcon, { backgroundColor: c.bg.subtle }]}>
                        <Ionicons name="heart-outline" size={40} color={c.fg.muted} />
                    </View>
                    <Text style={[t.h3, { marginTop: spacing.xl }]}>Favori işletmeniz yok</Text>
                    <Text style={[t.body, { marginTop: spacing.sm, textAlign: "center" }]}>
                        İşletmeleri keşfedin ve favorilerinize ekleyin
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    keyExtractor={(item) => item.id}
                    renderItem={renderVendor}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.xxxl },
    list: { padding: spacing.xl, gap: spacing.md },
    card: { borderRadius: radius.lg, borderWidth: 1, overflow: "hidden" },
    cardContent: { flexDirection: "row", alignItems: "center", padding: spacing.lg, gap: spacing.md },
    iconWrap: { width: 48, height: 48, borderRadius: radius.md, justifyContent: "center", alignItems: "center" },
    info: { flex: 1 },
    categoryBadge: { alignSelf: "flex-start", paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm, marginTop: spacing.xs },
    emptyIcon: { width: 72, height: 72, borderRadius: 36, justifyContent: "center", alignItems: "center" },
})
