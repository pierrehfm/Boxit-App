
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProjectDashboardScreen() {
    const handleBack = () => {
        router.back();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
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
                        <Text style={styles.projectTitle}>DÉMÉNAGEMENT PARIS</Text>
                        <Text style={styles.projectDate}>15 Janvier 2026</Text>
                    </View>

                    <View style={styles.progressCard}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>Progression globale</Text>
                            <Text style={styles.progressValue}>25%</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: '25%' }]} />
                        </View>
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <View style={[styles.statIconBox, { backgroundColor: '#000833' }]}>
                            <Feather name="box" size={24} color="#FFFFFF" />
                        </View>
                        <Text style={styles.statNumber}>24</Text>
                        <Text style={styles.statLabel}>Cartons totaux</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={[styles.statIconBox, { backgroundColor: '#D1FAE5' }]}>
                            <Ionicons name="checkmark-circle-outline" size={24} color="#10B981" />
                        </View>
                        <Text style={[styles.statNumber, { color: '#10B981' }]}>6</Text>
                        <Text style={styles.statLabel}>Cartons scellés</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={[styles.statIconBox, { backgroundColor: '#DBEAFE' }]}>
                            <MaterialCommunityIcons name="progress-clock" size={24} color="#3B82F6" />
                        </View>
                        <Text style={[styles.statNumber, { color: '#3B82F6' }]}>12</Text>
                        <Text style={styles.statLabel}>En cours</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={[styles.statIconBox, { backgroundColor: '#F0F2F5' }]}>
                            <MaterialCommunityIcons name="package-variant" size={24} color="#6E7591" />
                        </View>
                        <Text style={[styles.statNumber, { color: '#6E7591' }]}>6</Text>
                        <Text style={styles.statLabel}>Vides</Text>
                    </View>
                </View>

                {/* Par Pièce */}
                <Text style={styles.sectionTitle}>PAR PIÈCE</Text>

                <View style={styles.roomRow}>
                    <View style={styles.roomIconBox}>
                        <MaterialCommunityIcons name="sofa-outline" size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.roomInfo}>
                        <Text style={styles.roomName}>Salon</Text>
                        <Text style={styles.roomSubtext}>8 cartons</Text>
                    </View>
                    <Text style={styles.roomPercentage}>33%</Text>
                </View>

                <View style={styles.roomRow}>
                    <View style={styles.roomIconBox}>
                        <MaterialCommunityIcons name="silverware-fork-knife" size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.roomInfo}>
                        <Text style={styles.roomName}>Cuisine</Text>
                        <Text style={styles.roomSubtext}>6 cartons</Text>
                    </View>
                    <Text style={styles.roomPercentage}>25%</Text>
                </View>

                <View style={styles.roomRow}>
                    <View style={styles.roomIconBox}>
                        <MaterialCommunityIcons name="bed-outline" size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.roomInfo}>
                        <Text style={styles.roomName}>Chambre</Text>
                        <Text style={styles.roomSubtext}>10 cartons</Text>
                    </View>
                    <Text style={styles.roomPercentage}>42%</Text>
                </View>

                {/* Équipe */}
                <Text style={styles.sectionTitle}>ÉQUIPE</Text>
                <View style={styles.teamCard}>
                    <View style={styles.teamHeader}>
                        <View style={styles.avatarRow}>
                            <View style={[styles.avatarCircle, { backgroundColor: '#000833', zIndex: 3 }]}>
                                <Ionicons name="person-outline" size={16} color="#FFFFFF" />
                            </View>
                            <View style={[styles.avatarCircle, { backgroundColor: '#E6E8F0', marginLeft: -10, zIndex: 2 }]} />
                            <View style={[styles.avatarCircle, { backgroundColor: '#E6E8F0', marginLeft: -10, zIndex: 1 }]} />
                            <View style={[styles.avatarCircle, { backgroundColor: '#E6E8F0', marginLeft: -10, zIndex: 0, justifyContent: 'center', alignItems: 'center' }]}>
                                <Text style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 10, color: '#6E7591' }}>+1</Text>
                            </View>
                        </View>
                        <Text style={styles.teamCount}>4 collaborateurs</Text>
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
