
import { useSession } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CompteScreen() {
    const { user, signOut } = useSession();
    const [profile, setProfile] = React.useState<any>(null);

    useFocusEffect(
        useCallback(() => {
            if (user) {
                getProfile();
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

            if (error) {
                console.warn('Error fetching profile:', error);
            }

            if (data) {
                setProfile(data);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const handleLogout = () => {
        signOut();
    };

    const userName = profile?.full_name || 'Utilisateur';
    const userEmail = user?.email || 'email@exemple.com';
    const avatar = profile?.avatar_url;


    return (
        <View style={styles.container}>
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
                <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/project-dashboard')}>
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
                </TouchableOpacity>

                {/* Project Card 2 - Finished */}
                <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/project-dashboard')}>
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
                </TouchableOpacity>

                {/* Paramètres */}
                <Text style={styles.sectionTitle}>PARAMÈTRES</Text>

                {/* Paramètres */}
                <Text style={styles.sectionTitle}>PARAMÈTRES</Text>

                <View style={styles.menuContainer}>
                    <TouchableOpacity style={styles.itemCard} onPress={() => router.push('/edit-profile')}>
                        <View style={styles.iconBox}>
                            <Feather name="user" size={20} color="#000833" />
                        </View>
                        <View style={styles.itemContent}>
                            <Text style={styles.itemTitle}>Modifier le profil</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#A7A9BE" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.itemCard}>
                        <View style={styles.iconBox}>
                            <Feather name="bell" size={20} color="#000833" />
                        </View>
                        <View style={styles.itemContent}>
                            <Text style={styles.itemTitle}>Notifications</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#A7A9BE" />
                    </TouchableOpacity>

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

                    <TouchableOpacity style={styles.itemCard} onPress={handleLogout}>
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
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 10 },
    pageTitle: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 1 },
    settingsButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center' },

    profileInfoContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginTop: 20 },
    avatarContainer: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginRight: 16, overflow: 'hidden' },
    profileTextContainer: { flex: 1 },
    userName: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: '#FFFFFF', marginBottom: 4 },
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

    menuContainer: { marginTop: 8 },
    itemCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 },
    iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F8F9FB', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    itemContent: { flex: 1 },
    itemTitle: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: '#000833' },
});
