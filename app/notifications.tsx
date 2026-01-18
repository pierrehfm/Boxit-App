
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const NOTIFICATIONS = [
    {
        section: "AUJOURD'HUI",
        data: [
            { id: '1', title: 'Nouveau carton créé', body: 'Sophie Martingue a créé le carton "Vaisselle Cuisine"', time: 'Il y a 5 minutes', icon: 'package-variant-closed', color: '#3B82F6', bgColor: '#DBEAFE' },
            { id: '2', title: 'Carton scellé', body: 'Le carton "Livres Bibliothèque" a été scellé', time: 'Il y a 2 heures', icon: 'check-circle-outline', color: '#10B981', bgColor: '#D1FAE5' },
            { id: '3', title: 'Nouveau collaborateur', body: 'Thomas Dubois a rejoint le projet', time: 'Il y a 4 heures', icon: 'account-plus-outline', color: '#A855F7', bgColor: '#F3E8FF' },
        ]
    },
    {
        section: "HIER",
        data: [
            { id: '4', title: 'Carton en transport', body: 'Le carton "Meubles Salon" est en cours de transport', time: 'Hier à 14:30', icon: 'truck-delivery-outline', color: '#6E7591', bgColor: '#F0F2F5', border: '#E6E8F0' },
            { id: '5', title: 'Carton déballé', body: 'Marie Lefebvre a déballé "Meuble Enfant"', time: 'Hier à 16:45', icon: 'package-variant', color: '#6E7591', bgColor: '#F0F2F5', border: '#E6E8F0' },
        ]
    },
    {
        section: "CETTE SEMAINE",
        data: [
            { id: '6', title: 'Rappel', body: "N'oubliez pas de sceller vos cartons avant le déménagement", time: 'Il y a 3 jours', icon: 'bell-outline', color: '#6E7591', bgColor: '#F0F2F5', border: '#E6E8F0' },
        ]
    }
];

export default function NotificationsScreen() {
    const handleBack = () => {
        router.back();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <SafeAreaView edges={['top']} style={styles.safeHeader}>
                    <View style={styles.navRow}>
                        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>NOTIFICATIONS</Text>
                        <View style={{ width: 24 }} />
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {NOTIFICATIONS.map((section, sIndex) => (
                    <View key={sIndex} style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>{section.section}</Text>
                        {section.data.map((item, index) => (
                            <View key={item.id} style={styles.cardContainer}>
                                <View style={[styles.leftStrip, { backgroundColor: item.border || item.color }]} />
                                <View style={styles.cardInner}>
                                    <View style={[styles.iconBox, { backgroundColor: item.bg || item.bgColor }]}>
                                        <MaterialCommunityIcons name={item.icon as any} size={24} color={item.color} />
                                    </View>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.title}>{item.title}</Text>
                                        <Text style={styles.body}>{item.body}</Text>
                                        <Text style={styles.time}>{item.time}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FB' },
    headerContainer: { backgroundColor: '#000833', paddingBottom: 20 },
    safeHeader: { paddingHorizontal: 24 },
    navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
    backButton: {},
    headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: '#FFFFFF', textTransform: 'uppercase' },

    content: { padding: 24, paddingBottom: 40 },
    sectionContainer: { marginBottom: 24 },
    sectionTitle: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: '#000833', textTransform: 'uppercase', marginBottom: 16 },

    cardContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        flexDirection: 'row',
        overflow: 'hidden', // to clip the left strip if needed, but styling allows separate
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
    },
    leftStrip: {
        width: 6,
        height: '100%',
    },
    cardInner: {
        flex: 1,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    title: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#000833', marginBottom: 4 },
    body: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: '#6E7591', marginBottom: 8, lineHeight: 20 },
    time: { fontFamily: 'Outfit_400Regular', fontSize: 13, color: '#A7A9BE' },
});
