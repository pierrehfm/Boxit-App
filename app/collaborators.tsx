
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CollaboratorsScreen() {
    const handleBack = () => {
        router.back();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <SafeAreaView edges={['top']} style={styles.safeHeader}>
                    <View style={styles.navRow}>
                        <TouchableOpacity onPress={handleBack}>
                            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.addUserButton}>
                            <Feather name="user-plus" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.headerTitle}>COLLABORATEURS</Text>
                    <Text style={styles.headerSubtitle}>Déménagement Paris</Text>
                </SafeAreaView>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* ADMINISTRATEURS */}
                <Text style={styles.sectionTitle}>ADMINISTRATEURS</Text>
                <View style={styles.card}>
                    <View style={[styles.avatarBox, { backgroundColor: '#000833' }]}>
                        <Ionicons name="person-outline" size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.name}>Jérémy Duc</Text>
                        <Text style={styles.email}>jeremy.duc@email.com</Text>
                    </View>
                    <View style={styles.adminBadge}>
                        <Text style={styles.adminBadgeText}>Admin</Text>
                    </View>
                </View>

                {/* MEMBRES */}
                <Text style={styles.sectionTitle}>MEMBRES</Text>

                <View style={styles.card}>
                    <View style={[styles.avatarBox, { backgroundColor: '#E6E8F0' }]}>
                        <Ionicons name="person-outline" size={24} color="#6E7591" />
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.name}>Miaou miaou</Text>
                        <Text style={styles.email}>blebleble@email.com</Text>
                    </View>
                    <TouchableOpacity>
                        <MaterialCommunityIcons name="dots-vertical" size={24} color="#A7A9BE" />
                    </TouchableOpacity>
                </View>

                <View style={styles.card}>
                    <View style={[styles.avatarBox, { backgroundColor: '#E6E8F0' }]}>
                        <Ionicons name="person-outline" size={24} color="#6E7591" />
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.name}>thomas le s</Text>
                        <Text style={styles.email}>thomas.dubois@email.com</Text>
                    </View>
                    <TouchableOpacity>
                        <MaterialCommunityIcons name="dots-vertical" size={24} color="#A7A9BE" />
                    </TouchableOpacity>
                </View>

            </ScrollView>

            {/* Footer Button */}
            <SafeAreaView edges={['bottom']} style={styles.footer}>
                <TouchableOpacity style={styles.inviteButton}>
                    <Feather name="user-plus" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.inviteButtonText}>Inviter un collaborateur</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FB' },
    headerContainer: { backgroundColor: '#000833', paddingBottom: 24 },
    safeHeader: { paddingHorizontal: 24 },
    navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 10 },
    addUserButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 24, color: '#FFFFFF', textTransform: 'uppercase', marginBottom: 4 },
    headerSubtitle: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: '#A7A9BE' },

    content: { padding: 24, paddingBottom: 100 },

    sectionTitle: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: '#000833', textTransform: 'uppercase', marginBottom: 16, marginTop: 8 },

    card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    avatarBox: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    cardContent: { flex: 1 },
    name: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#000833', marginBottom: 2 },
    email: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: '#6E7591' },

    adminBadge: { backgroundColor: '#DBEAFE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    adminBadgeText: { fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: '#3B82F6' },

    footer: { padding: 24, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E6E8F0' },
    inviteButton: { backgroundColor: '#000833', borderRadius: 12, paddingVertical: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    inviteButtonText: { fontFamily: 'Outfit_600SemiBold', color: '#FFFFFF', fontSize: 16 },
});
