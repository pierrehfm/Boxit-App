import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock Data
const FILTERS = [
    { id: 'all', label: 'Tous (24)' },
    { id: 'salon', label: 'Salon (8)' },
    { id: 'cuisine', label: 'Cuisine (6)' },
    { id: 'chambre', label: 'Chambre (10)' },
];

const BOXES = [
    {
        id: '1',
        title: 'LIVRES\nBIBLIOTHÈQUE',
        location: 'Salon',
        count: 8,
        qrCode: 'QR- 1203',
        status: 'Terminé',
        statusColor: '#10B981',
        icon: 'book-open-page-variant',
        progress: 1.0,
    },
    {
        id: '2',
        title: 'MA VAISSELLE',
        location: 'Cuisine',
        count: 30,
        qrCode: 'QR- 2605',
        status: 'En cours',
        statusColor: '#3B82F6',
        icon: 'silverware-fork-knife',
        progress: 0.6,
    },
    {
        id: '3',
        title: 'VÊTEMENTS HIVER',
        location: 'Chambre',
        count: 15,
        qrCode: 'QR- 3002',
        status: 'En cours',
        statusColor: '#3B82F6',
        icon: 'tshirt-crew',
        progress: 0.4,
    },
    {
        id: '4',
        title: 'JOUETS ENFANTS',
        location: 'Chambre',
        count: 12,
        qrCode: 'QR- 3010',
        status: 'Terminé',
        statusColor: '#10B981',
        icon: 'toy-brick',
        progress: 1.0,
    },
];

export default function CartonsScreen() {
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const renderItem = ({ item }: { item: typeof BOXES[0] }) => (
        <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/box-detail')}>
            <View style={styles.card}>
                <View style={styles.cardLeft}>
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons name={item.icon as any} size={28} color="#FFFFFF" />
                    </View>
                </View>

                <View style={styles.cardContent}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <TouchableOpacity>
                            <MaterialCommunityIcons name="dots-vertical" size={24} color="#A7A9BE" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.cardSubtitle}>
                        {item.location} • {item.count} objets • {item.qrCode}
                    </Text>

                    <View style={styles.statusRow}>
                        <View style={styles.progressBarContainer}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    { width: `${item.progress * 100}%`, backgroundColor: item.statusColor }
                                ]}
                            />
                        </View>
                        <Text style={[styles.statusText, { color: item.statusColor }]}>
                            {item.status}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.headerContainer}>
                <SafeAreaView edges={['top']} style={styles.safeHTML}>
                    <View style={styles.headerTopRow}>
                        <Text style={styles.headerTitle}>MES CARTONS</Text>
                        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/new-box')}>
                            <Ionicons name="add" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color="#A7A9BE" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Rechercher un carton..."
                            placeholderTextColor="#A7A9BE"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </SafeAreaView>
            </View>

            {/* Content Section */}
            <View style={styles.contentContainer}>
                {/* Filters */}
                <View style={styles.filterContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                        {FILTERS.map((filter) => {
                            const isActive = activeFilter === filter.id;
                            return (
                                <TouchableOpacity
                                    key={filter.id}
                                    style={[styles.filterButton, isActive && styles.filterButtonActive]}
                                    onPress={() => setActiveFilter(filter.id)}
                                >
                                    <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                                        {filter.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* List */}
                <FlatList
                    data={BOXES}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FB',
    },
    safeHTML: {
        marginBottom: 20,
    },
    headerContainer: {
        backgroundColor: '#000833',
        paddingHorizontal: 24,
        paddingBottom: 20,
        borderBottomLeftRadius: 0,
        paddingTop: 10,
    },
    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
    },
    headerTitle: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 24,
        color: '#FFFFFF',
        textTransform: 'uppercase',
    },
    addButton: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        height: 48,
        paddingHorizontal: 16,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontFamily: 'Outfit_400Regular',
        fontSize: 14,
        color: '#000833',
    },
    contentContainer: {
        flex: 1,
    },
    filterContainer: {
        marginTop: 20,
        marginBottom: 10,
    },
    filterScroll: {
        paddingHorizontal: 24,
        gap: 12,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
    },
    filterButtonActive: {
        backgroundColor: '#000833',
    },
    filterText: {
        fontFamily: 'Outfit_600SemiBold',
        fontSize: 12,
        color: '#000833',
    },
    filterTextActive: {
        color: '#FFFFFF',
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 100, // Space for tab bar
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardLeft: {
        marginRight: 16,
    },
    iconContainer: {
        width: 56,
        height: 56,
        backgroundColor: '#000833',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        flex: 1,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardTitle: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 14,
        color: '#000833',
        textTransform: 'uppercase',
        marginBottom: 4,
        flex: 1,
        marginRight: 8,
    },
    cardSubtitle: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 12,
        color: '#6E7591',
        marginBottom: 12,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressBarContainer: {
        flex: 1,
        height: 6,
        backgroundColor: '#F0F0F0',
        borderRadius: 3,
        marginRight: 12,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    statusText: {
        fontFamily: 'Outfit_600SemiBold',
        fontSize: 12,
        minWidth: 60,
        textAlign: 'right',
    },
});
