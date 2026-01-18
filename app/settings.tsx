
import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(false);
    const [darkModeEnabled, setDarkModeEnabled] = useState(false);

    const handleBack = () => {
        router.back();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <SafeAreaView edges={['top']} style={styles.safeHeader}>
                    <Text style={styles.topLabel}>PARAMÈTRES</Text>
                    <View style={styles.navRow}>
                        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>PARAMÈTRES</Text>
                        <View style={{ width: 24 }} />
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* COMPTE */}
                <Text style={styles.sectionTitle}>COMPTE</Text>
                <TouchableOpacity style={styles.itemCard}>
                    <View style={styles.iconBox}>
                        <Feather name="user" size={20} color="#000833" />
                    </View>
                    <View style={styles.itemContent}>
                        <Text style={styles.itemTitle}>Informations personnelles</Text>
                        <Text style={styles.itemSubtitle}>Nom, email, téléphone</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#A7A9BE" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.itemCard}>
                    <View style={styles.iconBox}>
                        <Feather name="lock" size={20} color="#000833" />
                    </View>
                    <View style={styles.itemContent}>
                        <Text style={styles.itemTitle}>Mot de passe</Text>
                        <Text style={styles.itemSubtitle}>Modifier votre mot de passe</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#A7A9BE" />
                </TouchableOpacity>

                {/* NOTIFICATIONS */}
                <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
                <View style={styles.itemCard}>
                    <View style={styles.iconBox}>
                        <Feather name="bell" size={20} color="#000833" />
                    </View>
                    <View style={styles.itemContent}>
                        <Text style={styles.itemTitle}>Notifications push</Text>
                        <Text style={styles.itemSubtitle}>Recevoir des notifications</Text>
                    </View>
                    <Switch
                        trackColor={{ false: '#E6E8F0', true: '#000833' }}
                        thumbColor={'#FFFFFF'}
                        ios_backgroundColor="#E6E8F0"
                        onValueChange={setPushEnabled}
                        value={pushEnabled}
                    />
                </View>

                <View style={styles.itemCard}>
                    <View style={styles.iconBox}>
                        <Feather name="mail" size={20} color="#000833" />
                    </View>
                    <View style={styles.itemContent}>
                        <Text style={styles.itemTitle}>Notifications email</Text>
                        <Text style={styles.itemSubtitle}>Recevoir des emails</Text>
                    </View>
                    <Switch
                        trackColor={{ false: '#E6E8F0', true: '#000833' }}
                        thumbColor={'#FFFFFF'}
                        ios_backgroundColor="#E6E8F0"
                        onValueChange={setEmailEnabled}
                        value={emailEnabled}
                    />
                </View>

                {/* PRÉFÉRENCES */}
                <Text style={styles.sectionTitle}>PRÉFÉRENCES</Text>
                <TouchableOpacity style={styles.itemCard}>
                    <View style={styles.iconBox}>
                        <Feather name="globe" size={20} color="#000833" />
                    </View>
                    <View style={styles.itemContent}>
                        <Text style={styles.itemTitle}>Langue</Text>
                        <Text style={styles.itemSubtitle}>Français</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#A7A9BE" />
                </TouchableOpacity>

                <View style={styles.itemCard}>
                    <View style={styles.iconBox}>
                        <Feather name="moon" size={20} color="#000833" />
                    </View>
                    <View style={styles.itemContent}>
                        <Text style={styles.itemTitle}>Mode sombre</Text>
                        <Text style={styles.itemSubtitle}>Thème de l'application</Text>
                    </View>
                    <Switch
                        trackColor={{ false: '#E6E8F0', true: '#000833' }}
                        thumbColor={'#FFFFFF'}
                        ios_backgroundColor="#E6E8F0"
                        onValueChange={setDarkModeEnabled}
                        value={darkModeEnabled}
                    />
                </View>

                {/* DONNÉES */}
                <Text style={styles.sectionTitle}>DONNÉES</Text>
                <TouchableOpacity style={styles.itemCard}>
                    <View style={styles.iconBox}>
                        <Feather name="download" size={20} color="#000833" />
                    </View>
                    <View style={styles.itemContent}>
                        <Text style={styles.itemTitle}>Exporter mes données</Text>
                        <Text style={styles.itemSubtitle}>Télécharger toutes vos données</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#A7A9BE" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.itemCard}>
                    <View style={[styles.iconBox, { backgroundColor: '#FEF2F2' }]}>
                        <Feather name="trash-2" size={20} color="#EF4444" />
                    </View>
                    <View style={styles.itemContent}>
                        <Text style={[styles.itemTitle, { color: '#EF4444' }]}>Supprimer mon compte</Text>
                        <Text style={styles.itemSubtitle}>Action irréversible</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#A7A9BE" />
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FB' },
    headerContainer: { backgroundColor: '#000833', paddingBottom: 20 },
    safeHeader: { paddingHorizontal: 24 },
    topLabel: { fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: '#FFFFFF', marginTop: 10, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 },
    navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    backButton: { padding: 4 },
    headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: '#FFFFFF', textTransform: 'uppercase', marginBottom: 4 }, // Centered title visually via space-between

    content: { padding: 24, paddingBottom: 40 },
    sectionTitle: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: '#000833', textTransform: 'uppercase', marginBottom: 12, marginTop: 12 },

    itemCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 },
    iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginRight: 16 }, // Plain white in design? No looks like minimal icon
    // Actually looking closely at image, icons don't have box background, just icon. 
    // Wait, let's look closer. "Informations personnelles" has a user icon.
    // The previous design (compte) had grey boxes. This one seems clean. 
    // Ah, wait, re-checking image "uploaded_image_1768741534021.png".
    // It seems they are simple icons on the left, no box background.
    // BUT "Supprimer" has a red bin.
    // Let's stick to clean icons without background for this one, or very subtle.
    // Actually, let's keep it simple as just icon.

    itemContent: { flex: 1 },
    itemTitle: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#000833', marginBottom: 2 },
    itemSubtitle: { fontFamily: 'Outfit_400Regular', fontSize: 13, color: '#6E7591' },
});
