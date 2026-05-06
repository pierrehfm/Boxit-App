
import { api, Box, Item } from '@/lib/api';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Modal, Platform, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BoxDetailScreen() {
    const { boxId } = useLocalSearchParams<{ boxId: string }>();
    const [box, setBox] = useState<Box | null>(null);
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [showQRModal, setShowQRModal] = useState(false);
    const [editItem, setEditItem] = useState<Item | null>(null);
    const [editName, setEditName] = useState('');
    const [editQuantity, setEditQuantity] = useState(1);
    const [editDescription, setEditDescription] = useState('');
    const [saving, setSaving] = useState(false);

    const handleBack = () => {
        router.back();
    };

    const openEditModal = (item: Item) => {
        setEditItem(item);
        setEditName(item.name);
        setEditQuantity(item.quantity);
        setEditDescription(item.description || '');
    };

    const handleSaveItem = async () => {
        if (!editItem || !editName.trim()) return;
        setSaving(true);
        try {
            await api.updateItem(editItem.id, editName.trim(), editQuantity, editDescription.trim() || null);
            await loadData();
            setEditItem(null);
        } catch (e: any) {
            Alert.alert('Erreur', e.message || "Impossible de modifier l'objet.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteItem = () => {
        if (!editItem) return;
        Alert.alert(
            'Supprimer',
            `Supprimer "${editItem.name}" ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        setSaving(true);
                        try {
                            await api.deleteItem(editItem.id);
                            await loadData();
                            setEditItem(null);
                        } catch (e: any) {
                            Alert.alert('Erreur', e.message || "Impossible de supprimer l'objet.");
                        } finally {
                            setSaving(false);
                        }
                    },
                },
            ]
        );
    };

    const handleShare = async () => {
        if (!box) return;
        try {
            await Share.share({
                message: `Carton : ${box.name}\nCode QR : ${box.qr_code}${box.room ? `\nPièce : ${box.room}` : ''}`,
                title: box.name,
            });
        } catch (_) {}
    };

    const loadData = async () => {
        try {
            if (!boxId) return;
            setLoading(true);
            const [b, i] = await Promise.all([
                api.getBox(boxId),
                api.getBoxItems(boxId)
            ]);
            setBox(b);
            setItems(i);
        } catch (e) {
            console.error("Error loading box details:", e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [boxId])
    );

    const renderItem = ({ item }: { item: Item }) => (
        <View style={styles.itemCard}>
            <View style={styles.itemIconContainer}>
                <MaterialCommunityIcons name="cube-outline" size={24} color="#000833" />
            </View>
            <View style={styles.itemContent}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>Quantité : {item.quantity}</Text>
            </View>
            <TouchableOpacity onPress={() => openEditModal(item)}>
                <MaterialCommunityIcons name="dots-vertical" size={24} color="#A7A9BE" />
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#000833" />
            </View>
        );
    }

    if (!box) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ fontFamily: 'Outfit_600SemiBold', color: '#000833' }}>Carton introuvable</Text>
            </View>
        );
    }

    const totalItems = items.reduce((acc, curr) => acc + curr.quantity, 0);

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <SafeAreaView edges={['top']} style={styles.safeHeader}>
                    <View style={styles.navRow}>
                        <TouchableOpacity onPress={handleBack}>
                            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowQRModal(true)}>
                            <MaterialCommunityIcons name="qrcode" size={26} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.boxInfoContainer}>
                        <View style={styles.mainIconContainer}>
                            <MaterialCommunityIcons name="package-variant-closed" size={40} color="#000833" />
                        </View>
                        <View style={styles.boxTextFields}>
                            <Text style={styles.boxTitle}>{box.name}</Text>
                            <Text style={styles.boxSubtitle}>{box.room ? box.room : ''}</Text>
                            <View style={styles.badgesRow}>
                                <View style={[styles.badge, { backgroundColor: box.status === 'sealed' ? '#10B981' : '#3B82F6' }]}>
                                    <Text style={styles.badgeText}>
                                        {box.status === 'filling' ? 'En cours' :
                                            box.status === 'sealed' ? 'Scellé' : 'Déballé'}
                                    </Text>
                                </View>
                                <View style={[styles.badge, { backgroundColor: '#343852' }]}>
                                    <Text style={styles.badgeText}>{items.length} objets</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </SafeAreaView>
            </View>

            <View style={styles.contentContainer}>
                <View style={styles.contentHeaderRow}>
                    <Text style={styles.sectionTitle}>CONTENU</Text>
                    <TouchableOpacity style={styles.addButton} onPress={() => router.push({ pathname: '/add-item', params: { boxId: box.id } })}>
                        <Ionicons name="add" size={16} color="#FFFFFF" />
                        <Text style={styles.addButtonText}>Ajouter</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={items}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={{ color: '#6E7591', textAlign: 'center', marginTop: 20, fontFamily: 'Outfit_400Regular' }}>
                            Ce carton est vide.
                        </Text>
                    }
                />
            </View>

            <SafeAreaView edges={['bottom']} style={styles.footer}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push({
                        pathname: '/update-status',
                        params: {
                            boxId: box.id,
                            currentStatus: box.status,
                            boxName: box.name,
                            boxRoom: box.room || '',
                            boxQrCode: box.qr_code,
                        },
                    })}
                >
                    <Text style={styles.actionButtonText}>Modifier le statut</Text>
                </TouchableOpacity>
            </SafeAreaView>

            <Modal visible={!!editItem} transparent animationType="slide" onRequestClose={() => setEditItem(null)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <TouchableOpacity style={styles.editOverlay} activeOpacity={1} onPress={() => setEditItem(null)}>
                        <View style={styles.editSheet} onStartShouldSetResponder={() => true}>
                            <View style={styles.editHandle} />
                            <Text style={styles.editSheetTitle}>Modifier l'objet</Text>

                            <Text style={styles.editLabel}>Nom</Text>
                            <TextInput
                                style={styles.editInput}
                                value={editName}
                                onChangeText={setEditName}
                                placeholder="Nom de l'objet"
                                placeholderTextColor="#A7A9BE"
                            />

                            <Text style={styles.editLabel}>Quantité</Text>
                            <View style={styles.editQtyRow}>
                                <TouchableOpacity style={styles.editQtyBtn} onPress={() => setEditQuantity(q => Math.max(1, q - 1))}>
                                    <MaterialCommunityIcons name="minus" size={20} color="#FFFFFF" />
                                </TouchableOpacity>
                                <Text style={styles.editQtyValue}>{editQuantity}</Text>
                                <TouchableOpacity style={styles.editQtyBtn} onPress={() => setEditQuantity(q => q + 1)}>
                                    <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.editLabel}>Description (optionnel)</Text>
                            <TextInput
                                style={[styles.editInput, styles.editTextArea]}
                                value={editDescription}
                                onChangeText={setEditDescription}
                                placeholder="Description..."
                                placeholderTextColor="#A7A9BE"
                                multiline
                                textAlignVertical="top"
                            />

                            <TouchableOpacity style={styles.editSaveBtn} onPress={handleSaveItem} disabled={saving}>
                                {saving
                                    ? <ActivityIndicator color="#FFFFFF" size="small" />
                                    : <Text style={styles.editSaveBtnText}>Enregistrer</Text>}
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.editDeleteBtn} onPress={handleDeleteItem} disabled={saving}>
                                <Text style={styles.editDeleteBtnText}>Supprimer l'objet</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </Modal>

            <Modal
                visible={showQRModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowQRModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowQRModal(false)}
                >
                    <View style={styles.qrModal} onStartShouldSetResponder={() => true}>
                        <Text style={styles.qrModalTitle}>{box.name}</Text>
                        <Text style={styles.qrModalSubtitle}>{box.qr_code}</Text>
                        <View style={styles.qrCodeContainer}>
                            <QRCode value={box.qr_code} size={220} backgroundColor="#FFFFFF" />
                        </View>
                        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                            <Ionicons name="share-outline" size={20} color="#FFFFFF" />
                            <Text style={styles.shareButtonText}>Partager</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setShowQRModal(false)}>
                            <Text style={styles.closeButtonText}>Fermer</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FB' },
    headerContainer: { backgroundColor: '#000833', paddingBottom: 30 },
    safeHeader: { paddingHorizontal: 24 },
    navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 24 },
    boxInfoContainer: { flexDirection: 'row', alignItems: 'center' },
    mainIconContainer: { width: 80, height: 80, backgroundColor: '#FFFFFF', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    boxTextFields: { flex: 1 },
    boxTitle: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: '#FFFFFF', textTransform: 'uppercase', marginBottom: 4 },
    boxSubtitle: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: '#A7A9BE', marginBottom: 12 },
    badgesRow: { flexDirection: 'row', gap: 8 },
    badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    badgeText: { fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: '#FFFFFF' },

    contentContainer: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
    contentHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#000833', textTransform: 'uppercase' },
    addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#000833', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, gap: 8 },
    addButtonText: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: '#FFFFFF' },

    listContent: { gap: 12, paddingBottom: 20 },
    itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16 },
    itemIconContainer: { width: 48, height: 48, backgroundColor: '#F8F9FB', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    itemContent: { flex: 1 },
    itemName: { fontFamily: 'Outfit_600SemiBold', fontSize: 16, color: '#000833' },
    itemQuantity: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: '#6E7591' },

    footer: { padding: 24, backgroundColor: '#F8F9FB' },
    actionButton: { backgroundColor: '#000833', paddingVertical: 18, borderRadius: 12, alignItems: 'center' },
    actionButtonText: { fontFamily: 'Outfit_600SemiBold', fontSize: 16, color: '#FFFFFF' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    qrModal: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 28,
        alignItems: 'center',
        width: 300,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 10,
    },
    qrModalTitle: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#000833', textTransform: 'uppercase', marginBottom: 4, textAlign: 'center' },
    qrModalSubtitle: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: '#6E7591', marginBottom: 20 },
    qrCodeContainer: { padding: 12, backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 20 },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#000833',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
        gap: 8,
        marginBottom: 12,
        width: '100%',
        justifyContent: 'center',
    },
    shareButtonText: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: '#FFFFFF' },
    closeButton: { paddingVertical: 8, width: '100%', alignItems: 'center' },
    closeButtonText: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: '#6E7591' },

    editOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    editSheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    editHandle: { width: 40, height: 4, backgroundColor: '#E6E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
    editSheetTitle: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: '#000833', marginBottom: 20 },
    editLabel: { fontFamily: 'Outfit_600SemiBold', fontSize: 13, color: '#000833', marginBottom: 8, marginTop: 12 },
    editInput: {
        backgroundColor: '#F8F9FB',
        borderWidth: 1,
        borderColor: '#E6E8F0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontFamily: 'Outfit_400Regular',
        fontSize: 15,
        color: '#000833',
    },
    editTextArea: { height: 80, paddingTop: 12 },
    editQtyRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    editQtyBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#000833',
        justifyContent: 'center', alignItems: 'center',
    },
    editQtyValue: { flex: 1, textAlign: 'center', fontFamily: 'Outfit_700Bold', fontSize: 20, color: '#000833' },
    editSaveBtn: {
        backgroundColor: '#000833', borderRadius: 12,
        paddingVertical: 16, alignItems: 'center', marginTop: 20,
    },
    editSaveBtnText: { fontFamily: 'Outfit_600SemiBold', fontSize: 15, color: '#FFFFFF' },
    editDeleteBtn: {
        paddingVertical: 14, alignItems: 'center', marginTop: 8,
    },
    editDeleteBtnText: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: '#EF4444' },
});
