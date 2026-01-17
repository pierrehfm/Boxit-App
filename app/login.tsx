
import { router } from 'expo-router';
import React from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSession } from '../context/AuthContext';

export default function LoginScreen() {
    const { signIn } = useSession();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    const handleLogin = () => {
        signIn();
        // The navigation will be handled by the _layout via state change, 
        // but we can also imperatively replace if needed.
        // However, sticking to the reactive flow is better.
        router.replace('/');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.logoContainer}>
                {/* Placeholder for App Logo */}
                <Image
                    source={require('../assets/images/react-logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.title}>Boxit</Text>
                <Text style={styles.subtitle}>Welcome back!</Text>
            </View>

            <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="hello@example.com"
                        placeholderTextColor="#A0A0A0"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor="#A0A0A0"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Log In</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.linkButton}>
                    <Text style={styles.linkText}>Forgot password?</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        padding: 24,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666666',
    },
    formContainer: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: '#FAFAFA',
        color: '#333',
    },
    button: {
        height: 56,
        backgroundColor: '#007AFF', // Standard iOS blue, fits 'premium' simple vibe
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    linkButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    linkText: {
        color: '#007AFF',
        fontSize: 14,
    },
});
