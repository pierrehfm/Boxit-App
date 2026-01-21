import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function EditProfileScreen() {
    const router = useRouter();
    const { user } = useSession();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setEmail(user.email || '');
            getProfile();
        }
    }, [user]);

    async function getProfile() {
        try {
            setLoading(true);
            if (!user) return;

            const { data, error } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.warn(error);
            }

            if (data) {
                setFullName(data.full_name || '');
                setAvatarUrl(data.avatar_url);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const uri = result.assets[0].uri;
                await uploadAvatar(uri);
            }
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
        }
    };

    const uploadAvatar = async (uri: string) => {
        try {
            setSaving(true);

            // Fetch the image from the local URI
            const response = await fetch(uri);
            const blob = await response.blob();

            // Convert blob to base64
            const reader = new FileReader();
            reader.onload = async () => {
                const base64data = reader.result as string;

                // Directly set the base64 string as the avatarUrl
                // This bypasses the need for Supabase Storage buckets
                // Ensure your 'profiles' table 'avatar_url' column is of type TEXT which can hold large strings
                setAvatarUrl(base64data);

                if (user) {
                    // Save immediately
                    await supabase.from('profiles').upsert({
                        id: user.id,
                        avatar_url: base64data,
                        updated_at: new Date(),
                        email: user.email
                    });
                }
                setSaving(false);
            };

            reader.onerror = () => {
                Alert.alert("Erreur", "Impossible de lire l'image sélectionnée.");
                setSaving(false);
            };

            reader.readAsDataURL(blob);

        } catch (error: any) {
            console.warn("Avatar processing error:", error.message);
            Alert.alert('Erreur', "Le traitement de l'image a échoué.");
            setSaving(false);
        }
    };

    async function updateProfile() {
        try {
            setSaving(true);
            if (!user) return;

            const updates = {
                id: user.id,
                full_name: fullName,
                updated_at: new Date(),
                email: user.email,
                avatar_url: avatarUrl
            };

            const { error } = await supabase
                .from('profiles')
                .upsert(updates);

            if (error) {
                throw error;
            }

            Alert.alert('Succès', 'Profil mis à jour avec succès');
            router.back();
        } catch (error: any) {
            Alert.alert('Erreur', error.message);
        } finally {
            setSaving(false);
        }
    }

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
                        <Text style={styles.headerTitle}>MODIFIER LE PROFIL</Text>
                        <View style={{ width: 24 }} />
                    </View>
                </SafeAreaView>
            </View>

            <View style={styles.content}>

                {loading ? (
                    <ActivityIndicator size="large" color="#000833" style={{ marginTop: 40 }} />
                ) : (
                    <>
                        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                            {avatarUrl ? (
                                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                            ) : (
                                <Ionicons name="person" size={40} color="#000833" />
                            )}
                            <View style={styles.overlay}>
                                <Ionicons name="pencil" size={24} color="#FFFFFF" />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.avatarText}>Modifier la photo</Text>

                        <View style={styles.formContainer}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Nom complet</Text>
                                <TextInput
                                    style={styles.input}
                                    value={fullName}
                                    onChangeText={setFullName}
                                    placeholder="Votre nom"
                                    placeholderTextColor="#A7A9BE"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email (Non modifiable)</Text>
                                <TextInput
                                    style={[styles.input, styles.disabledInput]}
                                    value={email}
                                    editable={false}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={updateProfile}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.saveButtonText}>Enregistrer</Text>
                            )}
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FB' },
    headerContainer: { backgroundColor: '#000833', paddingBottom: 20 },
    safeHeader: { paddingHorizontal: 24 },
    navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
    backButton: {},
    headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: '#FFFFFF', textTransform: 'uppercase' },

    content: { flex: 1, padding: 24 },

    avatarSection: { alignItems: 'center', marginBottom: 32 },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        overflow: 'hidden'
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: { fontFamily: 'Outfit_500Medium', color: '#000833', fontSize: 14 },

    formContainer: { marginBottom: 32 },
    inputGroup: { marginBottom: 20 },
    label: { fontFamily: 'Outfit_600SemiBold', color: '#000833', marginBottom: 8, fontSize: 14 },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        color: '#000833',
        borderWidth: 1,
        borderColor: '#E6E8F0',
    },
    disabledInput: {
        backgroundColor: '#F0F2F5',
        color: '#6E7591',
    },

    saveButton: {
        backgroundColor: '#000833',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        fontFamily: 'Outfit_700Bold',
        color: '#FFFFFF',
        fontSize: 16,
    },
});
