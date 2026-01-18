
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FILTERS = [
    { id: 'tous', label: 'Tous' },
    { id: 'cartons', label: 'Cartons' },
    { id: 'objets', label: 'Objets' },
    { id: 'fragile', label: 'Fragile' },
];

const RESULTS = [
    {
        id: '1',
        title: 'Romans',
        subtitle: 'Dans: Livres Bibliothèque',
        location: 'Salon',
        status: 'Terminé',
        statusColor: '#10B981',
        statusBg: '#D1FAE5',
        icon: 'book-open-variant',
    },
    {
        id: '2',
        title: 'Romans policiers',
        subtitle: 'Dans: Collection Chambre',
        location: 'Chambre',
        status: 'En cours',
        statusColor: '#3B82F6',
        statusBg: '#DBEAFE',
        icon: 'book-open-page-variant',
    },
    {
        id: '3',
        title: 'Romans historiques',
        subtitle: 'Dans: Livres Bureau',
        location: 'Bureau',
        status: 'En cours',
        statusColor: '#3B82F6',
        statusBg: '#DBEAFE',
        icon: 'book-open-variant',
    },
];

export default function RechercheScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('tous');

    const renderItem = ({ item }: { item: typeof RESULTS[0] }) => (
        <TouchableOpacity style={styles.card} activeOpacity={0.7}>
            <View style={styles.iconContainer}>
                <MaterialCommunityIcons name={item.icon as any} size={28} color="#FFFFFF" />
            </View>

            <View style={styles.cardContent}>
                <View style={styles.cardTopRow}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Ionicons name="chevron-forward" size={20} color="#A7A9BE" />
                </View>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>

                <View style={styles.tagsRow}>
                    <View style={styles.locationTag}>
                        <Text style={styles.locationText}>{item.location}</Text>
                    </View>
                    <View style={[styles.statusTag, { backgroundColor: item.statusBg }]}>
                        <Text style={[styles.statusText, { color: item.statusColor }]}>{item.status}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <SafeAreaView edges={['top']} style={styles.safeHeader}>
                    <Text style={styles.headerTitle}>RECHERCHE</Text>

                    <View style={styles.searchRow}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <View style={styles.searchBar}>
                            <Ionicons name="search" size={20} color="#A7A9BE" style={{ marginRight: 8 }} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder=""
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                    </View>

                    <View style={styles.filtersContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
                            {FILTERS.map((f) => {
                                const isActive = activeFilter === f.id;
                                return (
                                    <TouchableOpacity
                                        key={f.id}
                                        style={[styles.filterChip, isActive ? styles.filterChipActive : styles.filterChipInactive]}
                                        onPress={() => setActiveFilter(f.id)}
                                    >
                                        <Text style={[styles.filterText, isActive ? styles.filterTextActive : styles.filterTextInactive]}>
                                            {f.label}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </ScrollView>
                    </View>
                </SafeAreaView>
            </View>

            <View style={styles.resultsContainer}>
                <Text style={styles.resultsCount}>3 résultats trouvés</Text>
                <FlatList
                    data={RESULTS}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FB' },
    headerContainer: { backgroundColor: '#000833', paddingBottom: 20 },
    safeHeader: { paddingHorizontal: 24 },
    headerTitle: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: '#FFFFFF', marginTop: 10, marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1 },

    searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    backButton: { marginRight: 16 },
    searchBar: { flex: 1, height: 48, backgroundColor: '#FFFFFF', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
    searchInput: { flex: 1, fontFamily: 'Outfit_400Regular', fontSize: 16, color: '#000833', height: '100%' },

    filtersContainer: {},
    filtersScroll: { gap: 12 },
    filterChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, minWidth: 70, alignItems: 'center' },
    filterChipActive: { backgroundColor: '#FFFFFF' },
    filterChipInactive: { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
    filterText: { fontFamily: 'Outfit_600SemiBold', fontSize: 14 },
    filterTextActive: { color: '#000833' },
    filterTextInactive: { color: '#FFFFFF' },

    resultsContainer: { flex: 1, paddingHorizontal: 24 },
    resultsCount: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: '#6E7591', marginVertical: 20 },
    listContent: { paddingBottom: 100 },

    card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, flexDirection: 'row', marginBottom: 16 },
    iconContainer: { width: 48, height: 48, backgroundColor: '#000833', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    cardContent: { flex: 1 },
    cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cardTitle: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#000833', marginBottom: 4 },
    cardSubtitle: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: '#6E7591', marginBottom: 12 },

    tagsRow: { flexDirection: 'row', gap: 8 },
    locationTag: { backgroundColor: '#F0F2F5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    locationText: { fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: '#6E7591' },
    statusTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    statusText: { fontFamily: 'Outfit_600SemiBold', fontSize: 12 },
});
