
import { api } from '@/lib/api';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Icon options matching the image roughly
const ICON_OPTIONS = [
    'book-open-page-variant',
    'silverware-fork-knife',
    'tshirt-crew',
    'laptop',
    'gamepad-variant',
    'face-man-profile',
    'dumbbell',
    'tools',
];

const PRIORITIES = ['Basse', 'Normale', 'Haute'];

export default function NewBoxScreen() {
    const { qrCode: paramQrCode, projectId: paramProjectId } = useLocalSearchParams<{ qrCode: string; projectId: string }>();

    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0]);
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Normale');
    const [loading, setLoading] = useState(false);

    const handleBack = () => {
        router.back();
    };

    const handleCreate = async () => {
        if (!name.trim()) {
            Alert.alert("Erreur", "Le nom du carton est requis.");
            return;
        }

        if (!paramProjectId) {

            Alert.alert("Erreur", "Aucun projet associé. Veuillez passer par l'écran d'accueil ou le dashboard.");
            return;
        }

        setLoading(true);
        try {
            const finalQrCode = paramQrCode || `GEN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            await api.createBox({
                project_id: paramProjectId,
                qr_code: finalQrCode,
                name: name.trim(),
                room: room.trim() || null,
                status: 'filling',
            });

            Alert.alert("Succès", "Carton créé avec succès !", [
                { text: "OK", onPress: () => router.push('/(tabs)/cartons') }
            ]);
        } catch (e: any) {
            console.error("Create box error:", e);
            Alert.alert("Erreur", e.message || "Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>NOUVEAU CARTON</Text>
                    <TouchableOpacity onPress={handleCreate} disabled={loading} style={styles.headerButton}>
                        {loading ? <ActivityIndicator color="white" /> : <Ionicons name="checkmark" size={24} color="#FFFFFF" />}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>

                    {paramQrCode && (
                        <View style={{ marginBottom: 20, padding: 10, backgroundColor: '#E0E7FF', borderRadius: 8 }}>
                            <Text style={{ fontFamily: 'Outfit_600SemiBold', color: '#000833' }}>
                                QR Code associé : {paramQrCode}
                            </Text>
                        </View>
                    )}

                    <Text style={styles.label}>Nom du carton</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: Livres Salon"
                        value={name}
                        onChangeText={setName}
                    />

                    <Text style={styles.label}>Pièce</Text>
                    <View style={styles.inputDisabledContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Salon"
                            value={room}
                            onChangeText={setRoom}
                        />
                    </View>

                    <Text style={styles.label}>Icône (Visuel seulement)</Text>
                    <View style={styles.iconGrid}>
                        {ICON_OPTIONS.map((icon) => (
                            <TouchableOpacity
                                key={icon}
                                style={[
                                    styles.iconButton,
                                    selectedIcon === icon && styles.iconButtonActive
                                ]}
                                onPress={() => setSelectedIcon(icon)}
                            >
                                <MaterialCommunityIcons
                                    name={icon as any}
                                    size={24}
                                    color={selectedIcon === icon ? '#FFFFFF' : '#A7A9BE'}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Description (optionnel)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        multiline
                        textAlignVertical="top"
                        value={description}
                        onChangeText={setDescription}
                    />

                    <Text style={styles.label}>Priorité (Visuel seulement)</Text>
                    <View style={styles.priorityContainer}>
                        {PRIORITIES.map((p) => (
                            <TouchableOpacity
                                key={p}
                                style={[
                                    styles.priorityButton,
                                    priority === p && styles.priorityButtonActive
                                ]}
                                onPress={() => setPriority(p)}
                            >
                                <Text style={[
                                    styles.priorityText,
                                    priority === p && styles.priorityTextActive
                                ]}>{p}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            <SafeAreaView edges={['bottom']} style={styles.footer}>
                <TouchableOpacity style={styles.createButton} onPress={handleCreate} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.createButtonText}>Créer le carton</Text>
                    )}
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FB',
    },
    headerSafeArea: {
        backgroundColor: '#000833',
    },
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
    headerButton: {
        padding: 8,
    },
    content: {
        padding: 24,
    },
    label: {
        fontFamily: 'Outfit_600SemiBold',
        fontSize: 14,
        color: '#000833',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E6E8F0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontFamily: 'Outfit_400Regular',
        fontSize: 16,
        color: '#000833',
    },
    inputDisabledContainer: {
    },
    inputDisabled: {
        backgroundColor: '#F0F2F5',
        borderColor: '#E6E8F0',
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    iconButton: {
        width: '23%',
        height: '23%',
        aspectRatio: 1,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E6E8F0',
        marginBottom: 12,
    },
    iconButtonActive: {
        backgroundColor: '#000833',
        borderColor: '#000833',
    },
    textArea: {
        height: 100,
        paddingTop: 14,
    },
    priorityContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 40,
    },
    priorityButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E6E8F0',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    priorityButtonActive: {
        backgroundColor: '#000833',
        borderColor: '#000833',
    },
    priorityText: {
        fontFamily: 'Outfit_600SemiBold',
        color: '#6E7591',
        fontSize: 14,
    },
    priorityTextActive: {
        color: '#FFFFFF',
    },
    footer: {
        padding: 24,
        backgroundColor: '#F8F9FB',
    },
    createButton: {
        backgroundColor: '#000833',
        borderRadius: 12,
        paddingVertical: 18,
        alignItems: 'center',
    },
    createButtonText: {
        fontFamily: 'Outfit_600SemiBold',
        color: '#FFFFFF',
        fontSize: 16,
    },
});
