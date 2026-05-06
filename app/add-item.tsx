
import { api } from '@/lib/api';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
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

export default function AddItemScreen() {
    const { boxId } = useLocalSearchParams<{ boxId: string }>();

    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert("Erreur", "Le nom de l'objet est requis.");
            return;
        }
        if (!boxId) {
            Alert.alert("Erreur", "Carton non spécifié.");
            return;
        }

        setLoading(true);
        try {
            await api.createItem(boxId, name.trim(), quantity, description.trim() || null);
            router.back();
        } catch (e: any) {
            Alert.alert("Erreur", e.message || "Impossible d'ajouter l'objet.");
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
                    <Text style={styles.headerTitle}>AJOUTER UN OBJET</Text>
                    <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.headerButton}>
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

                    <Text style={styles.label}>Nom de l'objet *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: Cafetière Nespresso"
                        placeholderTextColor="#A7A9BE"
                        value={name}
                        onChangeText={setName}
                        autoFocus
                    />

                    <Text style={styles.label}>Quantité</Text>
                    <View style={styles.quantityRow}>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => setQuantity(q => Math.max(1, q - 1))}
                        >
                            <MaterialCommunityIcons name="minus" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <View style={styles.quantityDisplay}>
                            <Text style={styles.quantityText}>{quantity}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => setQuantity(q => q + 1)}
                        >
                            <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>Description (optionnel)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        multiline
                        textAlignVertical="top"
                        placeholder="Informations supplémentaires..."
                        placeholderTextColor="#A7A9BE"
                        value={description}
                        onChangeText={setDescription}
                    />

                </ScrollView>
            </KeyboardAvoidingView>

            <SafeAreaView edges={['bottom']} style={styles.footer}>
                <TouchableOpacity style={styles.mainButton} onPress={handleSave} disabled={loading}>
                    {loading
                        ? <ActivityIndicator color="#FFFFFF" />
                        : <Text style={styles.mainButtonText}>Ajouter l'objet</Text>}
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
        marginBottom: 12,
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
    textArea: { height: 100, paddingTop: 14 },

    quantityRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    quantityButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#000833',
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityDisplay: {
        flex: 1,
        height: 56,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E6E8F0',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityText: {
        fontFamily: 'Outfit_600SemiBold',
        fontSize: 20,
        color: '#000833',
    },

    footer: { padding: 24, backgroundColor: '#F8F9FB' },
    mainButton: {
        backgroundColor: '#000833',
        borderRadius: 12,
        paddingVertical: 18,
        alignItems: 'center',
    },
    mainButtonText: { fontFamily: 'Outfit_600SemiBold', color: '#FFFFFF', fontSize: 16 },
});
