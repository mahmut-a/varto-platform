import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    Modal,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Switch,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { colors, spacing, radius, typography } from "../theme/tokens"
import { getVendors, createVendor, updateVendor, deleteVendor } from "../api/client"

const CATEGORIES = [
    { value: "restaurant", label: "Restoran" },
    { value: "market", label: "Market" },
    { value: "pharmacy", label: "Eczane" },
    { value: "stationery", label: "Kırtasiye" },
    { value: "barber", label: "Berber" },
    { value: "other", label: "Diğer" },
]
const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label]))

const slugify = (t: string) =>
    t.toLowerCase().replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

const emptyForm = { name: "", slug: "", phone: "", address: "", iban: "", category: "restaurant", is_active: true, email: "", description: "" }

export default function VendorsScreen() {
    const [vendors, setVendors] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [editing, setEditing] = useState<any>(null)
    const [form, setForm] = useState({ ...emptyForm })
    const [saving, setSaving] = useState(false)
    const [catPickerOpen, setCatPickerOpen] = useState(false)

    const fetchVendors = async () => {
        try { const data = await getVendors(); setVendors(data || []) }
        catch { } finally { setLoading(false); setRefreshing(false) }
    }

    useEffect(() => { fetchVendors() }, [])

    const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setModalVisible(true) }
    const openEdit = (v: any) => {
        setEditing(v)
        setForm({
            name: v.name, slug: v.slug || "", phone: v.phone || "", address: v.address || "",
            iban: v.iban || "", category: v.category || "restaurant", is_active: v.is_active ?? true,
            email: v.email || "", description: v.description || "",
        })
        setModalVisible(true)
    }

    const handleSave = async () => {
        if (!form.name || !form.phone || !form.address || !form.iban) {
            Alert.alert("Hata", "İsim, Telefon, Adres ve IBAN zorunludur.")
            return
        }
        setSaving(true)
        try {
            const payload: any = { ...form, slug: form.slug || slugify(form.name) }
            if (!payload.email) payload.email = null
            if (!payload.description) payload.description = null
            if (editing) await updateVendor(editing.id, payload)
            else await createVendor(payload)
            setModalVisible(false)
            fetchVendors()
        } catch (e: any) {
            Alert.alert("Hata", e?.response?.data?.message || "Kayıt başarısız.")
        } finally { setSaving(false) }
    }

    const toggleActive = async (id: string, value: boolean) => {
        try {
            await updateVendor(id, { is_active: value })
            setVendors((prev) => prev.map((v) => v.id === id ? { ...v, is_active: value } : v))
        } catch { Alert.alert("Hata", "Güncelleme başarısız.") }
    }

    const handleDelete = (id: string, name: string) => {
        Alert.alert("Sil", `"${name}" silinecek. Emin misiniz?`, [
            { text: "İptal", style: "cancel" },
            {
                text: "Sil", style: "destructive", onPress: async () => {
                    try { await deleteVendor(id); setVendors((prev) => prev.filter((v) => v.id !== id)) }
                    catch { Alert.alert("Hata", "Silme başarısız.") }
                }
            },
        ])
    }

    const setName = (name: string) => {
        if (editing) setForm({ ...form, name })
        else setForm({ ...form, name, slug: slugify(name) })
    }

    if (loading) return <View style={styles.center}><ActivityIndicator size="small" color={colors.fg.muted} /></View>

    return (
        <View style={styles.container}>
            <FlatList
                data={vendors}
                keyExtractor={(item) => item.id}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchVendors() }} tintColor={colors.fg.muted} />}
                contentContainerStyle={{ padding: spacing.xl, paddingBottom: 80 }}
                ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.name}>{item.name}</Text>
                                <Text style={styles.meta}>{CATEGORY_MAP[item.category] || item.category}</Text>
                            </View>
                            <View style={[styles.tag, item.is_active ? styles.tagGreen : styles.tagRed]}>
                                <Text style={[styles.tagText, { color: item.is_active ? colors.tag.green.fg : colors.tag.red.fg }]}>
                                    {item.is_active ? "Aktif" : "Pasif"}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.detailRow}>
                            <Ionicons name="call-outline" size={14} color={colors.fg.muted} />
                            <Text style={styles.detail}>{item.phone}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Ionicons name="location-outline" size={14} color={colors.fg.muted} />
                            <Text style={styles.detail} numberOfLines={1}>{item.address}</Text>
                        </View>
                        {item.iban && (
                            <View style={styles.detailRow}>
                                <Ionicons name="card-outline" size={14} color={colors.fg.muted} />
                                <Text style={styles.detail}>...{item.iban.slice(-4)}</Text>
                            </View>
                        )}

                        {/* Inline Active Toggle */}
                        <View style={styles.toggleSection}>
                            <View style={styles.toggleRow}>
                                <Text style={styles.toggleLabel}>Aktif</Text>
                                <Switch value={item.is_active} onValueChange={(v) => toggleActive(item.id, v)} trackColor={{ false: colors.border.base, true: colors.interactive }} thumbColor="#fff" />
                            </View>
                        </View>

                        <View style={styles.actions}>
                            <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                                <Ionicons name="create-outline" size={14} color={colors.interactive} />
                                <Text style={styles.editText}>Düzenle</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id, item.name)}>
                                <Ionicons name="trash-outline" size={14} color={colors.tag.red.fg} />
                                <Text style={styles.deleteText}>Sil</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>Henüz işletme yok</Text></View>}
            />

            <TouchableOpacity style={styles.fab} onPress={openCreate} activeOpacity={0.85}>
                <Ionicons name="add" size={28} color={colors.fg.on_color} />
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={styles.modalCancel}>İptal</Text></TouchableOpacity>
                        <Text style={styles.modalTitle}>{editing ? "İşletme Düzenle" : "Yeni İşletme"}</Text>
                        <TouchableOpacity onPress={handleSave} disabled={saving}><Text style={[styles.modalSave, saving && { opacity: 0.5 }]}>{saving ? "..." : "Kaydet"}</Text></TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={styles.formContent}>
                        <Text style={styles.inputLabel}>İsim *</Text>
                        <TextInput style={styles.input} value={form.name} onChangeText={setName} placeholder="İşletme adı" placeholderTextColor={colors.fg.muted} />

                        <Text style={styles.inputLabel}>Slug</Text>
                        <TextInput style={styles.input} value={form.slug} onChangeText={(v) => setForm({ ...form, slug: v })} placeholder="isletme-adi" placeholderTextColor={colors.fg.muted} />

                        <Text style={styles.inputLabel}>Telefon *</Text>
                        <TextInput style={styles.input} value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} placeholder="05XX XXX XXXX" keyboardType="phone-pad" placeholderTextColor={colors.fg.muted} />

                        <Text style={styles.inputLabel}>E-posta</Text>
                        <TextInput style={styles.input} value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} placeholder="info@isletme.com" keyboardType="email-address" placeholderTextColor={colors.fg.muted} />

                        <Text style={styles.inputLabel}>Adres *</Text>
                        <TextInput style={styles.input} value={form.address} onChangeText={(v) => setForm({ ...form, address: v })} placeholder="Adres" placeholderTextColor={colors.fg.muted} />

                        <Text style={styles.inputLabel}>IBAN *</Text>
                        <TextInput style={styles.input} value={form.iban} onChangeText={(v) => setForm({ ...form, iban: v })} placeholder="TR00 0000 0000 0000 0000 0000 00" placeholderTextColor={colors.fg.muted} />

                        <Text style={styles.inputLabel}>Açıklama</Text>
                        <TextInput style={[styles.input, { height: 70, textAlignVertical: "top" }]} value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} placeholder="İşletme hakkında" multiline placeholderTextColor={colors.fg.muted} />

                        <Text style={styles.inputLabel}>Kategori</Text>
                        <TouchableOpacity style={styles.input} onPress={() => setCatPickerOpen(true)}>
                            <Text style={{ color: colors.fg.base }}>{CATEGORY_MAP[form.category]}</Text>
                        </TouchableOpacity>

                        <View style={styles.formToggleRow}>
                            <Text style={styles.toggleLabel}>Aktif</Text>
                            <Switch value={form.is_active} onValueChange={(v) => setForm({ ...form, is_active: v })} trackColor={{ false: colors.border.base, true: colors.interactive }} thumbColor="#fff" />
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

                <Modal visible={catPickerOpen} transparent animationType="fade" onRequestClose={() => setCatPickerOpen(false)}>
                    <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setCatPickerOpen(false)}>
                        <View style={styles.pickerContent}>
                            {CATEGORIES.map((c) => (
                                <TouchableOpacity key={c.value} style={styles.pickerItem} onPress={() => { setForm({ ...form, category: c.value }); setCatPickerOpen(false) }}>
                                    <Text style={[styles.pickerItemText, form.category === c.value && { color: colors.interactive, fontWeight: "600" }]}>{c.label}</Text>
                                    {form.category === c.value && <Ionicons name="checkmark" size={18} color={colors.interactive} />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </TouchableOpacity>
                </Modal>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg.base },
    center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg.base },
    card: { backgroundColor: colors.bg.base, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border.base, padding: spacing.lg },
    cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.md },
    name: { ...typography.h3 },
    meta: { ...typography.small, marginTop: 2 },
    tag: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm },
    tagGreen: { backgroundColor: colors.tag.green.bg },
    tagRed: { backgroundColor: colors.tag.red.bg },
    tagText: { fontSize: 12, fontWeight: "500" },
    detailRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: 4 },
    detail: { ...typography.small, flex: 1 },
    toggleSection: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border.base },
    toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    toggleLabel: { ...typography.label },
    actions: { flexDirection: "row", justifyContent: "flex-end", gap: spacing.lg, marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border.base },
    editBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 4 },
    editText: { fontSize: 13, color: colors.interactive, fontWeight: "500" },
    deleteBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 4 },
    deleteText: { fontSize: 13, color: colors.tag.red.fg, fontWeight: "500" },
    empty: { alignItems: "center", paddingTop: 60 },
    emptyText: { ...typography.body },
    fab: { position: "absolute", right: spacing.xl, bottom: spacing.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.interactive, justifyContent: "center", alignItems: "center", elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
    modalContainer: { flex: 1, backgroundColor: colors.bg.base },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border.base },
    modalCancel: { ...typography.body, color: colors.fg.subtle },
    modalTitle: { ...typography.h2 },
    modalSave: { ...typography.label, color: colors.interactive },
    formContent: { padding: spacing.xl, gap: spacing.sm },
    inputLabel: { ...typography.label, marginTop: spacing.sm },
    input: { borderWidth: 1, borderColor: colors.border.base, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, fontSize: 14, color: colors.fg.base, backgroundColor: colors.bg.field },
    formToggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: colors.border.base, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.sm },
    pickerOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.4)" },
    pickerContent: { backgroundColor: colors.bg.base, borderRadius: radius.lg, padding: spacing.md, width: 280 },
    pickerItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: spacing.md, paddingHorizontal: spacing.md },
    pickerItemText: { ...typography.body },
})
