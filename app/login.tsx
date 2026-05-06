
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
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
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    async function signInWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            Alert.alert('Erreur', error.message);
        } else {
            router.replace('/');
        }
        setLoading(false);
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#000833" />
                    </TouchableOpacity>

                    <Text style={styles.title}>Connexion</Text>

                    <TextInput
                        style={styles.input}
                        onChangeText={setEmail}
                        value={email}
                        placeholder="Adresse email"
                        placeholderTextColor="#A7A9BE"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoComplete="email"
                    />

                    <View style={styles.passwordRow}>
                        <TextInput
                            style={styles.passwordInput}
                            onChangeText={setPassword}
                            value={password}
                            placeholder="Mot de passe"
                            placeholderTextColor="#A7A9BE"
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeButton}>
                            <Ionicons
                                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                size={20}
                                color="#A7A9BE"
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, loading && { opacity: 0.7 }]}
                        onPress={signInWithEmail}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.submitButtonText}>Se connecter</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Pas encore de compte ?</Text>
                        <Link href="/signup" asChild>
                            <TouchableOpacity>
                                <Text style={styles.linkText}> Créer un compte</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FB' },
    scroll: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 48, flexGrow: 1 },

    backButton: { alignSelf: 'flex-start', padding: 4, marginBottom: 40 },
    title: { fontFamily: 'Outfit_700Bold', fontSize: 28, color: '#000833', marginBottom: 32 },

    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E6E8F0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#000833',
        fontFamily: 'Outfit_400Regular',
        marginBottom: 14,
    },
    passwordRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E6E8F0',
        borderRadius: 12,
        marginBottom: 32,
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#000833',
        fontFamily: 'Outfit_400Regular',
    },
    eyeButton: { paddingHorizontal: 14 },

    submitButton: {
        backgroundColor: '#000833',
        borderRadius: 12,
        paddingVertical: 18,
        alignItems: 'center',
        marginBottom: 24,
    },
    submitButtonText: { fontFamily: 'Outfit_600SemiBold', fontSize: 16, color: '#FFFFFF' },

    footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    footerText: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: '#6E7591' },
    linkText: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: '#000833' },
});
