
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function signInWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            Alert.alert('Erreur', error.message);
            setLoading(false);
        } else {
            // Navigate to main app and reset history
            router.replace('/');
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Connexion</Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={(text) => setEmail(text)}
                        value={email}
                        placeholder=""
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Mot de passe</Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={(text) => setPassword(text)}
                        value={password}
                        secureTextEntry={true}
                        placeholder=""
                        autoCapitalize="none"
                    />
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={signInWithEmail}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.buttonText}>Se connecter</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Pas encore de compte? </Text>
                    <Link href="/signup" asChild>
                        <TouchableOpacity>
                            <Text style={styles.linkText}>Inscription</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FB', // Light background
        justifyContent: 'center',
        padding: 24,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    title: {
        fontSize: 24,
        fontFamily: 'Outfit_700Bold',
        color: '#000833',
        textAlign: 'center',
        marginBottom: 32,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontFamily: 'Outfit_500Medium',
        color: '#000833', // Or '#374151'
        marginBottom: 8,
        fontSize: 14,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E6E8F0',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#000833',
        fontFamily: 'Outfit_400Regular',
    },
    button: {
        backgroundColor: '#F7B900', // Yellow/Gold
        borderRadius: 8,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 24,
    },
    buttonText: {
        fontSize: 16,
        fontFamily: 'Outfit_600SemiBold',
        color: '#FFFFFF',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontFamily: 'Outfit_400Regular',
        color: '#6E7591',
        fontSize: 14,
    },
    linkText: {
        fontFamily: 'Outfit_500Medium',
        color: '#F7B900',
        fontSize: 14,
    },
});
