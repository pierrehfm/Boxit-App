
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function SignupScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function signUpWithEmail() {
        if (password !== confirmPassword) {
            Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
            return;
        }

        setLoading(true);
        const {
            data: { session },
            error,
        } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                }
            }
        });

        if (error) {
            Alert.alert('Erreur', error.message);
            setLoading(false);
        } else {
            if (!session) {
                Alert.alert('Succès', 'Veuillez vérifier vos emails pour confirmer votre inscription.');
            } else {
                router.replace('/');
            }
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Inscription</Text>

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

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Confirmer le mot de passe</Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={(text) => setConfirmPassword(text)}
                        value={confirmPassword}
                        secureTextEntry={true}
                        placeholder=""
                        autoCapitalize="none"
                    />
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={signUpWithEmail}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.buttonText}>S'inscrire</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Déjà un compte? </Text>
                    <Link href="/login" asChild>
                        <TouchableOpacity>
                            <Text style={styles.linkText}>Connexion</Text>
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
        backgroundColor: '#F8F9FB',
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
        color: '#000833',
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
        backgroundColor: '#F7B900',
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
