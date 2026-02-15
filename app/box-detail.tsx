
import { api, Box, Item } from '@/lib/api';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BoxDetailScreen() {
    const { boxId } = useLocalSearchParams<{ boxId: string }>();
    const [box, setBox] = useState<Box | null>(null);
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);

    const handleBack = () => {
        router.back();
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
                {/* Default icon per item or generic. DB item doesn't have icon field, using generic */}
                <MaterialCommunityIcons name="cube-outline" size={24} color="#000833" />
            </View>
            <View style={styles.itemContent}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>Quantité: {item.quantity}</Text>
            </View>
            <TouchableOpacity>
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
                    <Text style={styles.topTitle}>DÉTAIL CARTON</Text>

                    <View style={styles.navRow}>
                        <TouchableOpacity onPress={handleBack}>
                            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <MaterialCommunityIcons name="dots-vertical" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.boxInfoContainer}>
                        <View style={styles.mainIconContainer}>
                            <MaterialCommunityIcons name="package-variant-closed" size={40} color="#000833" />
                        </View>
                        <View style={styles.boxTextFields}>
                            <Text style={styles.boxTitle}>{box.name}</Text>
                            <Text style={styles.boxSubtitle}>{box.room ? box.room + ' • ' : ''}{box.qr_code}</Text>
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
                <TouchableOpacity style={styles.actionButton} onPress={() => router.push({ pathname: '/update-status', params: { boxId: box.id, currentStatus: box.status } })}>
                    <Text style={styles.actionButtonText}>Modifier le statut</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FB' },
    headerContainer: { backgroundColor: '#000833', paddingBottom: 30 },
    safeHeader: { paddingHorizontal: 24 },
    topTitle: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: '#FFFFFF', textAlign: 'left', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1, marginTop: 10 },
    navRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
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
});
