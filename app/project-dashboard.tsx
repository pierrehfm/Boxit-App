
import { api, Project, ProjectMember, ProjectStats } from '@/lib/api';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProjectDashboardScreen() {
    const { projectId } = useLocalSearchParams<{ projectId: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [stats, setStats] = useState<ProjectStats | null>(null);
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [roomStats, setRoomStats] = useState<{ name: string; count: number; progress: number }[]>([]);
    const [loading, setLoading] = useState(true);

    const handleBack = () => {
        router.back();
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                let currentProjectId = projectId;
                if (!currentProjectId) {
                    // Fallback to first project if not provided
                    const projects = await api.getUserProjects();
                    if (projects.length > 0) currentProjectId = projects[0].id;
                    else {
                        setLoading(false);
                        return;
                    }
                }

                const [p, s, boxes, m] = await Promise.all([
                    api.getProject(currentProjectId),
                    api.getProjectStats(currentProjectId),
                    api.getAllBoxes(currentProjectId),
                    api.getProjectMembers(currentProjectId)
                ]);

                setProject(p);
                setStats(s);
                setMembers(m);

                const rooms: Record<string, { total: number; sealed: number }> = {};
                boxes.forEach(box => {
                    const roomName = box.room || 'Sans pièce';
                    if (!rooms[roomName]) rooms[roomName] = { total: 0, sealed: 0 };
                    rooms[roomName].total++;
                    if (box.status === 'sealed' || box.status === 'unpacked') {
                        rooms[roomName].sealed++;
                    }
                });

                const roomStatsArray = Object.keys(rooms).map(name => ({
                    name,
                    count: rooms[name].total,
                    progress: Math.round((rooms[name].sealed / rooms[name].total) * 100)
                }));
                roomStatsArray.sort((a, b) => b.count - a.count);

                setRoomStats(roomStatsArray);

            } catch (e) {
                console.error("Error loading project dashboard:", e);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [projectId]);

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#000833" />
            </View>
        );
    }

    if (!project || !stats) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ fontFamily: 'Outfit_600SemiBold', color: '#000833' }}>Projet introuvable</Text>
                <TouchableOpacity onPress={handleBack} style={{ marginTop: 20 }}>
                    <Text style={{ color: '#000833', textDecorationLine: 'underline' }}>Retour</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const globalProgress = stats.total_boxes > 0
        ? Math.round(((stats.boxes_sealed + stats.boxes_unpacked) / stats.total_boxes) * 100)
        : 0;

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <SafeAreaView edges={['top']} style={styles.safeHeader}>
                    <Text style={styles.topLabel}>PROJET DASHBOARD</Text>

                    <View style={styles.navRow}>
                        <TouchableOpacity onPress={handleBack}>
                            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <MaterialCommunityIcons name="dots-vertical" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.titleContainer}>
                        <Text style={styles.projectTitle} numberOfLines={2}>{project.name}</Text>
                        <Text style={styles.projectDate}>
                            {format(new Date(project.created_at), 'd MMMM yyyy', { locale: fr })}
                        </Text>
                    </View>

                    <View style={styles.progressCard}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>Progression globale</Text>
                            <Text style={styles.progressValue}>{globalProgress}%</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${globalProgress}%` }]} />
                        </View>
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <View style={[styles.statIconBox, { backgroundColor: '#000833' }]}>
                            <Feather name="box" size={24} color="#FFFFFF" />
                        </View>
                        <Text style={styles.statNumber}>{stats.total_boxes}</Text>
                        <Text style={styles.statLabel}>Cartons totaux</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={[styles.statIconBox, { backgroundColor: '#D1FAE5' }]}>
                            <Ionicons name="checkmark-circle-outline" size={24} color="#10B981" />
                        </View>
                        <Text style={[styles.statNumber, { color: '#10B981' }]}>{stats.boxes_sealed}</Text>
                        <Text style={styles.statLabel}>Cartons scellés</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={[styles.statIconBox, { backgroundColor: '#DBEAFE' }]}>
                            <MaterialCommunityIcons name="progress-clock" size={24} color="#3B82F6" />
                        </View>
                        <Text style={[styles.statNumber, { color: '#3B82F6' }]}>{stats.boxes_filling}</Text>
                        <Text style={styles.statLabel}>En cours</Text>
                    </View>


                    <View style={styles.statCard}>
                        <View style={[styles.statIconBox, { backgroundColor: '#F0F2F5' }]}>
                            <MaterialCommunityIcons name="package-variant" size={24} color="#6E7591" />
                        </View>
                        <Text style={[styles.statNumber, { color: '#6E7591' }]}>{stats.boxes_unpacked}</Text>
                        <Text style={styles.statLabel}>Déballés</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>PAR PIÈCE</Text>

                {roomStats.length > 0 ? (
                    roomStats.map((room) => (
                        <View key={room.name} style={styles.roomRow}>
                            <View style={styles.roomIconBox}>
                                <MaterialCommunityIcons name="home-outline" size={24} color="#FFFFFF" />
                            </View>
                            <View style={styles.roomInfo}>
                                <Text style={styles.roomName}>{room.name}</Text>
                                <Text style={styles.roomSubtext}>{room.count} cartons</Text>
                            </View>
                            <Text style={styles.roomPercentage}>{room.progress}%</Text>
                        </View>
                    ))
                ) : (
                    <Text style={{ color: '#6E7591', fontFamily: 'Outfit_400Regular' }}>Aucune donnée de pièce disponible.</Text>
                )}

                <Text style={styles.sectionTitle}>ÉQUIPE</Text>
                <View style={styles.teamCard}>
                    <View style={styles.teamHeader}>
                        <View style={styles.avatarRow}>
                            {members.slice(0, 3).map((member, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.avatarCircle,
                                        {
                                            zIndex: 3 - index,
                                            marginLeft: index > 0 ? -10 : 0,
                                            backgroundColor: '#E6E8F0',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            overflow: 'hidden'
                                        }
                                    ]}
                                >
                                    {member.avatar_url ? (

                                        <Ionicons name="person" size={16} color="#000833" />
                                    ) : (
                                        <Ionicons name="person-outline" size={16} color="#000833" />
                                    )}
                                </View>
                            ))}
                            {members.length > 3 && (
                                <View style={[styles.avatarCircle, { backgroundColor: '#E6E8F0', marginLeft: -10, zIndex: 0, justifyContent: 'center', alignItems: 'center' }]}>
                                    <Text style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 10, color: '#6E7591' }}>+{members.length - 3}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.teamCount}>{members.length} collaborateur{members.length > 1 ? 's' : ''}</Text>
                    </View>

                    <TouchableOpacity style={styles.manageButton} onPress={() => router.push('/collaborators')}>
                        <Text style={styles.manageButtonText}>Gérer l'équipe</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FB' },
    headerContainer: { backgroundColor: '#000833', paddingBottom: 20 },
    safeHeader: { paddingHorizontal: 24 },
    topLabel: { fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: '#FFFFFF', marginTop: 10, textTransform: 'uppercase', letterSpacing: 1 },
    navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, marginBottom: 20 },

    titleContainer: { marginBottom: 20 },
    projectTitle: { fontFamily: 'Outfit_700Bold', fontSize: 24, color: '#FFFFFF', textTransform: 'uppercase', marginBottom: 4 },
    projectDate: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: '#A7A9BE' },

    progressCard: { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 16, padding: 16 },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progressLabel: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: '#A7A9BE' },
    progressValue: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#FFFFFF' },
    progressBarBg: { height: 8, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 4 },
    progressBarFill: { height: '100%', backgroundColor: '#FFFFFF', borderRadius: 4 },

    content: { padding: 24, paddingBottom: 40 },

    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
    statCard: { width: '48%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    statIconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    statNumber: { fontFamily: 'Outfit_700Bold', fontSize: 24, color: '#000833', marginBottom: 4 },
    statLabel: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: '#6E7591' },

    sectionTitle: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: '#000833', textTransform: 'uppercase', marginBottom: 16, marginTop: 8 },

    roomRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12 },
    roomIconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#000833', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    roomInfo: { flex: 1 },
    roomName: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#000833' },
    roomSubtext: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: '#6E7591' },
    roomPercentage: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#000833' },

    teamCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20 },
    teamHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    avatarRow: { flexDirection: 'row', marginRight: 16 },
    avatarCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#FFFFFF' },
    teamCount: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: '#6E7591' },

    manageButton: { borderWidth: 1, borderColor: '#000833', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
    manageButtonText: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: '#000833' },
});
