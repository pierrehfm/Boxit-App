
import { api, Box, Project, STATUS_LABELS } from '@/lib/api';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type FilterId = 'tous' | 'cartons' | 'objets' | 'fragile';

const FILTERS: { id: FilterId; label: string }[] = [
    { id: 'tous',    label: 'Tous' },
    { id: 'cartons', label: 'Cartons' },
    { id: 'objets',  label: 'Objets' },
    { id: 'fragile', label: 'Fragile' },
];

type SearchResult = {
    id: string;
    type: 'box' | 'item';
    title: string;
    subtitle: string;
    room: string | null;
    status: Box['status'];
    boxId: string;
    color: string | null;
    icon: string | null;
};

export default function RechercheScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterId>('tous');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useFocusEffect(
        useCallback(() => {
            api.getUserProjects().then(setProjects).catch(() => {});
        }, [])
    );

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (searchQuery.length < 2) {
            setResults([]);
            return;
        }

        debounceRef.current = setTimeout(() => {
            runSearch(searchQuery, activeFilter, selectedProjectId);
        }, 400);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [searchQuery, activeFilter, selectedProjectId]);

    const runSearch = async (query: string, filter: FilterId, projectId: string | null) => {
        setLoading(true);
        try {
            const combined: SearchResult[] = [];

            if (filter === 'tous' || filter === 'cartons' || filter === 'fragile') {
                const boxes = await api.searchBoxes(query, projectId ?? undefined);
                const filtered = filter === 'fragile' ? boxes.filter(b => b.is_fragile) : boxes;
                for (const box of filtered) {
                    combined.push({
                        id: `box-${box.id}`,
                        type: 'box',
                        title: box.name,
                        subtitle: `${box.room || 'Sans pièce'} • ${box.item_count} objet${box.item_count !== 1 ? 's' : ''}`,
                        room: box.room,
                        status: box.status,
                        boxId: box.id,
                        color: box.color,
                        icon: box.icon,
                    });
                }
            }

            if (filter === 'tous' || filter === 'objets') {
                const items = await api.searchItems(query, projectId ?? undefined);
                for (const item of items) {
                    combined.push({
                        id: `item-${item.id}`,
                        type: 'item',
                        title: item.name,
                        subtitle: `Dans : ${item.box?.name || 'Carton inconnu'}`,
                        room: item.box?.room ?? null,
                        status: item.box?.status ?? 'filling',
                        boxId: item.box?.id ?? '',
                        color: item.box?.color ?? null,
                        icon: null,
                    });
                }
            }

            setResults(combined);
        } catch (e) {
            console.error('Search error:', e);
        } finally {
            setLoading(false);
        }
    };

    const renderResult = ({ item }: { item: SearchResult }) => {
        const statusInfo = STATUS_LABELS[item.status];
        const iconName = item.type === 'box'
            ? (item.icon || 'package-variant-closed')
            : 'cube-outline';
        const iconBg = item.type === 'box' ? (item.color || '#000833') : '#000833';

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => {
                    if (item.boxId) {
                        router.push({ pathname: '/box-detail', params: { boxId: item.boxId } });
                    }
                }}
            >
                <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
                    <MaterialCommunityIcons name={iconName as any} size={26} color="#FFFFFF" />
                </View>

                <View style={styles.cardContent}>
                    <View style={styles.cardTopRow}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                    </View>

                    <View style={styles.tagsRow}>
                        {item.room && (
                            <View style={styles.locationTag}>
                                <Text style={styles.locationText}>{item.room}</Text>
                            </View>
                        )}
                        <View style={[styles.statusTag, { backgroundColor: statusInfo.bgColor }]}>
                            <Text style={[styles.statusText, { color: statusInfo.color }]}>
                                {statusInfo.label}
                            </Text>
                        </View>
                        <View style={styles.typeTag}>
                            <Text style={styles.typeText}>
                                {item.type === 'box' ? 'Carton' : 'Objet'}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const isEmpty = searchQuery.length >= 2 && !loading && results.length === 0;
    const showPlaceholder = searchQuery.length < 2 && !loading;

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <SafeAreaView edges={['top']} style={styles.safeHeader}>
                    <View style={styles.searchRow}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <View style={styles.searchBar}>
                            <Ionicons name="search" size={20} color="#A7A9BE" style={{ marginRight: 8 }} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Carton, objet, pièce..."
                                placeholderTextColor="#A7A9BE"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoFocus
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Ionicons name="close-circle" size={18} color="#A7A9BE" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filtersScroll}
                    >
                        {FILTERS.map(f => {
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
                            );
                        })}
                    </ScrollView>
                </SafeAreaView>
            </View>

            {/* Project filter — visible only when multiple projects exist */}
            {projects.length > 1 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.projectScroll}
                    style={styles.projectScrollWrapper}
                >
                    <TouchableOpacity
                        style={[styles.projectChip, selectedProjectId === null && styles.projectChipActive]}
                        onPress={() => setSelectedProjectId(null)}
                    >
                        <Text style={[styles.projectChipText, selectedProjectId === null && styles.projectChipTextActive]}>
                            Tous les projets
                        </Text>
                    </TouchableOpacity>
                    {projects.map(p => (
                        <TouchableOpacity
                            key={p.id}
                            style={[styles.projectChip, selectedProjectId === p.id && styles.projectChipActive]}
                            onPress={() => setSelectedProjectId(p.id)}
                        >
                            <Text
                                style={[styles.projectChipText, selectedProjectId === p.id && styles.projectChipTextActive]}
                                numberOfLines={1}
                            >
                                {p.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            <View style={styles.resultsContainer}>
                {loading ? (
                    <ActivityIndicator size="large" color="#000833" style={{ marginTop: 40 }} />
                ) : showPlaceholder ? (
                    <View style={styles.placeholder}>
                        <MaterialCommunityIcons name="magnify" size={64} color="#E6E8F0" />
                        <Text style={styles.placeholderText}>
                            Tapez au moins 2 caractères pour rechercher.
                        </Text>
                    </View>
                ) : isEmpty ? (
                    <View style={styles.placeholder}>
                        <MaterialCommunityIcons name="magnify-close" size={64} color="#E6E8F0" />
                        <Text style={styles.placeholderText}>Aucun résultat pour « {searchQuery} »</Text>
                    </View>
                ) : (
                    <>
                        <Text style={styles.resultsCount}>
                            {results.length} résultat{results.length !== 1 ? 's' : ''}
                        </Text>
                        <FlatList
                            data={results}
                            keyExtractor={item => item.id}
                            renderItem={renderResult}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                        />
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FB' },
    headerContainer: { backgroundColor: '#000833', paddingBottom: 16 },
    safeHeader: { paddingHorizontal: 24 },

    searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 10 },
    backButton: { marginRight: 16 },
    searchBar: {
        flex: 1,
        height: 48,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    searchInput: { flex: 1, fontFamily: 'Outfit_400Regular', fontSize: 16, color: '#000833' },

    filtersScroll: { gap: 12 },
    filterChip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        minWidth: 70,
        alignItems: 'center',
    },
    filterChipActive: { backgroundColor: '#FFFFFF' },
    filterChipInactive: { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
    filterText: { fontFamily: 'Outfit_600SemiBold', fontSize: 14 },
    filterTextActive: { color: '#000833' },
    filterTextInactive: { color: '#FFFFFF' },

    projectScrollWrapper: {
        backgroundColor: '#F8F9FB',
        borderBottomWidth: 1,
        borderBottomColor: '#E6E8F0',
        maxHeight: 48,
        minHeight: 48,
    },
    projectScroll: { paddingHorizontal: 24, paddingVertical: 8, gap: 8 },
    projectChip: {
        paddingHorizontal: 14,
        paddingVertical: 5,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E6E8F0',
        maxWidth: 200,
    },
    projectChipActive: { backgroundColor: '#000833', borderColor: '#000833' },
    projectChipText: { fontFamily: 'Outfit_600SemiBold', fontSize: 13, color: '#000833' },
    projectChipTextActive: { color: '#FFFFFF' },

    resultsContainer: { flex: 1, paddingHorizontal: 24 },
    resultsCount: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 14,
        color: '#6E7591',
        marginVertical: 20,
    },
    listContent: { paddingBottom: 100 },

    placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    placeholderText: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 14,
        color: '#A7A9BE',
        textAlign: 'center',
        marginTop: 16,
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
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardContent: { flex: 1 },
    cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cardTitle: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#000833', marginBottom: 4, flex: 1, marginRight: 8 },
    cardSubtitle: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: '#6E7591', marginBottom: 10 },

    tagsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    locationTag: { backgroundColor: '#F0F2F5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    locationText: { fontFamily: 'Outfit_600SemiBold', fontSize: 11, color: '#6E7591' },
    statusTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontFamily: 'Outfit_600SemiBold', fontSize: 11 },
    typeTag: { backgroundColor: '#F0F2F5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    typeText: { fontFamily: 'Outfit_600SemiBold', fontSize: 11, color: '#000833' },
});
