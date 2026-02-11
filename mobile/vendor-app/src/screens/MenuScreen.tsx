import React, { useEffect, useState, useCallback } from "react"
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    RefreshControl, ActivityIndicator, Alert, TextInput, Switch, Modal,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { colors, spacing, radius, typography } from "../theme/tokens"
import {
    getVendorProducts, createVendorProduct, updateVendorProduct,
    deleteVendorProduct, getCurrentVendorId,
} from "../api/client"

export default function MenuScreen() {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState<any>(null)

    // Form state
    const [name, setName] = useState("")
    const [price, setPrice] = useState("")
    const [category, setCategory] = useState("")
    const [description, setDescription] = useState("")
    const [isAvailable, setIsAvailable] = useState(true)

    const loadProducts = useCallback(async () => {
        try {
            const data = await getVendorProducts()
            setProducts(data || [])
        } catch (err) {
            console.log("Menü yükleme hatası:", err)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [])

    useEffect(() => { loadProducts() }, [loadProducts])

    const onRefresh = () => { setRefreshing(true); loadProducts() }

    const openAdd = () => {
        setEditing(null)
        setName(""); setPrice(""); setCategory(""); setDescription(""); setIsAvailable(true)
        setShowModal(true)
    }

    const openEdit = (item: any) => {
        setEditing(item)
        setName(item.name || "")
        setPrice(String(item.price || ""))
        setCategory(item.category || "")
        setDescription(item.description || "")
        setIsAvailable(item.is_available ?? true)
        setShowModal(true)
    }

    const handleSave = async () => {
        if (!name.trim()) { Alert.alert("Hata", "Ürün adı gerekli"); return }
        if (!price.trim()) { Alert.alert("Hata", "Fiyat gerekli"); return }

        try {
            const payload = {
                vendor_id: getCurrentVendorId(),
                name: name.trim(),
                price: Number(price),
                category: category.trim() || null,
                description: description.trim() || null,
                is_available: isAvailable,
            }
            if (editing) {
                await updateVendorProduct(editing.id, payload)
            } else {
                await createVendorProduct(payload)
            }
            setShowModal(false)
            loadProducts()
        } catch (err) {
            Alert.alert("Hata", "Ürün kaydedilemedi")
        }
    }

    const handleDelete = (item: any) => {
        Alert.alert("Ürünü Sil", `"${item.name}" silinecek. Emin misiniz?`, [
            { text: "Vazgeç", style: "cancel" },
            {
                text: "Sil", style: "destructive", onPress: async () => {
                    try {
                        await deleteVendorProduct(item.id)
                        loadProducts()
                    } catch (err) {
                        Alert.alert("Hata", "Ürün silinemedi")
                    }
                },
            },
        ])
    }

    const toggleAvailability = async (item: any) => {
        try {
            await updateVendorProduct(item.id, { is_available: !item.is_available })
            loadProducts()
        } catch (err) {
            Alert.alert("Hata", "Durum güncellenemedi")
        }
    }

    // Kategoriye göre grupla
    const grouped = products.reduce((acc: Record<string, any[]>, p: any) => {
        const cat = p.category || "Diğer"
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(p)
        return acc
    }, {})

    const renderProduct = (item: any) => (
        <View key={item.id} style={s.productCard}>
            <View style={s.productMain}>
                <View style={{ flex: 1 }}>
                    <Text style={[s.productName, !item.is_available && s.productDisabled]}>{item.name}</Text>
                    {item.description && <Text style={s.productDesc}>{item.description}</Text>}
                </View>
                <Text style={s.productPrice}>₺{item.price}</Text>
            </View>
            <View style={s.productActions}>
                <TouchableOpacity onPress={() => toggleAvailability(item)} style={s.toggleRow}>
                    <View style={[s.toggleDot, item.is_available ? s.toggleOn : s.toggleOff]} />
                    <Text style={s.toggleText}>{item.is_available ? "Satışta" : "Kapalı"}</Text>
                </TouchableOpacity>
                <View style={s.actionBtns}>
                    <TouchableOpacity onPress={() => openEdit(item)} style={s.actionBtn}>
                        <Ionicons name="create-outline" size={18} color={colors.fg.subtle} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item)} style={s.actionBtn}>
                        <Ionicons name="trash-outline" size={18} color={colors.tag.red.fg} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )

    return (
        <SafeAreaView style={s.container} edges={["top"]}>
            {/* Header */}
            <View style={s.header}>
                <View>
                    <Text style={s.title}>Menü</Text>
                    <Text style={s.subtitle}>{products.length} ürün</Text>
                </View>
                <TouchableOpacity style={s.addBtn} onPress={openAdd} activeOpacity={0.8}>
                    <Ionicons name="add" size={20} color={colors.fg.on_color} />
                    <Text style={s.addBtnText}>Ekle</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={colors.interactive} style={{ flex: 1 }} />
            ) : (
                <FlatList
                    data={Object.entries(grouped)}
                    keyExtractor={([cat]) => cat}
                    contentContainerStyle={s.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.interactive} />}
                    renderItem={({ item: [category, items] }) => (
                        <View style={s.categorySection}>
                            <Text style={s.categoryTitle}>{category}</Text>
                            {(items as any[]).map(renderProduct)}
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={s.empty}>
                            <Ionicons name="fast-food-outline" size={48} color={colors.fg.disabled} />
                            <Text style={s.emptyText}>Henüz ürün eklenmemiş</Text>
                            <TouchableOpacity style={s.emptyBtn} onPress={openAdd}>
                                <Text style={s.emptyBtnText}>İlk Ürünü Ekle</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}

            {/* Add/Edit Modal */}
            <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
                <SafeAreaView style={s.modalContainer}>
                    <View style={s.modalHeader}>
                        <TouchableOpacity onPress={() => setShowModal(false)}>
                            <Text style={s.modalCancel}>İptal</Text>
                        </TouchableOpacity>
                        <Text style={s.modalTitle}>{editing ? "Ürünü Düzenle" : "Yeni Ürün"}</Text>
                        <TouchableOpacity onPress={handleSave}>
                            <Text style={s.modalSave}>Kaydet</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={s.modalBody}>
                        <View style={s.field}>
                            <Text style={s.fieldLabel}>Ürün Adı *</Text>
                            <TextInput style={s.fieldInput} value={name} onChangeText={setName} placeholder="örn: Adana Kebap" placeholderTextColor={colors.fg.muted} />
                        </View>
                        <View style={s.field}>
                            <Text style={s.fieldLabel}>Fiyat (₺) *</Text>
                            <TextInput style={s.fieldInput} value={price} onChangeText={setPrice} placeholder="0" keyboardType="numeric" placeholderTextColor={colors.fg.muted} />
                        </View>
                        <View style={s.field}>
                            <Text style={s.fieldLabel}>Kategori</Text>
                            <TextInput style={s.fieldInput} value={category} onChangeText={setCategory} placeholder="örn: Ana Yemek" placeholderTextColor={colors.fg.muted} />
                        </View>
                        <View style={s.field}>
                            <Text style={s.fieldLabel}>Açıklama</Text>
                            <TextInput style={[s.fieldInput, { height: 80, textAlignVertical: "top" }]} value={description} onChangeText={setDescription} placeholder="Ürün açıklaması..." multiline placeholderTextColor={colors.fg.muted} />
                        </View>
                        <View style={s.switchRow}>
                            <Text style={s.fieldLabel}>Satışta</Text>
                            <Switch value={isAvailable} onValueChange={setIsAvailable} trackColor={{ true: colors.interactive, false: colors.border.base }} />
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    )
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg.subtle },
    header: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingHorizontal: spacing.lg, paddingVertical: spacing.lg,
        backgroundColor: colors.bg.base, borderBottomWidth: 1, borderBottomColor: colors.border.base,
    },
    title: { ...typography.h1 },
    subtitle: { ...typography.small, marginTop: 2 },
    addBtn: {
        flexDirection: "row", alignItems: "center", gap: spacing.xs,
        backgroundColor: colors.interactive, borderRadius: radius.md,
        paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    },
    addBtnText: { fontSize: 14, fontWeight: "600", color: colors.fg.on_color },
    list: { padding: spacing.lg, paddingBottom: 100 },
    categorySection: { marginBottom: spacing.xxl },
    categoryTitle: { ...typography.h3, color: colors.fg.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: spacing.md },
    productCard: {
        backgroundColor: colors.bg.base, borderRadius: radius.md,
        padding: spacing.lg, marginBottom: spacing.sm,
        borderWidth: 1, borderColor: colors.border.base,
    },
    productMain: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    productName: { ...typography.h3 },
    productDisabled: { color: colors.fg.muted, textDecorationLine: "line-through" },
    productDesc: { ...typography.small, marginTop: 2 },
    productPrice: { ...typography.h2, color: colors.interactive },
    productActions: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        marginTop: spacing.md, paddingTop: spacing.md,
        borderTopWidth: 1, borderTopColor: colors.border.base,
    },
    toggleRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
    toggleDot: { width: 8, height: 8, borderRadius: 4 },
    toggleOn: { backgroundColor: colors.tag.green.fg },
    toggleOff: { backgroundColor: colors.fg.muted },
    toggleText: { ...typography.caption },
    actionBtns: { flexDirection: "row", gap: spacing.md },
    actionBtn: { padding: spacing.xs },
    empty: { alignItems: "center", paddingTop: 80, gap: spacing.md },
    emptyText: { ...typography.body, color: colors.fg.muted },
    emptyBtn: {
        backgroundColor: colors.interactive, borderRadius: radius.md,
        paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, marginTop: spacing.sm,
    },
    emptyBtnText: { color: colors.fg.on_color, fontWeight: "600", fontSize: 14 },
    // Modal
    modalContainer: { flex: 1, backgroundColor: colors.bg.base },
    modalHeader: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
        borderBottomWidth: 1, borderBottomColor: colors.border.base,
    },
    modalCancel: { ...typography.body, color: colors.fg.muted },
    modalTitle: { ...typography.h2 },
    modalSave: { ...typography.body, color: colors.interactive, fontWeight: "600" },
    modalBody: { padding: spacing.lg, gap: spacing.lg },
    field: { gap: spacing.xs },
    fieldLabel: { ...typography.label },
    fieldInput: {
        backgroundColor: colors.bg.field, borderRadius: radius.md,
        borderWidth: 1, borderColor: colors.border.base,
        paddingHorizontal: spacing.md, paddingVertical: spacing.md,
        fontSize: 15, color: colors.fg.base,
    },
    switchRow: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingVertical: spacing.sm,
    },
})
