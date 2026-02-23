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
import { getCouriers, createCourier, updateCourier, deleteCourier } from "../api/client"

const VEHICLES = [
    { value: "motorcycle", label: "Motosiklet" },
    { value: "bicycle", label: "Bisiklet" },
    { value: "car", label: "Araba" },
    { value: "on_foot", label: "Yaya" },
]
const VEHICLE_MAP = Object.fromEntries(VEHICLES.map((v) => [v.value, v.label]))

const emptyForm = { name: "", phone: "", email: "", password: "", vehicle_type: "motorcycle", is_active: true, is_available: true }

export default function CouriersScreen() {
    const [couriers, setCouriers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [editing, setEditing] = useState<any>(null)
    const [form, setForm] = useState({ ...emptyForm })
    const [saving, setSaving] = useState(false)
    const [vehiclePickerOpen, setVehiclePickerOpen] = useState(false)

    const fetchCouriers = async () => {
        try { const data = await getCouriers(); setCouriers(data || []) }
        catch { } finally { setLoading(false); setRefreshing(false) }
    }

    useEffect(() => { fetchCouriers() }, [])

    const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setModalVisible(true) }
    const openEdit = (c: any) => {
        setEditing(c)
        setForm({ name: c.name, phone: c.phone || "", email: c.email || "", password: "", vehicle_type: c.vehicle_type || "motorcycle", is_active: c.is_active ?? true, is_available: c.is_available ?? true })
        setModalVisible(true)
    }

    const handleSave = async () => {
        if (!form.name || !form.phone) { Alert.alert("Hata", "İsim ve Telefon zorunludur."); return }
        if (!editing && form.email && !form.password) { Alert.alert("Hata", "Yeni kurye için e-posta girilmişse şifre de zorunludur."); return }
        setSaving(true)
        try {
            if (editing) {
                const { password: _, ...updateData } = form
                await updateCourier(editing.id, updateData)
            } else {
                await createCourier(form)
            }
            setModalVisible(false)
            fetchCouriers()
        } catch (e: any) {
            Alert.alert("Hata", e?.response?.data?.message || "Kayıt başarısız.")
        } finally { setSaving(false) }
    }

    const toggleField = async (id: string, field: string, value: boolean) => {
        try {
            await updateCourier(id, { [field]: value })
            setCouriers((prev) => prev.map((c) => c.id === id ? { ...c, [field]: value } : c))
        } catch { Alert.alert("Hata", "Güncelleme başarısız.") }
    }

    const handleDelete = (id: string, name: string) => {
        Alert.alert("Sil", `"${name}" silinecek. Emin misiniz?`, [
            { text: "İptal", style: "cancel" },
            {
                text: "Sil", style: "destructive", onPress: async () => {
                    try { await deleteCourier(id); setCouriers((prev) => prev.filter((c) => c.id !== id)) }
                    catch { Alert.alert("Hata", "Silme başarısız.") }
                }
            },
        ])
    }

    if (loading) return <View style={styles.center}><ActivityIndicator size="small" color={colors.fg.muted} /></View>

    return (
        <View style={styles.container}>
            <FlatList
                data={couriers}
                keyExtractor={(item) => item.id}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCouriers() }} tintColor={colors.fg.muted} />}
                contentContainerStyle={{ padding: spacing.xl, paddingBottom: 80 }}
                ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.name}>{item.name}</Text>
                                <Text style={styles.meta}>{VEHICLE_MAP[item.vehicle_type] || item.vehicle_type}</Text>
                            </View>
                            <View style={styles.tags}>
                                <View style={[styles.tag, item.is_active ? styles.tagGreen : styles.tagRed]}>
                                    <Text style={[styles.tagText, { color: item.is_active ? colors.tag.green.fg : colors.tag.red.fg }]}>
                                        {item.is_active ? "Aktif" : "Pasif"}
                                    </Text>
                                </View>
                                <View style={[styles.tag, item.is_available ? styles.tagBlue : styles.tagNeutral]}>
                                    <Text style={[styles.tagText, { color: item.is_available ? colors.tag.blue.fg : colors.fg.muted }]}>
                                        {item.is_available ? "Müsait" : "Meşgul"}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.detailRow}>
                            <Ionicons name="call-outline" size={14} color={colors.fg.muted} />
                            <Text style={styles.detail}>{item.phone}</Text>
                        </View>
                        {item.email && (
                            <View style={styles.detailRow}>
                                <Ionicons name="mail-outline" size={14} color={colors.fg.muted} />
                                <Text style={styles.detail}>{item.email}</Text>
                            </View>
                        )}

                        {/* Inline Toggle Switches */}
                        <View style={styles.toggleSection}>
                            <View style={styles.toggleRow}>
                                <Text style={styles.toggleLabel}>Aktif</Text>
                                <Switch value={item.is_active} onValueChange={(v) => toggleField(item.id, "is_active", v)} trackColor={{ false: colors.border.base, true: colors.interactive }} thumbColor="#fff" />
                            </View>
                            <View style={styles.toggleRow}>
                                <Text style={styles.toggleLabel}>Müsait</Text>
                                <Switch value={item.is_available} onValueChange={(v) => toggleField(item.id, "is_available", v)} trackColor={{ false: colors.border.base, true: colors.interactive }} thumbColor="#fff" />
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
                ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>Henüz kurye yok</Text></View>}
            />

            <TouchableOpacity style={styles.fab} onPress={openCreate} activeOpacity={0.85}>
                <Ionicons name="add" size={28} color={colors.fg.on_color} />
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={styles.modalCancel}>İptal</Text></TouchableOpacity>
                        <Text style={styles.modalTitle}>{editing ? "Kurye Düzenle" : "Yeni Kurye"}</Text>
                        <TouchableOpacity onPress={handleSave} disabled={saving}><Text style={[styles.modalSave, saving && { opacity: 0.5 }]}>{saving ? "..." : "Kaydet"}</Text></TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={styles.formContent}>
                        <Text style={styles.inputLabel}>İsim *</Text>
                        <TextInput style={styles.input} value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} placeholder="Kurye adı" placeholderTextColor={colors.fg.muted} />

                        <Text style={styles.inputLabel}>Telefon *</Text>
                        <TextInput style={styles.input} value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} placeholder="05XX XXX XXXX" keyboardType="phone-pad" placeholderTextColor={colors.fg.muted} />

                        <Text style={styles.inputLabel}>E-posta</Text>
                        <TextInput style={styles.input} value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} placeholder="kurye@example.com" keyboardType="email-address" autoCapitalize="none" placeholderTextColor={colors.fg.muted} />

                        {!editing && (
                            <>
                                <Text style={styles.inputLabel}>Şifre {form.email ? '*' : ''}</Text>
                                <TextInput style={styles.input} value={form.password} onChangeText={(v) => setForm({ ...form, password: v })} placeholder="Giriş şifresi" secureTextEntry placeholderTextColor={colors.fg.muted} />
                            </>
                        )}

                        <Text style={styles.inputLabel}>Araç Tipi</Text>
                        <TouchableOpacity style={styles.input} onPress={() => setVehiclePickerOpen(true)}>
                            <Text style={{ color: colors.fg.base }}>{VEHICLE_MAP[form.vehicle_type]}</Text>
                        </TouchableOpacity>

                        <View style={styles.formToggleRow}>
                            <Text style={styles.toggleLabel}>Aktif</Text>
                            <Switch value={form.is_active} onValueChange={(v) => setForm({ ...form, is_active: v })} trackColor={{ false: colors.border.base, true: colors.interactive }} thumbColor="#fff" />
                        </View>
                        <View style={styles.formToggleRow}>
                            <Text style={styles.toggleLabel}>Müsait</Text>
                            <Switch value={form.is_available} onValueChange={(v) => setForm({ ...form, is_available: v })} trackColor={{ false: colors.border.base, true: colors.interactive }} thumbColor="#fff" />
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

                <Modal visible={vehiclePickerOpen} transparent animationType="fade" onRequestClose={() => setVehiclePickerOpen(false)}>
                    <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setVehiclePickerOpen(false)}>
                        <View style={styles.pickerContent}>
                            {VEHICLES.map((v) => (
                                <TouchableOpacity key={v.value} style={styles.pickerItem} onPress={() => { setForm({ ...form, vehicle_type: v.value }); setVehiclePickerOpen(false) }}>
                                    <Text style={[styles.pickerItemText, form.vehicle_type === v.value && { color: colors.interactive, fontWeight: "600" }]}>{v.label}</Text>
                                    {form.vehicle_type === v.value && <Ionicons name="checkmark" size={18} color={colors.interactive} />}
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
    tags: { flexDirection: "row", gap: spacing.xs },
    tag: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm },
    tagGreen: { backgroundColor: colors.tag.green.bg },
    tagRed: { backgroundColor: colors.tag.red.bg },
    tagBlue: { backgroundColor: colors.tag.blue.bg },
    tagNeutral: { backgroundColor: colors.tag.neutral.bg },
    tagText: { fontSize: 12, fontWeight: "500" },
    detailRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: 4 },
    detail: { ...typography.small },
    toggleSection: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border.base, gap: spacing.sm },
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
