
import { useSession } from '@/context/AuthContext';
import { api, Project, ProjectStats } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { Feather, Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CompteScreen() {
    const { user, signOut } = useSession();
    const [profile, setProfile] = useState<any>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [allStats, setAllStats] = useState<ProjectStats[]>([]);
    const [statsLoading, setStatsLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            if (user) {
                getProfile();
                loadData();
            }
        }, [user])
    );

    async function getProfile() {
        try {
            if (!user) return;
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (!error && data) setProfile(data);
        } catch (e) {
            console.error('Error fetching profile:', e);
        }
    }

    async function loadData() {
        try {
            setStatsLoading(true);
            const [fetchedProjects, fetchedStats] = await Promise.all([
                api.getUserProjects(),
                api.getAllProjectStats(),
            ]);
            setProjects(fetchedProjects);
            setAllStats(fetchedStats);
        } catch (e) {
            console.error('Error loading account data:', e);
        } finally {
            setStatsLoading(false);
        }
    }

    const totalBoxes  = allStats.reduce((sum, s) => sum + Number(s.total_boxes), 0);
    const totalItems  = allStats.reduce((sum, s) => sum + Number(s.total_items), 0);
    const totalProjects = projects.length;

    const userName = profile?.full_name || 'Utilisateur';
    const userEmail = user?.email || 'email@exemple.com';
    const avatar = profile?.avatar_url;

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.profileInfoContainer}>
                        <View style={styles.avatarContainer}>
                            {avatar ? (
                                <Image
                                    source={{ uri: avatar }}
                                    style={{ width: '100%', height: '100%', borderRadius: 24 }}
                                    resizeMode="cover"
                                />
                            ) : (
                                <Ionicons name="person-outline" size={40} color="#000833" />
                            )}
                        </View>
                        <View style={styles.profileTextContainer}>
                            <Text style={styles.userName}>{userName}</Text>
                            <Text style={styles.userEmail}>{userEmail}</Text>
                        </View>
                        <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/settings')}>
                            <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <Text style={styles.sectionTitle}>STATISTIQUES</Text>
                {statsLoading ? (
                    <ActivityIndicator color="#000833" style={{ marginBottom: 32 }} />
                ) : (
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>{totalBoxes}</Text>
                            <Text style={styles.statLabel}>Cartons</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>{totalItems}</Text>
                            <Text style={styles.statLabel}>Objets</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>{totalProjects}</Text>
                            <Text style={styles.statLabel}>Projets</Text>
                        </View>
                    </View>
                )}

                <Text style={styles.sectionTitle}>PROJETS</Text>

                {statsLoading ? (
                    <ActivityIndicator color="#000833" style={{ marginBottom: 32 }} />
                ) : projects.length === 0 ? (
                    <TouchableOpacity
                        style={styles.emptyProjectCard}
                        onPress={() => router.push('/new-project')}
                    >
                        <Ionicons name="add-circle-outline" size={32} color="#A7A9BE" />
                        <Text style={styles.emptyProjectText}>Créer un projet</Text>
                    </TouchableOpacity>
                ) : (
                    projects.map(project => {
                        const stats = allStats.find(s => s.project_id === project.id);
                        const total = Number(stats?.total_boxes ?? 0);
                        const done  = Number(stats?.boxes_sealed ?? 0) + Number(stats?.boxes_unpacked ?? 0);
                        const progress = total > 0 ? Math.round((done / total) * 100) : 0;
                        const isComplete = progress === 100;

                        return (
                            <TouchableOpacity
                                key={project.id}
                                activeOpacity={0.9}
                                onPress={() => router.push({ pathname: '/project-dashboard', params: { projectId: project.id } })}
                            >
                                <View style={styles.projectCard}>
                                    <View style={styles.projectHeader}>
                                        <Text style={styles.projectName} numberOfLines={1}>{project.name}</Text>
                                        <View style={[
                                            styles.statusBadge,
                                            { backgroundColor: isComplete ? '#D1FAE5' : '#EFF6FF' },
                                        ]}>
                                            <Text style={[
                                                styles.statusText,
                                                { color: isComplete ? '#10B981' : '#3B82F6' },
                                            ]}>
                                                {isComplete ? 'Terminé' : 'Actif'}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.projectDate}>
                                        {format(new Date(project.created_at), 'd MMM yyyy', { locale: fr })}
                                        {stats ? ` • ${stats.total_boxes} carton${Number(stats.total_boxes) !== 1 ? 's' : ''}` : ''}
                                    </Text>
                                    <View style={styles.progressRow}>
                                        <View style={styles.progressBarBg}>
                                            <View
                                                style={[
                                                    styles.progressBarFill,
                                                    {
                                                        width: `${progress}%`,
                                                        backgroundColor: isComplete ? '#10B981' : '#000833',
                                                    },
                                                ]}
                                            />
                                        </View>
                                        <Text style={[styles.progressText, isComplete && { color: '#10B981' }]}>
                                            {progress}%
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}

                {/* Paramètres */}
                <Text style={styles.sectionTitle}>AUTRE</Text>

                <View style={styles.menuContainer}>
                    <TouchableOpacity style={styles.itemCard}>
                        <View style={styles.iconBox}>
                            <Feather name="shield" size={20} color="#000833" />
                        </View>
                        <View style={styles.itemContent}>
                            <Text style={styles.itemTitle}>Confidentialité</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#A7A9BE" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.itemCard}>
                        <View style={styles.iconBox}>
                            <Feather name="help-circle" size={20} color="#000833" />
                        </View>
                        <View style={styles.itemContent}>
                            <Text style={styles.itemTitle}>Aide & Support</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#A7A9BE" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.itemCard} onPress={signOut}>
                        <View style={[styles.iconBox, { backgroundColor: '#FEF2F2' }]}>
                            <Feather name="log-out" size={20} color="#EF4444" />
                        </View>
                        <View style={styles.itemContent}>
                            <Text style={[styles.itemTitle, { color: '#EF4444' }]}>Se déconnecter</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#A7A9BE" />
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FB' },
    headerContainer: { backgroundColor: '#000833', paddingBottom: 30 },
    settingsButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    profileInfoContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginTop: 20 },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        overflow: 'hidden',
    },
    profileTextContainer: { flex: 1 },
    userName: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: '#FFFFFF', marginBottom: 4 },
    userEmail: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: '#A7A9BE' },

    scrollContent: { padding: 24, paddingBottom: 100 },
    sectionTitle: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 14,
        color: '#000833',
        textTransform: 'uppercase',
        marginBottom: 16,
        marginTop: 8,
    },

    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        marginHorizontal: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statNumber: { fontFamily: 'Outfit_700Bold', fontSize: 24, color: '#000833', marginBottom: 4 },
    statLabel: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: '#6E7591' },

    projectCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    projectHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    projectName: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#000833', flex: 1, marginRight: 8 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontFamily: 'Outfit_600SemiBold', fontSize: 12 },
    projectDate: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: '#6E7591', marginBottom: 16 },
    progressRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    progressBarBg: { flex: 1, height: 6, backgroundColor: '#F0F2F5', borderRadius: 3, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 3 },
    progressText: { fontFamily: 'Outfit_700Bold', fontSize: 12, color: '#000833' },

    emptyProjectCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#E6E8F0',
        gap: 8,
    },
    emptyProjectText: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: '#A7A9BE' },

    menuContainer: { marginTop: 8 },
    itemCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 1,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F8F9FB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    itemContent: { flex: 1 },
    itemTitle: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: '#000833' },
});
