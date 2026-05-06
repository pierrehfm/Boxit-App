
import { api, Box, STATUS_LABELS } from '@/lib/api';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STATUS_OPTIONS: {
    id: Box['status'];
    label: string;
    description: string;
    icon: string;
}[] = [
    {
        id: 'filling',
        label: 'En cours',
        description: 'Le carton est en cours de remplissage.',
        icon: 'package-variant',
    },
    {
        id: 'sealed',
        label: 'Scellé',
        description: 'Le carton est fermé et prêt à être transporté.',
        icon: 'check-circle-outline',
    },
    {
        id: 'unpacked',
        label: 'Déballé',
        description: 'Le carton est arrivé à destination et a été déballé.',
        icon: 'home-outline',
    },
];

export default function UpdateStatusScreen() {
    const { boxId, currentStatus, boxName, boxRoom, boxQrCode } =
        useLocalSearchParams<{
            boxId: string;
            currentStatus: string;
            boxName: string;
            boxRoom: string;
            boxQrCode: string;
        }>();

    const [selectedStatus, setSelectedStatus] = useState<Box['status']>(
        (currentStatus as Box['status']) || 'filling'
    );
    const [saving, setSaving] = useState(false);

    const displayName    = boxName    || 'Carton';
    const displayRoom    = boxRoom    || '';
    const displayQrCode  = boxQrCode  || '';

    const currentStatusInfo = STATUS_LABELS[(currentStatus as Box['status']) || 'filling'];

    const handleConfirm = async () => {
        if (!boxId) return;
        if (selectedStatus === currentStatus) {
            router.back();
            return;
        }

        setSaving(true);
        try {
            await api.updateBoxStatus(boxId, selectedStatus);
            router.back();
        } catch (e: any) {
            Alert.alert("Erreur", e.message || "Impossible de modifier le statut.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>MODIFIER LE STATUT</Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.summaryCard}>
                    <View style={styles.summaryIconContainer}>
                        <MaterialCommunityIcons name="package-variant-closed" size={32} color="#FFFFFF" />
                    </View>
                    <View style={styles.summaryTextContent}>
                        <Text style={styles.summaryTitle} numberOfLines={2}>{displayName}</Text>
                        {(displayRoom || displayQrCode) && (
                            <Text style={styles.summarySubtitle}>
                                {[displayRoom, displayQrCode].filter(Boolean).join(' • ')}
                            </Text>
                        )}
                        <View style={[styles.statusBadge, { backgroundColor: currentStatusInfo.bgColor }]}>
                            <Text style={styles.statusBadgeLabel}>Statut actuel : </Text>
                            <Text style={[styles.statusBadgeValue, { color: currentStatusInfo.color }]}>
                                {currentStatusInfo.label}
                            </Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>CHOISIR UN NOUVEAU STATUT</Text>

                <View style={styles.optionsContainer}>
                    {STATUS_OPTIONS.map(option => {
                        const info = STATUS_LABELS[option.id];
                        const isSelected = selectedStatus === option.id;
                        return (
                            <TouchableOpacity
                                key={option.id}
                                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                                onPress={() => setSelectedStatus(option.id)}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.optionIconContainer, { backgroundColor: info.bgColor }]}>
                                    <MaterialCommunityIcons
                                        name={option.icon as any}
                                        size={24}
                                        color={info.color}
                                    />
                                </View>
                                <View style={styles.optionContent}>
                                    <Text style={styles.optionLabel}>{option.label}</Text>
                                    <Text style={styles.optionDescription}>{option.description}</Text>
                                </View>
                                {isSelected
                                    ? <Ionicons name="checkmark-circle" size={24} color="#000833" />
                                    : <Ionicons name="chevron-forward" size={24} color="#A7A9BE" />}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            <SafeAreaView edges={['bottom']} style={styles.footer}>
                <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm} disabled={saving}>
                    {saving
                        ? <ActivityIndicator color="#FFFFFF" />
                        : <Text style={styles.confirmButtonText}>Confirmer le changement</Text>}
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FB' },
    headerSafeArea: { backgroundColor: '#000833' },
    header: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    headerTitle: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 18,
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    headerButton: { padding: 8 },

    content: { padding: 24, paddingBottom: 40 },

    summaryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    summaryIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: '#000833',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    summaryTextContent: { flex: 1 },
    summaryTitle: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 16,
        color: '#000833',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    summarySubtitle: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 13,
        color: '#6E7591',
        marginBottom: 10,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusBadgeLabel: { fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: '#6E7591' },
    statusBadgeValue: { fontFamily: 'Outfit_700Bold', fontSize: 12 },

    sectionTitle: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 14,
        color: '#000833',
        textTransform: 'uppercase',
        marginBottom: 16,
        letterSpacing: 0.5,
    },

    optionsContainer: { gap: 12 },
    optionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    optionCardSelected: { borderColor: '#000833' },
    optionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    optionContent: { flex: 1, marginRight: 8 },
    optionLabel: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#000833', marginBottom: 4 },
    optionDescription: { fontFamily: 'Outfit_400Regular', fontSize: 13, color: '#6E7591', lineHeight: 18 },

    footer: { padding: 24, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E6E8F0' },
    confirmButton: {
        backgroundColor: '#000833',
        borderRadius: 12,
        paddingVertical: 18,
        alignItems: 'center',
    },
    confirmButtonText: { fontFamily: 'Outfit_600SemiBold', color: '#FFFFFF', fontSize: 16 },
});
