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
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { colors, spacing, radius, typography } from "../theme/tokens"
import { getListings, createListing, updateListing, deleteListing } from "../api/client"

const STATUS_MAP: Record<string, { label: string; tag: keyof typeof colors.tag }> = {
    pending: { label: "Bekliyor", tag: "orange" },
    approved: { label: "Onaylı", tag: "green" },
    rejected: { label: "Reddedildi", tag: "red" },
    expired: { label: "Süresi Doldu", tag: "neutral" },
}

const CATEGORIES = [
    { value: "rental", label: "Kiralık" },
    { value: "sale", label: "Satılık" },
    { value: "job", label: "İş İlanı" },
    { value: "service", label: "Hizmet" },
    { value: "other", label: "Diğer" },
]
const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label]))

const emptyForm = { title: "", description: "", category: "other", price: "", location: "", contact_name: "", contact_phone: "" }

export default function ListingsScreen() {
    const [listings, setListings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [editing, setEditing] = useState<any>(null)
    const [form, setForm] = useState({ ...emptyForm })
    const [saving, setSaving] = useState(false)
    const [catPickerOpen, setCatPickerOpen] = useState(false)

    const fetchListings = async () => {
        try { const data = await getListings(); setListings(data || []) }
        catch { } finally { setLoading(false); setRefreshing(false) }
    }

    useEffect(() => { fetchListings() }, [])

    const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setModalVisible(true) }
    const openEdit = (l: any) => {
        setEditing(l)
        setForm({ title: l.title, description: l.description || "", category: l.category || "other", price: l.price?.toString() || "", location: l.location || "", contact_name: l.contact_name || "", contact_phone: l.contact_phone || "" })
        setModalVisible(true)
    }

    const handleSave = async () => {
        if (!form.title || !form.description || !form.location || !form.contact_name || !form.contact_phone) {
            Alert.alert("Hata", "Başlık, Açıklama, Konum ve İletişim bilgileri zorunludur.")
            return
        }
        setSaving(true)
        try {
            const payload = { ...form, price: form.price ? Number(form.price) : null }
            if (editing) await updateListing(editing.id, payload)
            else await createListing(payload)
            setModalVisible(false)
            fetchListings()
        } catch (e: any) {
            Alert.alert("Hata", e?.response?.data?.message || "Kayıt başarısız.")
        } finally { setSaving(false) }
    }

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await updateListing(id, { status })
            setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
        } catch { Alert.alert("Hata", "Güncelleme başarısız.") }
    }

    const handleDelete = (id: string, title: string) => {
        Alert.alert("Sil", `"${title}" silinecek. Emin misiniz?`, [
            { text: "İptal", style: "cancel" },
            {
                text: "Sil", style: "destructive", onPress: async () => {
                    try { await deleteListing(id); setListings((prev) => prev.filter((l) => l.id !== id)) }
                    catch { Alert.alert("Hata", "Silme başarısız.") }
                }
            },
        ])
    }

    if (loading) return <View style={styles.center}><ActivityIndicator size="small" color={colors.fg.muted} /></View>

    return (
        <View style={styles.container}>
            <FlatList
                data={listings}
                keyExtractor={(item) => item.id}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchListings() }} tintColor={colors.fg.muted} />}
                contentContainerStyle={{ padding: spacing.xl, paddingBottom: 80 }}
                ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
                renderItem={({ item }) => {
                    const status = STATUS_MAP[item.status] || { label: item.status, tag: "neutral" as const }
                    const tagColors = colors.tag[status.tag]
                    return (
                        <View style={styles.card}>
                            <View style={styles.cardRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.title}>{item.title}</Text>
                                    <Text style={styles.meta}>{CATEGORY_MAP[item.category] || item.category}</Text>
                                </View>
                                <View style={[styles.tag, { backgroundColor: tagColors.bg }]}>
                                    <Text style={[styles.tagText, { color: tagColors.fg }]}>{status.label}</Text>
                                </View>
                            </View>

                            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

                            <View style={styles.metaRow}>
                                {item.price != null && <Text style={styles.price}>₺{Number(item.price).toLocaleString("tr-TR")}</Text>}
                                {item.location && <Text style={styles.location}>{item.location}</Text>}
                            </View>

                            <View style={styles.contactRow}>
                                <Ionicons name="person-outline" size={13} color={colors.fg.muted} />
                                <Text style={styles.contactText}>{item.contact_name} · {item.contact_phone}</Text>
                            </View>

                            {item.status === "pending" && (
                                <View style={styles.statusActions}>
                                    <TouchableOpacity style={styles.approveBtn} onPress={() => handleStatusUpdate(item.id, "approved")} activeOpacity={0.7}>
                                        <Text style={styles.approveBtnText}>Onayla</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.rejectBtn} onPress={() => handleStatusUpdate(item.id, "rejected")} activeOpacity={0.7}>
                                        <Text style={styles.rejectBtnText}>Reddet</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            <View style={styles.actions}>
                                <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                                    <Ionicons name="create-outline" size={14} color={colors.interactive} />
                                    <Text style={styles.editText}>Düzenle</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id, item.title)}>
                                    <Ionicons name="trash-outline" size={14} color={colors.tag.red.fg} />
                                    <Text style={styles.deleteText}>Sil</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )
                }}
                ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>Henüz ilan yok</Text></View>}
            />

            <TouchableOpacity style={styles.fab} onPress={openCreate} activeOpacity={0.85}>
                <Ionicons name="add" size={28} color={colors.fg.on_color} />
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={styles.modalCancel}>İptal</Text></TouchableOpacity>
                        <Text style={styles.modalTitle}>{editing ? "İlan Düzenle" : "Yeni İlan"}</Text>
                        <TouchableOpacity onPress={handleSave} disabled={saving}><Text style={[styles.modalSave, saving && { opacity: 0.5 }]}>{saving ? "..." : "Kaydet"}</Text></TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={styles.formContent}>
                        <Text style={styles.inputLabel}>Başlık *</Text>
                        <TextInput style={styles.input} value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} placeholder="İlan başlığı" placeholderTextColor={colors.fg.muted} />

                        <Text style={styles.inputLabel}>Açıklama *</Text>
                        <TextInput style={[styles.input, { height: 80, textAlignVertical: "top" }]} value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} placeholder="İlan açıklaması" multiline placeholderTextColor={colors.fg.muted} />

                        <Text style={styles.inputLabel}>Kategori</Text>
                        <TouchableOpacity style={styles.input} onPress={() => setCatPickerOpen(true)}>
                            <Text style={{ color: colors.fg.base }}>{CATEGORY_MAP[form.category]}</Text>
                        </TouchableOpacity>

                        <Text style={styles.inputLabel}>Fiyat (₺)</Text>
                        <TextInput style={styles.input} value={form.price} onChangeText={(v) => setForm({ ...form, price: v })} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.fg.muted} />

                        <Text style={styles.inputLabel}>Konum *</Text>
                        <TextInput style={styles.input} value={form.location} onChangeText={(v) => setForm({ ...form, location: v })} placeholder="Şehir / İlçe" placeholderTextColor={colors.fg.muted} />

                        <Text style={styles.inputLabel}>İletişim Adı *</Text>
                        <TextInput style={styles.input} value={form.contact_name} onChangeText={(v) => setForm({ ...form, contact_name: v })} placeholder="Ad Soyad" placeholderTextColor={colors.fg.muted} />

                        <Text style={styles.inputLabel}>İletişim Telefon *</Text>
                        <TextInput style={styles.input} value={form.contact_phone} onChangeText={(v) => setForm({ ...form, contact_phone: v })} placeholder="05XX XXX XXXX" keyboardType="phone-pad" placeholderTextColor={colors.fg.muted} />
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
    cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.sm },
    title: { ...typography.h3 },
    meta: { ...typography.small, marginTop: 2 },
    tag: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm },
    tagText: { fontSize: 12, fontWeight: "500" },
    description: { ...typography.body, marginBottom: spacing.md },
    metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
    price: { fontSize: 16, fontWeight: "600", color: colors.fg.base },
    location: { ...typography.small },
    contactRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: spacing.sm },
    contactText: { ...typography.small },
    statusActions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border.base },
    approveBtn: { flex: 1, backgroundColor: colors.interactive, paddingVertical: spacing.sm + 2, borderRadius: radius.md, alignItems: "center" },
    approveBtnText: { color: colors.fg.on_color, fontSize: 13, fontWeight: "500" },
    rejectBtn: { flex: 1, backgroundColor: colors.bg.field, paddingVertical: spacing.sm + 2, borderRadius: radius.md, alignItems: "center", borderWidth: 1, borderColor: colors.border.base },
    rejectBtnText: { color: colors.fg.subtle, fontSize: 13, fontWeight: "500" },
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
    pickerOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.4)" },
    pickerContent: { backgroundColor: colors.bg.base, borderRadius: radius.lg, padding: spacing.md, width: 280 },
    pickerItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: spacing.md, paddingHorizontal: spacing.md },
    pickerItemText: { ...typography.body },
})
