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
import { getAppointments, createAppointment, updateAppointment, deleteAppointment, getVendors } from "../api/client"

const STATUS_MAP: Record<string, { label: string; tag: keyof typeof colors.tag }> = {
    pending: { label: "Bekliyor", tag: "orange" },
    confirmed: { label: "Onaylandı", tag: "green" },
    rejected: { label: "Reddedildi", tag: "red" },
    cancelled: { label: "İptal", tag: "neutral" },
    completed: { label: "Tamamlandı", tag: "blue" },
}
const STATUS_OPTIONS = Object.entries(STATUS_MAP).map(([value, { label }]) => ({ value, label }))

const emptyForm = { vendor_id: "", customer_id: "", service_name: "", date: "", time: "", duration_minutes: "30", status: "pending", notes: "" }

export default function AppointmentsScreen() {
    const [appointments, setAppointments] = useState<any[]>([])
    const [vendors, setVendors] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [editing, setEditing] = useState<any>(null)
    const [form, setForm] = useState({ ...emptyForm })
    const [saving, setSaving] = useState(false)
    const [vendorPickerOpen, setVendorPickerOpen] = useState(false)
    const [statusPickerOpen, setStatusPickerOpen] = useState(false)

    const fetchAppointments = async () => {
        try { const data = await getAppointments(); setAppointments(data || []) }
        catch { } finally { setLoading(false); setRefreshing(false) }
    }

    const fetchVendors = async () => {
        try { const data = await getVendors(); setVendors(data || []) } catch { }
    }

    useEffect(() => { fetchAppointments(); fetchVendors() }, [])

    const vendorName = (id: string) => vendors.find((v) => v.id === id)?.name || id?.slice(-6) || "—"

    const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setModalVisible(true) }
    const openEdit = (a: any) => {
        setEditing(a)
        const d = new Date(a.date)
        setForm({
            vendor_id: a.vendor_id || "", customer_id: a.customer_id || "",
            service_name: a.service_name || "",
            date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
            time: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
            duration_minutes: String(a.duration_minutes || 30),
            status: a.status || "pending",
            notes: a.notes || "",
        })
        setModalVisible(true)
    }

    const handleSave = async () => {
        if (!form.service_name || !form.vendor_id || !form.date || !form.time) {
            Alert.alert("Hata", "Hizmet Adı, İşletme, Tarih ve Saat zorunludur.")
            return
        }
        setSaving(true)
        try {
            const dateISO = new Date(`${form.date}T${form.time}`).toISOString()
            const payload = {
                vendor_id: form.vendor_id, customer_id: form.customer_id || "admin",
                service_name: form.service_name, date: dateISO,
                duration_minutes: Number(form.duration_minutes) || 30,
                status: form.status, notes: form.notes,
            }
            if (editing) await updateAppointment(editing.id, payload)
            else await createAppointment(payload)
            setModalVisible(false)
            fetchAppointments()
        } catch (e: any) {
            Alert.alert("Hata", e?.response?.data?.message || "Kayıt başarısız.")
        } finally { setSaving(false) }
    }

    const handleDelete = (id: string) => {
        Alert.alert("Sil", "Bu randevuyu silmek istediğinizden emin misiniz?", [
            { text: "İptal", style: "cancel" },
            {
                text: "Sil", style: "destructive", onPress: async () => {
                    try { await deleteAppointment(id); setAppointments((prev) => prev.filter((a) => a.id !== id)) }
                    catch { Alert.alert("Hata", "Silme başarısız.") }
                }
            },
        ])
    }

    if (loading) return <View style={styles.center}><ActivityIndicator size="small" color={colors.fg.muted} /></View>

    return (
        <View style={styles.container}>
            <FlatList
                data={appointments}
                keyExtractor={(item) => item.id}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAppointments() }} tintColor={colors.fg.muted} />}
                contentContainerStyle={{ padding: spacing.xl, paddingBottom: 80 }}
                ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
                renderItem={({ item }) => {
                    const status = STATUS_MAP[item.status] || { label: item.status, tag: "neutral" as const }
                    const tagColors = colors.tag[status.tag]
                    const date = new Date(item.date)
                    return (
                        <View style={styles.card}>
                            <View style={styles.cardRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.name}>{item.service_name}</Text>
                                    <Text style={styles.meta}>{vendorName(item.vendor_id)} · {item.duration_minutes} dk</Text>
                                </View>
                                <View style={[styles.tag, { backgroundColor: tagColors.bg }]}>
                                    <Text style={[styles.tagText, { color: tagColors.fg }]}>{status.label}</Text>
                                </View>
                            </View>

                            <View style={styles.dateRow}>
                                <Ionicons name="calendar-outline" size={14} color={colors.fg.muted} />
                                <Text style={styles.dateText}>{date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</Text>
                                <Text style={styles.timeText}>{date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</Text>
                            </View>

                            {item.notes && (
                                <View style={styles.notesRow}>
                                    <Ionicons name="document-text-outline" size={13} color={colors.fg.muted} />
                                    <Text style={styles.notesText}>{item.notes}</Text>
                                </View>
                            )}

                            <View style={styles.actions}>
                                <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                                    <Ionicons name="create-outline" size={14} color={colors.interactive} />
                                    <Text style={styles.editText}>Düzenle</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                                    <Ionicons name="trash-outline" size={14} color={colors.tag.red.fg} />
                                    <Text style={styles.deleteText}>Sil</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )
                }}
                ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>Henüz randevu yok</Text></View>}
            />

            <TouchableOpacity style={styles.fab} onPress={openCreate} activeOpacity={0.85}>
                <Ionicons name="add" size={28} color={colors.fg.on_color} />
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={styles.modalCancel}>İptal</Text></TouchableOpacity>
                        <Text style={styles.modalTitle}>{editing ? "Randevu Düzenle" : "Yeni Randevu"}</Text>
                        <TouchableOpacity onPress={handleSave} disabled={saving}><Text style={[styles.modalSave, saving && { opacity: 0.5 }]}>{saving ? "..." : "Kaydet"}</Text></TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={styles.formContent}>
                        <Text style={styles.inputLabel}>Hizmet Adı *</Text>
                        <TextInput style={styles.input} value={form.service_name} onChangeText={(v) => setForm({ ...form, service_name: v })} placeholder="Saç Kesimi, Muayene vb." placeholderTextColor={colors.fg.muted} />

                        <Text style={styles.inputLabel}>İşletme *</Text>
                        <TouchableOpacity style={styles.input} onPress={() => setVendorPickerOpen(true)}>
                            <Text style={{ color: form.vendor_id ? colors.fg.base : colors.fg.muted }}>{form.vendor_id ? vendorName(form.vendor_id) : "İşletme seçin"}</Text>
                        </TouchableOpacity>

                        <Text style={styles.inputLabel}>Tarih * (YYYY-AA-GG)</Text>
                        <TextInput style={styles.input} value={form.date} onChangeText={(v) => setForm({ ...form, date: v })} placeholder="2026-02-15" placeholderTextColor={colors.fg.muted} />

                        <Text style={styles.inputLabel}>Saat * (SS:DD)</Text>
                        <TextInput style={styles.input} value={form.time} onChangeText={(v) => setForm({ ...form, time: v })} placeholder="14:30" placeholderTextColor={colors.fg.muted} />

                        <Text style={styles.inputLabel}>Süre (dakika)</Text>
                        <TextInput style={styles.input} value={form.duration_minutes} onChangeText={(v) => setForm({ ...form, duration_minutes: v })} keyboardType="numeric" placeholderTextColor={colors.fg.muted} />

                        <Text style={styles.inputLabel}>Durum</Text>
                        <TouchableOpacity style={styles.input} onPress={() => setStatusPickerOpen(true)}>
                            <Text style={{ color: colors.fg.base }}>{STATUS_MAP[form.status]?.label || form.status}</Text>
                        </TouchableOpacity>

                        <Text style={styles.inputLabel}>Notlar</Text>
                        <TextInput style={[styles.input, { height: 70, textAlignVertical: "top" }]} value={form.notes} onChangeText={(v) => setForm({ ...form, notes: v })} multiline placeholder="İsteğe bağlı notlar" placeholderTextColor={colors.fg.muted} />
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Vendor Picker */}
                <Modal visible={vendorPickerOpen} transparent animationType="fade" onRequestClose={() => setVendorPickerOpen(false)}>
                    <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setVendorPickerOpen(false)}>
                        <View style={styles.pickerContent}>
                            <ScrollView style={{ maxHeight: 300 }}>
                                {vendors.map((v) => (
                                    <TouchableOpacity key={v.id} style={styles.pickerItem} onPress={() => { setForm({ ...form, vendor_id: v.id }); setVendorPickerOpen(false) }}>
                                        <Text style={[styles.pickerItemText, form.vendor_id === v.id && { color: colors.interactive, fontWeight: "600" }]}>{v.name}</Text>
                                        {form.vendor_id === v.id && <Ionicons name="checkmark" size={18} color={colors.interactive} />}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* Status Picker */}
                <Modal visible={statusPickerOpen} transparent animationType="fade" onRequestClose={() => setStatusPickerOpen(false)}>
                    <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setStatusPickerOpen(false)}>
                        <View style={styles.pickerContent}>
                            {STATUS_OPTIONS.map((s) => (
                                <TouchableOpacity key={s.value} style={styles.pickerItem} onPress={() => { setForm({ ...form, status: s.value }); setStatusPickerOpen(false) }}>
                                    <Text style={[styles.pickerItemText, form.status === s.value && { color: colors.interactive, fontWeight: "600" }]}>{s.label}</Text>
                                    {form.status === s.value && <Ionicons name="checkmark" size={18} color={colors.interactive} />}
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
    tagText: { fontSize: 12, fontWeight: "500" },
    dateRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    dateText: { ...typography.body },
    timeText: { ...typography.label, marginLeft: "auto" },
    notesRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.sm },
    notesText: { ...typography.small },
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
