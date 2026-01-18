
import { useSession } from '@/context/AuthContext';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CompteScreen() {
    const { signOut } = useSession();

    const handleLogout = () => {
        signOut();
        // Redirect to start screen is handled by the root layout via session state,
        // but explicit replace helps UX sometimes. 
        // Usually replacing user state is enough.
    };

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.headerContainer}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.topRow}>
                        <Text style={styles.pageTitle}>PROFIL</Text>
                        <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/settings')}>
                            <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.profileInfoContainer}>
                        <View style={styles.avatarContainer}>
                            <Ionicons name="person-outline" size={40} color="#000833" />
                        </View>
                        <View style={styles.profileTextContainer}>
                            <Text style={styles.userName}>JÉRÉMY DUC</Text>
                            <Text style={styles.userEmail}>jeremy.duc@email.com</Text>
                        </View>
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Statistiques */}
                <Text style={styles.sectionTitle}>STATISTIQUES</Text>
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>24</Text>
                        <Text style={styles.statLabel}>Cartons</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>52</Text>
                        <Text style={styles.statLabel}>Objets</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>3</Text>
                        <Text style={styles.statLabel}>Projets</Text>
                    </View>
                </View>

                {/* Projets */}
                <Text style={styles.sectionTitle}>PROJETS</Text>

                {/* Project Card 1 - Active */}
                <View style={styles.projectCard}>
                    <View style={styles.projectHeader}>
                        <Text style={styles.projectName}>Déménagement Paris</Text>
                        <View style={[styles.statusBadge, { backgroundColor: '#D1FAE5' }]}>
                            <Text style={[styles.statusText, { color: '#10B981' }]}>Actif</Text>
                        </View>
                    </View>
                    <Text style={styles.projectDate}>15 Jan 2026</Text>
                    <View style={styles.progressRow}>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: '25%', backgroundColor: '#000833' }]} />
                        </View>
                        <Text style={styles.progressText}>25%</Text>
                    </View>
                </View>

                {/* Project Card 2 - Finished */}
                <View style={styles.projectCard}>
                    <View style={styles.projectHeader}>
                        <Text style={styles.projectName}>Déménagement Lyon</Text>
                        <View style={[styles.statusBadge, { backgroundColor: '#F0F2F5' }]}>
                            <Text style={[styles.statusText, { color: '#6E7591' }]}>Terminé</Text>
                        </View>
                    </View>
                    <Text style={styles.projectDate}>10 Déc 2025</Text>
                    <View style={styles.progressRow}>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: '100%', backgroundColor: '#10B981' }]} />
                        </View>
                        <Text style={[styles.progressText, { color: '#10B981' }]}>100%</Text>
                    </View>
                </View>

                {/* Paramètres */}
                <Text style={styles.sectionTitle}>PARAMÈTRES</Text>

                <View style={styles.menuContainer}>
                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconBox}>
                            <Feather name="user" size={20} color="#000833" />
                        </View>
                        <Text style={styles.menuText}>Modifier le profil</Text>
                        <Ionicons name="chevron-forward" size={20} color="#A7A9BE" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconBox}>
                            <Feather name="bell" size={20} color="#000833" />
                        </View>
                        <Text style={styles.menuText}>Notifications</Text>
                        <Ionicons name="chevron-forward" size={20} color="#A7A9BE" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconBox}>
                            <Feather name="shield" size={20} color="#000833" />
                        </View>
                        <Text style={styles.menuText}>Confidentialité</Text>
                        <Ionicons name="chevron-forward" size={20} color="#A7A9BE" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconBox}>
                            <Feather name="help-circle" size={20} color="#000833" />
                        </View>
                        <Text style={styles.menuText}>Aide & Support</Text>
                        <Ionicons name="chevron-forward" size={20} color="#A7A9BE" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                        <View style={[styles.menuIconBox, { backgroundColor: '#FEF2F2' }]}>
                            <Feather name="log-out" size={20} color="#EF4444" />
                        </View>
                        <Text style={[styles.menuText, { color: '#EF4444' }]}>Se déconnecter</Text>
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
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 10 },
    pageTitle: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 1 },
    settingsButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center' },

    profileInfoContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginTop: 20 },
    avatarContainer: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    profileTextContainer: { flex: 1 },
    userName: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: '#FFFFFF', textTransform: 'uppercase', marginBottom: 4 },
    userEmail: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: '#A7A9BE' },

    scrollContent: { padding: 24, paddingBottom: 100 },
    sectionTitle: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: '#000833', textTransform: 'uppercase', marginBottom: 16, marginTop: 8 },

    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
    statCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, alignItems: 'center', marginHorizontal: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    statNumber: { fontFamily: 'Outfit_700Bold', fontSize: 24, color: '#000833', marginBottom: 4 },
    statLabel: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: '#6E7591' },

    projectCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    projectHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    projectName: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#000833' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontFamily: 'Outfit_600SemiBold', fontSize: 12 },
    projectDate: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: '#6E7591', marginBottom: 16 },
    progressRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    progressBarBg: { flex: 1, height: 6, backgroundColor: '#F0F2F5', borderRadius: 3 },
    progressBarFill: { height: '100%', borderRadius: 3 },
    progressText: { fontFamily: 'Outfit_700Bold', fontSize: 12, color: '#000833' },

    menuContainer: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 8, marginTop: 8 },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F8F9FB' },
    menuIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F0F2F5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    menuText: { flex: 1, fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: '#000833' },
});
