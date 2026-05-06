
import { api, Box, Project, STATUS_LABELS } from '@/lib/api';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
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

export default function CartonsScreen() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [boxes, setBoxes] = useState<Box[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeRoom, setActiveRoom] = useState('all');

    const selectedProjectIdRef = useRef<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            loadProjectsAndBoxes();
        }, [])
    );

    const loadProjectsAndBoxes = async () => {
        try {
            setLoading(true);
            const fetchedProjects = await api.getUserProjects();
            setProjects(fetchedProjects);

            if (fetchedProjects.length > 0) {
                const id = selectedProjectIdRef.current || fetchedProjects[0].id;
                selectedProjectIdRef.current = id;
                setSelectedProjectId(id);

                const fetchedBoxes = await api.getAllBoxes(id);
                setBoxes(fetchedBoxes);
                setActiveRoom('all');
            } else {
                setBoxes([]);
            }
        } catch (e) {
            console.error('Error loading cartons:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleProjectSelect = async (projectId: string) => {
        if (projectId === selectedProjectId) return;
        selectedProjectIdRef.current = projectId;
        setSelectedProjectId(projectId);
        setActiveRoom('all');
        setSearchQuery('');
        try {
            setLoading(true);
            const fetchedBoxes = await api.getAllBoxes(projectId);
            setBoxes(fetchedBoxes);
        } catch (e) {
            console.error('Error loading boxes:', e);
        } finally {
            setLoading(false);
        }
    };

    const rooms = [
        'all',
        ...Array.from(new Set(boxes.map(b => b.room).filter(Boolean) as string[])),
    ];

    const filteredBoxes = boxes.filter(box => {
        const matchesRoom = activeRoom === 'all' || box.room === activeRoom;
        const matchesSearch =
            !searchQuery || box.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesRoom && matchesSearch;
    });

    const renderBox = ({ item }: { item: Box }) => {
        const statusInfo = STATUS_LABELS[item.status];
        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push({ pathname: '/box-detail', params: { boxId: item.id } })}
            >
                <View style={styles.card}>
                    <View style={styles.cardLeft}>
                        <View style={[styles.iconContainer, { backgroundColor: item.color || '#000833' }]}>
                            <MaterialCommunityIcons name={(item.icon || 'package-variant-closed') as any} size={28} color="#FFFFFF" />
                        </View>
                    </View>

                    <View style={styles.cardContent}>
                        <View style={styles.cardHeaderRow}>
                            <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
                            {/* <Ionicons name="chevron-forward" size={20} color="#A7A9BE" /> */}
                            {/* <MaterialCommunityIcons name="dots-vertical" size={24} color="#A7A9BE" /> */}
                        </View>

                        {/* <Text style={styles.cardSubtitle}>
                            {item.room || 'Sans pièce'} • {item.qr_code}
                        </Text> */}

                        <View style={styles.badgesRow}>
                            <View style={[styles.badge, { backgroundColor: statusInfo.bgColor }]}>
                                <Text style={[styles.badgeText, { color: statusInfo.color }]}>
                                    {statusInfo.label}
                                </Text>
                            </View>
                            {item.is_fragile && (
                                <View style={[styles.badge, { backgroundColor: '#F3E8FF' }]}>
                                    <Text style={[styles.badgeText, { color: '#8B5CF6' }]}>Fragile</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <SafeAreaView edges={['top']} style={styles.safeHeader}>
                    <View style={styles.headerTopRow}>
                        <Text style={styles.headerTitle}>MES CARTONS</Text>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => {
                                if (selectedProjectId) {
                                    router.push({ pathname: '/new-box', params: { projectId: selectedProjectId } });
                                }
                            }}
                        >
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
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={18} color="#A7A9BE" />
                            </TouchableOpacity>
                        )}
                    </View>
                </SafeAreaView>
            </View>

            <View style={styles.contentContainer}>
                {/* Project selector (visible only when multiple projects exist) */}
                {projects.length > 1 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.projectScroll}
                        style={styles.projectScrollWrapper}
                    >
                        {projects.map(p => (
                            <TouchableOpacity
                                key={p.id}
                                style={[
                                    styles.projectChip,
                                    selectedProjectId === p.id && styles.projectChipActive,
                                ]}
                                onPress={() => handleProjectSelect(p.id)}
                            >
                                <Text
                                    style={[
                                        styles.projectChipText,
                                        selectedProjectId === p.id && styles.projectChipTextActive,
                                    ]}
                                    numberOfLines={1}
                                >
                                    {p.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                {!loading && boxes.length > 0 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterScroll}
                        style={styles.filterScrollWrapper}
                    >
                        {rooms.map(room => {
                            const count =
                                room === 'all'
                                    ? boxes.length
                                    : boxes.filter(b => b.room === room).length;
                            const isActive = activeRoom === room;
                            return (
                                <TouchableOpacity
                                    key={room}
                                    style={[styles.filterButton, isActive && styles.filterButtonActive]}
                                    onPress={() => setActiveRoom(room)}
                                >
                                    <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                                        {room === 'all' ? `Tous (${count})` : `${room} (${count})`}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                )}

                {loading ? (
                    <ActivityIndicator size="large" color="#000833" style={styles.loader} />
                ) : projects.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="package-variant" size={64} color="#E6E8F0" />
                        <Text style={styles.emptyTitle}>Aucun projet</Text>
                        <Text style={styles.emptySubtitle}>Créez un projet depuis l'accueil.</Text>
                    </View>
                ) : filteredBoxes.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="package-variant-closed" size={64} color="#E6E8F0" />
                        <Text style={styles.emptyTitle}>Aucun carton</Text>
                        <Text style={styles.emptySubtitle}>
                            {searchQuery
                                ? 'Aucun résultat pour cette recherche.'
                                : 'Appuyez sur + pour créer votre premier carton.'}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredBoxes}
                        keyExtractor={item => item.id}
                        renderItem={renderBox}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FB' },

    headerContainer: { backgroundColor: '#000833', paddingHorizontal: 24, paddingBottom: 20, paddingTop: 10 },
    safeHeader: { marginBottom: 0 },
    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
    },
    headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 24, color: '#FFFFFF', textTransform: 'uppercase' },
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
    searchIcon: { marginRight: 12 },
    searchInput: { flex: 1, fontFamily: 'Outfit_400Regular', fontSize: 14, color: '#000833' },

    contentContainer: { flex: 1 },

    projectScrollWrapper: { backgroundColor: '#F8F9FB', borderBottomWidth: 1, borderBottomColor: '#E6E8F0', maxHeight: 48, minHeight: 48},
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

    filterScrollWrapper: { maxHeight: 42, minHeight: 42 },
    filterScroll: { paddingHorizontal: 24, paddingVertical: 8 , gap: 10 },
    filterButton: {
        paddingHorizontal: 14,
        paddingVertical: 5,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
    },
    filterButtonActive: { backgroundColor: '#000833' },
    filterText: { fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: '#000833' },
    filterTextActive: { color: '#FFFFFF' },

    loader: { marginTop: 60 },

    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    emptyTitle: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: '#000833', marginTop: 16, marginBottom: 8 },
    emptySubtitle: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: '#6E7591', textAlign: 'center' },

    listContent: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 100 },

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
    cardLeft: { marginRight: 16 },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: { flex: 1 },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    cardTitle: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 14,
        color: '#000833',
        textTransform: 'uppercase',
        flex: 1,
        marginRight: 8,
        marginBottom: 0,
        marginTop: 6
    },
    cardSubtitle: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: '#6E7591', marginBottom: 10 },
    badgesRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    badgeText: { fontFamily: 'Outfit_600SemiBold', fontSize: 11 },
});
