
import { api } from '@/lib/api';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ScanScreen() {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState<'back' | 'front'>('back');
    const [torch, setTorch] = useState<boolean>(false);
    const [scanned, setScanned] = useState(false);
    const [defaultProjectId, setDefaultProjectId] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        // Fetch default project ID (first one)
        api.getUserProjects().then(projects => {
            if (projects.length > 0) setDefaultProjectId(projects[0].id);
        }).catch(err => console.error(err));
    }, []);

    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <View style={[styles.container, styles.permissionContainer]}>
                <Text style={styles.message}>Nous avons besoin de votre permission pour utiliser la caméra</Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Accorder la permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleBarcodeScanned = async ({ type, data }: { type: string; data: string }) => {
        if (scanned || processing) return;
        setScanned(true);
        setProcessing(true);

        try {
            const box = await api.getBoxByQR(data);

            if (box) {
                Alert.alert("Carton trouvé", `Carton : ${box.name}`, [
                    {
                        text: "Voir",
                        onPress: () => {
                            router.push({ pathname: '/box-detail', params: { boxId: box.id } });
                            setTimeout(() => { setScanned(false); setProcessing(false); }, 1000);
                        }
                    },
                    {
                        text: "Annuler",
                        style: "cancel",
                        onPress: () => {
                            setScanned(false);
                            setProcessing(false);
                        }
                    }
                ]);
            } else {
                if (!defaultProjectId) {
                    Alert.alert("Erreur", "Aucun projet trouvé. Veuillez créer un projet d'abord.", [
                        { text: "OK", onPress: () => { setScanned(false); setProcessing(false); } }
                    ]);
                    return;
                }

                Alert.alert("Carton inconnu", "Ce QR code ne correspond à aucun carton. Voulez-vous créer un nouveau carton ?", [
                    {
                        text: "Créer",
                        onPress: () => {
                            router.push({ pathname: '/new-box', params: { qrCode: data, projectId: defaultProjectId } });
                            setTimeout(() => { setScanned(false); setProcessing(false); }, 1000);
                        }
                    },
                    {
                        text: "Annuler",
                        style: "cancel",
                        onPress: () => {
                            setScanned(false);
                            setProcessing(false);
                        }
                    }
                ]);
            }

        } catch (error) {
            console.error("Scan error:", error);
            Alert.alert("Erreur", "Une erreur est survenue lors de la vérification du code.");
            setScanned(false);
            setProcessing(false);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            console.log(result.assets[0].uri);
            alert('Image sélectionnée (Scan depuis image non implémenté sans backend/librairie extra)');
        }
    };

    const toggleTorch = () => {
        setTorch((current) => !current);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar barStyle="light-content" backgroundColor="#000833" />

            <View style={styles.header}>
                <Text style={styles.smallTitle}>SCANNER QR</Text>

                <View style={styles.navRow}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/(tabs)')}>
                        <Feather name="arrow-left" size={24} color="white" />
                    </TouchableOpacity>

                    <Text style={styles.mainTitle}>SCANNER</Text>

                    <TouchableOpacity
                        style={[styles.iconButton, torch && styles.activeIconButton]}
                        onPress={toggleTorch}
                    >
                        <MaterialCommunityIcons
                            name={torch ? "flashlight" : "flashlight-off"}
                            size={24}
                            color={torch ? "#000833" : "white"}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.cameraContainer}>
                <CameraView
                    style={styles.camera}
                    facing={facing}
                    enableTorch={torch}
                    onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr"],
                    }}
                />

                <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                    <View style={styles.overlay}>
                        <View style={styles.scanFrame}>
                            <View style={styles.dashedBox} />

                            <View style={[styles.corner, styles.topLeft]} />
                            <View style={[styles.corner, styles.topRight]} />
                            <View style={[styles.corner, styles.bottomLeft]} />
                            <View style={[styles.corner, styles.bottomRight]} />

                            {processing ? (
                                <ActivityIndicator size="large" color="#FFFFFF" />
                            ) : (
                                <View style={styles.centerMarker}>
                                    <View style={styles.centerLine} />
                                    <View style={[styles.centerCorner, styles.cTopLeft]} />
                                    <View style={[styles.centerCorner, styles.cTopRight]} />
                                    <View style={[styles.centerCorner, styles.cBottomLeft]} />
                                    <View style={[styles.centerCorner, styles.cBottomRight]} />
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.instructions}>Positionnez le QR code dans le cadre</Text>
                <Text style={styles.subInstructions}>Le scan se fera{'\n'}automatiquement</Text>

                <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
                    <Feather name="image" size={20} color="#000833" style={styles.galleryIcon} />
                    <Text style={styles.galleryButtonText}>Importer depuis la galerie</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000833',
    },
    permissionContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
        color: 'white',
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
    },
    permissionButton: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    permissionButtonText: {
        color: '#000833',
        fontWeight: 'bold',
    },

    header: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 10,
        paddingBottom: 20,
        zIndex: 10,
        backgroundColor: '#000833',
    },
    smallTitle: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 20,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    navRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    mainTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#1A214D',
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeIconButton: {
        backgroundColor: '#FFFFFF',
    },

    cameraContainer: {
        flex: 1,
        marginHorizontal: 0,
        overflow: 'hidden',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 8, 51, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanFrame: {
        width: 250,
        height: 250,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Dashed Box
    dashedBox: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        borderStyle: 'dashed',
        borderRadius: 24,
    },

    corner: {
        position: 'absolute',
        width: 32,
        height: 32,
        borderColor: 'white',
        borderWidth: 4,
        borderRadius: 8,
    },
    topLeft: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0 },
    topRight: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0 },
    bottomLeft: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0 },
    bottomRight: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0 },

    centerMarker: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    centerLine: {
        width: 30,
        height: 4,
        backgroundColor: 'white',
        borderRadius: 2,
    },
    centerCorner: {
        position: 'absolute',
        width: 15,
        height: 15,
        borderColor: 'white',
        borderWidth: 3,
        borderRadius: 4,
    },
    cTopLeft: { top: 10, left: 10, borderBottomWidth: 0, borderRightWidth: 0 },
    cTopRight: { top: 10, right: 10, borderBottomWidth: 0, borderLeftWidth: 0 },
    cBottomLeft: { bottom: 10, left: 10, borderTopWidth: 0, borderRightWidth: 0 },
    cBottomRight: { bottom: 10, right: 10, borderTopWidth: 0, borderLeftWidth: 0 },


    footer: {
        backgroundColor: '#000833',
        padding: 24,
        alignItems: 'center',
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    instructions: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 8,
    },
    subInstructions: {
        color: '#A7A9BE',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 20,
    },
    galleryButton: {
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        width: '100%',
    },
    galleryIcon: {
        marginRight: 10,
    },
    galleryButtonText: {
        color: '#000833',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
