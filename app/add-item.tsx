
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const INPUT_METHODS = [
    { id: 'keyboard', label: 'Texte', icon: 'keyboard-outline' },
    { id: 'camera', label: 'Photo', icon: 'camera-outline' },
    { id: 'mic', label: 'Voix', icon: 'microphone-outline' },
];

export default function AddItemScreen() {
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [method, setMethod] = useState('keyboard');
    const [description, setDescription] = useState('');
    const [isFragile, setIsFragile] = useState(true);

    const handleBack = () => {
        router.back();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>AJOUTER UN OBJET</Text>
                    <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
                        <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>

                    {/* Nom de l'objet */}
                    <Text style={styles.label}>Nom de l'objet</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                    />

                    {/* Quantité */}
                    <Text style={styles.label}>Quantité</Text>
                    <View style={styles.quantityRow}>
                        <TouchableOpacity style={styles.minusButton}>
                            <MaterialCommunityIcons name="minus" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TextInput
                            style={styles.quantityInput}
                            value={quantity}
                            onChangeText={setQuantity}
                            keyboardType="numeric"
                            textAlign="center"
                        />
                    </View>

                    {/* Méthode de saisie */}
                    <Text style={styles.label}>Méthode de saisie</Text>
                    <View style={styles.methodRow}>
                        {INPUT_METHODS.map((m) => (
                            <TouchableOpacity
                                key={m.id}
                                style={[styles.methodButton, method === m.id && styles.methodButtonActive]}
                                onPress={() => setMethod(m.id)}
                            >
                                <MaterialCommunityIcons
                                    name={m.icon as any}
                                    size={24}
                                    color={method === m.id ? '#FFFFFF' : '#A7A9BE'}
                                />
                                <Text style={[styles.methodText, method === m.id && styles.methodTextActive]}>
                                    {m.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Description */}
                    <Text style={styles.label}>Description (optionnel)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        multiline
                        textAlignVertical="top"
                        value={description}
                        onChangeText={setDescription}
                    />

                    {/* Photos */}
                    <Text style={styles.label}>Photos (optionnel)</Text>
                    <View style={styles.photosRow}>
                        <TouchableOpacity style={styles.addPhotoBox}>
                            <Ionicons name="add" size={32} color="#A7A9BE" />
                        </TouchableOpacity>
                        {[1, 2, 3].map((i) => (
                            <View key={i} style={styles.photoPlaceholder} />
                        ))}
                    </View>

                    {/* Fragile */}
                    <Text style={styles.label}>Fragile</Text>
                    <View style={styles.fragileRow}>
                        <TouchableOpacity
                            style={[styles.fragileButton, isFragile && styles.fragileButtonActive]}
                            onPress={() => setIsFragile(true)}
                        >
                            <Text style={[styles.fragileText, isFragile && styles.fragileTextActive]}>Oui</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.fragileButton, !isFragile && styles.fragileButtonActive]} // Assuming active style implies selection
                            onPress={() => setIsFragile(false)}
                        >
                            {/* Note: In the image 'Oui' is dark blue (active) and 'Non' is white (inactive). 
                         Assuming toggle behavior visual. */}
                            <Text style={[styles.fragileText, !isFragile && styles.fragileTextActive]}>Non</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Bottom Button */}
            <SafeAreaView edges={['bottom']} style={styles.footer}>
                <TouchableOpacity style={styles.mainButton} onPress={handleBack}>
                    <Text style={styles.mainButtonText}>Ajouter l'objet</Text>
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
    label: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: '#000833', marginBottom: 12, marginTop: 20 },
    input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E6E8F0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontFamily: 'Outfit_400Regular', fontSize: 16, color: '#000833' },

    quantityRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    minusButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#000833', justifyContent: 'center', alignItems: 'center' },
    quantityInput: { flex: 1, height: 56, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E6E8F0', borderRadius: 12, fontFamily: 'Outfit_600SemiBold', fontSize: 18, color: '#000833' },

    methodRow: { flexDirection: 'row', gap: 12 },
    methodButton: { flex: 1, aspectRatio: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E6E8F0', borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 8 },
    methodButtonActive: { backgroundColor: '#000833', borderColor: '#000833' },
    methodText: { fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: '#6E7591' },
    methodTextActive: { color: '#FFFFFF' },

    textArea: { height: 100, paddingTop: 14 },

    photosRow: { flexDirection: 'row', gap: 12 },
    addPhotoBox: { width: 70, height: 70, borderRadius: 16, borderWidth: 2, borderColor: '#E6E8F0', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
    photoPlaceholder: { width: 70, height: 70, borderRadius: 16, backgroundColor: '#E6E8F0' },

    fragileRow: { flexDirection: 'row', gap: 16 },
    fragileButton: { flex: 1, paddingVertical: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E6E8F0', backgroundColor: '#FFFFFF', alignItems: 'center' },
    fragileButtonActive: { backgroundColor: '#000833', borderColor: '#000833' },
    fragileText: { fontFamily: 'Outfit_600SemiBold', fontSize: 16, color: '#6E7591' },
    fragileTextActive: { color: '#FFFFFF' },

    footer: { padding: 24, backgroundColor: '#F8F9FB' },
    mainButton: { backgroundColor: '#000833', borderRadius: 12, paddingVertical: 18, alignItems: 'center' },
    mainButtonText: { fontFamily: 'Outfit_600SemiBold', color: '#FFFFFF', fontSize: 16 },
});
