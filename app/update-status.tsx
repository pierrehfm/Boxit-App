
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STATUS_OPTIONS = [
    { id: 'vide', label: 'Vide', description: 'Le carton est vide et prêt à être rempli', icon: 'package-variant', color: '#6E7591', bgColor: '#F0F2F5' },
    { id: 'en_cours', label: 'En cours', description: 'Le carton est en cours de remplissage', icon: 'loading', color: '#3B82F6', bgColor: '#DBEAFE' }, // loading isn't a direct mci name usually, maybe 'progress-clock' or 'circle-slice-5'
    { id: 'termine', label: 'Terminé', description: 'Le carton est fermé et prêt à être transporté', icon: 'check-circle-outline', color: '#10B981', bgColor: '#D1FAE5' },
    { id: 'transport', label: 'En transport', description: 'Le carton est en cours de transport', icon: 'truck-delivery-outline', color: '#3B82F6', bgColor: '#DBEAFE' },
    { id: 'livre', label: 'Livré', description: 'Le carton est arrivé à destination', icon: 'home-outline', color: '#8B5CF6', bgColor: '#F3E8FF' },
];

export default function UpdateStatusScreen() {
    const [selectedStatus, setSelectedStatus] = useState('termine');

    const handleBack = () => {
        router.back();
    };

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>MODIFIER LE STATUT</Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.summaryCard}>
                    <View style={styles.summaryIconContainer}>
                        <MaterialCommunityIcons name="book-open-page-variant" size={32} color="#FFFFFF" />
                    </View>
                    <View style={styles.summaryTextContent}>
                        <Text style={styles.summaryTitle}>LIVRES BIBLIOTHÈQUE</Text>
                        <Text style={styles.summarySubtitle}>Salon • QR-1203</Text>
                        <View style={[styles.statusBadge, { backgroundColor: '#D1FAE5' }]}>
                            <Text style={styles.statusBadgeLabel}>Statut actuel : </Text>
                            <Text style={[styles.statusBadgeValue, { color: '#10B981' }]}>Terminé</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>CHOISIR UN NOUVEAU STATUT</Text>

                <View style={styles.optionsContainer}>
                    {STATUS_OPTIONS.map((option) => {
                        const isSelected = selectedStatus === option.id;
                        return (
                            <TouchableOpacity
                                key={option.id}
                                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                                onPress={() => setSelectedStatus(option.id)}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.optionIconContainer, { backgroundColor: option.bgColor }]}>
                                    <MaterialCommunityIcons
                                        name={option.id === 'en_cours' ? 'progress-clock' : option.icon as any}
                                        size={24}
                                        color={option.color}
                                    />
                                </View>
                                <View style={styles.optionContent}>
                                    <Text style={styles.optionLabel}>{option.label}</Text>
                                    <Text style={styles.optionDescription}>{option.description}</Text>
                                </View>

                                {isSelected ? (
                                    <Ionicons name="checkmark" size={24} color="#000833" />
                                ) : (
                                    <Ionicons name="chevron-forward" size={24} color="#A7A9BE" />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            <SafeAreaView edges={['bottom']} style={styles.footer}>
                <TouchableOpacity style={styles.confirmButton} onPress={handleBack}>
                    <Text style={styles.confirmButtonText}>Confirmer le changement</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FB' },
    headerSafeArea: { backgroundColor: '#000833' },
    header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
    headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 1 },
    headerButton: { padding: 8 },

    content: { padding: 24, paddingBottom: 40 },

    summaryCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
    summaryIconContainer: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#000833', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    summaryTextContent: { flex: 1 },
    summaryTitle: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#000833', textTransform: 'uppercase', marginBottom: 4 },
    summarySubtitle: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: '#6E7591', marginBottom: 12 },
    statusBadge: { alignSelf: 'flex-start', flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    statusBadgeLabel: { fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: '#10B981' }, // Actually label usually distinct color, but usually user wants simple matches.
    statusBadgeValue: { fontFamily: 'Outfit_700Bold', fontSize: 12 },

    sectionTitle: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#000833', textTransform: 'uppercase', marginBottom: 16 },

    optionsContainer: { gap: 12 },
    optionCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
    optionCardSelected: { borderColor: '#000833' },

    optionIconContainer: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    optionContent: { flex: 1, marginRight: 8 },
    optionLabel: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#000833', marginBottom: 4 },
    optionDescription: { fontFamily: 'Outfit_400Regular', fontSize: 13, color: '#6E7591', lineHeight: 18 },

    footer: { padding: 24, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E6E8F0' },
    confirmButton: { backgroundColor: '#000833', borderRadius: 12, paddingVertical: 18, alignItems: 'center' },
    confirmButtonText: { fontFamily: 'Outfit_600SemiBold', color: '#FFFFFF', fontSize: 16 },
});
