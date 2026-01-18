
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Icon options matching the image roughly
const ICON_OPTIONS = [
    'book-open-page-variant',
    'silverware-fork-knife',
    'tshirt-crew',
    'laptop',
    'gamepad-variant',
    'face-man-profile', // closest to baby? or maybe 'baby-face'
    'dumbbell',
    'tools',
];

const PRIORITIES = ['Basse', 'Normale', 'Haute'];

export default function NewBoxScreen() {
    const [name, setName] = useState('');
    const [room, setRoom] = useState(''); // Could be a select, but keeping as input for now with grey bg
    const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0]);
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Normale');

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
                    <Text style={styles.headerTitle}>NOUVEAU CARTON</Text>
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

                    {/* Nom du carton */}
                    <Text style={styles.label}>Nom du carton</Text>
                    <TextInput
                        style={styles.input}
                        placeholder=""
                        value={name}
                        onChangeText={setName}
                    />

                    {/* Pièce */}
                    <Text style={styles.label}>Pièce</Text>
                    <View style={styles.inputDisabledContainer}>
                        <TextInput
                            style={[styles.input, styles.inputDisabled]}
                            placeholder=""
                            value={room}
                            onChangeText={setRoom}
                        // Assuming it might be a selector later, but user just said front. 
                        // Image shows grey background.
                        />
                    </View>

                    {/* Icône */}
                    <Text style={styles.label}>Icône</Text>
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

                    {/* Description */}
                    <Text style={styles.label}>Description (optionnel)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        multiline
                        textAlignVertical="top"
                        value={description}
                        onChangeText={setDescription}
                    />

                    {/* Priorité */}
                    <Text style={styles.label}>Priorité</Text>
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

            {/* Bottom Button */}
            <SafeAreaView edges={['bottom']} style={styles.footer}>
                <TouchableOpacity style={styles.createButton} onPress={handleBack}>
                    <Text style={styles.createButtonText}>Créer le carton</Text>
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
        fontFamily: 'Outfit_700Bold', // Bold for header
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
        // Wrapper if needed so we don't assume functionality
    },
    inputDisabled: {
        backgroundColor: '#F0F2F5', // Grey background as shown in design for 'Pièce'
        borderColor: '#E6E8F0',
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    iconButton: {
        width: '23%', // 4 columns
        height: '23%', // 4 columns
        aspectRatio: 1, // Keep it square
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E6E8F0',
        marginBottom: 12, // Vertical spacing since gap is removed
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
        backgroundColor: '#F8F9FB', // Blend with background
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
