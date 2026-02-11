import React, { useState } from "react"
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, Alert, Switch,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { colors, spacing, radius, typography } from "../theme/tokens"
import { updateVendor } from "../api/client"

interface Props {
    vendor: any
    onLogout: () => void
    onVendorUpdate: (vendor: any) => void
}

export default function SettingsScreen({ vendor, onLogout, onVendorUpdate }: Props) {
    const [editMode, setEditMode] = useState(false)
    const [name, setName] = useState(vendor?.name || "")
    const [phone, setPhone] = useState(vendor?.phone || "")
    const [address, setAddress] = useState(vendor?.address || "")
    const [isOpen, setIsOpen] = useState(vendor?.is_open ?? true)
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        setSaving(true)
        try {
            const updated = await updateVendor(vendor.id, {
                name: name.trim(),
                phone: phone.trim(),
                address: address.trim(),
                is_open: isOpen,
            })
            onVendorUpdate(updated)
            setEditMode(false)
            Alert.alert("Başarılı", "Bilgiler güncellendi")
        } catch (err) {
            Alert.alert("Hata", "Bilgiler güncellenemedi")
        } finally {
            setSaving(false)
        }
    }

    const handleLogout = () => {
        Alert.alert("Çıkış", "Hesabınızdan çıkmak istiyor musunuz?", [
            { text: "Vazgeç", style: "cancel" },
            { text: "Çıkış Yap", style: "destructive", onPress: onLogout },
        ])
    }

    return (
        <SafeAreaView style={s.container} edges={["top"]}>
            <View style={s.header}>
                <Text style={s.title}>Ayarlar</Text>
                {!editMode ? (
                    <TouchableOpacity onPress={() => setEditMode(true)} style={s.editBtn}>
                        <Ionicons name="create-outline" size={18} color={colors.interactive} />
                        <Text style={s.editBtnText}>Düzenle</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={handleSave} disabled={saving} style={s.saveBtn}>
                        <Text style={s.saveBtnText}>{saving ? "Kaydediyor..." : "Kaydet"}</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView contentContainerStyle={s.scroll}>
                {/* İşletme Bilgileri */}
                <View style={s.card}>
                    <View style={s.cardHeader}>
                        <Ionicons name="storefront-outline" size={20} color={colors.interactive} />
                        <Text style={s.cardTitle}>İşletme Bilgileri</Text>
                    </View>

                    <View style={s.field}>
                        <Text style={s.fieldLabel}>İşletme Adı</Text>
                        {editMode ? (
                            <TextInput style={s.fieldInput} value={name} onChangeText={setName} />
                        ) : (
                            <Text style={s.fieldValue}>{vendor?.name || "—"}</Text>
                        )}
                    </View>

                    <View style={s.field}>
                        <Text style={s.fieldLabel}>Telefon</Text>
                        {editMode ? (
                            <TextInput style={s.fieldInput} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                        ) : (
                            <Text style={s.fieldValue}>{vendor?.phone || "—"}</Text>
                        )}
                    </View>

                    <View style={s.field}>
                        <Text style={s.fieldLabel}>Adres</Text>
                        {editMode ? (
                            <TextInput style={[s.fieldInput, { height: 60 }]} value={address} onChangeText={setAddress} multiline />
                        ) : (
                            <Text style={s.fieldValue}>{vendor?.address || "—"}</Text>
                        )}
                    </View>
                </View>

                {/* Durum */}
                <View style={s.card}>
                    <View style={s.cardHeader}>
                        <Ionicons name="toggle-outline" size={20} color={colors.interactive} />
                        <Text style={s.cardTitle}>İşletme Durumu</Text>
                    </View>
                    <View style={s.switchRow}>
                        <View>
                            <Text style={s.switchLabel}>Sipariş Kabul</Text>
                            <Text style={s.switchHint}>{isOpen ? "İşletme açık, sipariş alınıyor" : "İşletme kapalı"}</Text>
                        </View>
                        <Switch
                            value={isOpen}
                            onValueChange={(v) => { setIsOpen(v); if (!editMode) setEditMode(true) }}
                            trackColor={{ true: colors.tag.green.fg, false: colors.border.base }}
                        />
                    </View>
                </View>

                {/* İşletme Tipi */}
                <View style={s.card}>
                    <View style={s.cardHeader}>
                        <Ionicons name="information-circle-outline" size={20} color={colors.interactive} />
                        <Text style={s.cardTitle}>Genel Bilgiler</Text>
                    </View>
                    <InfoItem label="Kategori" value={vendor?.category || "—"} icon="grid-outline" />
                    <InfoItem label="İşletme ID" value={vendor?.id?.slice(-8) || "—"} icon="key-outline" />
                    <InfoItem label="Durum" value={vendor?.is_verified ? "Onaylı ✅" : "Onay Bekliyor"} icon="shield-checkmark-outline" />
                </View>

                {/* Çıkış */}
                <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                    <Ionicons name="log-out-outline" size={20} color={colors.tag.red.fg} />
                    <Text style={s.logoutText}>Çıkış Yap</Text>
                </TouchableOpacity>

                <Text style={s.version}>Varto İşletme v1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    )
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon: any }) {
    return (
        <View style={s.infoItem}>
            <Ionicons name={icon} size={16} color={colors.fg.muted} />
            <Text style={s.infoLabel}>{label}</Text>
            <Text style={s.infoValue}>{value}</Text>
        </View>
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
    editBtn: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
    editBtnText: { ...typography.body, color: colors.interactive, fontWeight: "600" },
    saveBtn: {
        backgroundColor: colors.interactive, borderRadius: radius.md,
        paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    },
    saveBtnText: { color: colors.fg.on_color, fontWeight: "600", fontSize: 14 },
    scroll: { padding: spacing.lg, paddingBottom: 100 },
    card: {
        backgroundColor: colors.bg.base, borderRadius: radius.lg,
        padding: spacing.lg, marginBottom: spacing.md,
        borderWidth: 1, borderColor: colors.border.base,
    },
    cardHeader: {
        flexDirection: "row", alignItems: "center", gap: spacing.sm,
        marginBottom: spacing.lg, paddingBottom: spacing.sm,
        borderBottomWidth: 1, borderBottomColor: colors.border.base,
    },
    cardTitle: { ...typography.h3 },
    field: { marginBottom: spacing.lg },
    fieldLabel: { ...typography.label, marginBottom: spacing.xs },
    fieldValue: { ...typography.body, color: colors.fg.base },
    fieldInput: {
        backgroundColor: colors.bg.field, borderRadius: radius.md,
        borderWidth: 1, borderColor: colors.border.base,
        paddingHorizontal: spacing.md, paddingVertical: spacing.md,
        fontSize: 15, color: colors.fg.base,
    },
    switchRow: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    },
    switchLabel: { ...typography.body, color: colors.fg.base, fontWeight: "500" },
    switchHint: { ...typography.caption, marginTop: 2 },
    infoItem: {
        flexDirection: "row", alignItems: "center", gap: spacing.sm,
        paddingVertical: spacing.sm,
    },
    infoLabel: { ...typography.small, flex: 1 },
    infoValue: { ...typography.body, color: colors.fg.base },
    logoutBtn: {
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm,
        backgroundColor: colors.tag.red.bg, borderRadius: radius.lg,
        paddingVertical: spacing.lg, marginTop: spacing.md,
    },
    logoutText: { fontSize: 15, fontWeight: "600", color: colors.tag.red.fg },
    version: { ...typography.caption, textAlign: "center", marginTop: spacing.xxl },
})
