
import { api } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NewProjectScreen() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!name.trim()) {
            Alert.alert("Erreur", "Le nom du projet est requis.");
            return;
        }

        setLoading(true);
        try {
            await api.createProject(name.trim(), description.trim() || undefined);
            router.back();
        } catch (e: any) {
            Alert.alert("Erreur", e.message || "Impossible de créer le projet.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>NOUVEAU PROJET</Text>
                    <TouchableOpacity onPress={handleCreate} disabled={loading} style={styles.headerButton}>
                        {loading
                            ? <ActivityIndicator color="#FFFFFF" size="small" />
                            : <Ionicons name="checkmark" size={24} color="#FFFFFF" />}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.label}>Nom du projet *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: Déménagement Paris → Lyon"
                        placeholderTextColor="#A7A9BE"
                        value={name}
                        onChangeText={setName}
                        autoFocus
                    />

                    <Text style={styles.label}>Description (optionnel)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        multiline
                        textAlignVertical="top"
                        placeholder="Décrivez votre projet de déménagement..."
                        placeholderTextColor="#A7A9BE"
                        value={description}
                        onChangeText={setDescription}
                    />
                </ScrollView>
            </KeyboardAvoidingView>

            <SafeAreaView edges={['bottom']} style={styles.footer}>
                <TouchableOpacity style={styles.createButton} onPress={handleCreate} disabled={loading}>
                    {loading
                        ? <ActivityIndicator color="#FFFFFF" />
                        : <Text style={styles.createButtonText}>Créer le projet</Text>}
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
    label: {
        fontFamily: 'Outfit_600SemiBold',
        fontSize: 14,
        color: '#000833',
        marginBottom: 8,
        marginTop: 20,
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
    textArea: { height: 120, paddingTop: 14 },

    footer: { padding: 24, backgroundColor: '#F8F9FB' },
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
