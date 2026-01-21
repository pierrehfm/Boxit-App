import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// @ts-ignore
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Logo from '../assets/images/logo.svg';

export default function StartScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            {/* Top Section with Logo */}
            <View style={styles.logoContainer}>
                <Logo width={120} height={120} />
            </View>

            {/* Text Section */}
            <View style={styles.textContainer}>
                <Text style={styles.title}>Gérez vos cartons intelligemment</Text>
                <Text style={styles.subtitle}>
                    Scannez, inventoriez et retrouvez vos affaires en un instant grâce aux QR Codes
                </Text>
            </View>

            {/* Visual Indicator / Icons */}
            <View style={styles.visualContainer}>
                <View style={styles.iconBox}>
                    <MaterialCommunityIcons name="crop-free" size={32} color="#000833" />
                </View>

                <View style={styles.dotsContainer}>
                    <View style={[styles.dot, styles.dotSmall]} />
                    <View style={[styles.dot, styles.dotLine]} />
                    <View style={[styles.dot, styles.dotMedium]} />
                    <View style={[styles.dot, styles.dotLine]} />
                    <View style={[styles.dot, styles.dotSmall]} />
                </View>

                <View style={styles.iconBox}>
                    <MaterialCommunityIcons name="package-variant-closed-check" size={32} color="#000833" />
                </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/signup')}>
                    <Text style={styles.primaryButtonText}>Crée un compte</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/login')}>
                    <Text style={styles.secondaryButtonText}>Se connecter</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FB', // Light background from image
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    logoContainer: {
        marginBottom: 40,
        marginTop: 60,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 48,
    },
    title: {
        fontFamily: 'Outfit_600SemiBold', // Assuming loading this variant
        fontSize: 22,
        color: '#000833', // Dark Navy Blue
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontFamily: 'Outfit_400Regular',
        fontSize: 16,
        color: '#6E7591', // Greyish text
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 16,
    },
    visualContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 60,
    },
    iconBox: {
        width: 64,
        height: 64,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 4,
    },
    dot: {
        backgroundColor: '#000833',
        borderRadius: 999,
    },
    dotSmall: {
        width: 4,
        height: 4,
    },
    dotMedium: {
        width: 6,
        height: 6,
    },
    dotLine: {
        width: 24, // Represents the line
        height: 1,
        backgroundColor: '#000833',
    },
    buttonContainer: {
        width: '100%',
        gap: 16,
        marginBottom: 40,
    },
    primaryButton: {
        backgroundColor: '#000833',
        borderRadius: 8,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Outfit_500Medium',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderRadius: 8,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#000833',
    },
    secondaryButtonText: {
        color: '#000833',
        fontSize: 16,
        fontFamily: 'Outfit_500Medium',
    },
});
