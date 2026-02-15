
import { api, Project, ProjectMember } from '@/lib/api';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CollaboratorsScreen() {
    const { projectId } = useLocalSearchParams<{ projectId: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviteModalVisible, setInviteModalVisible] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviting, setInviting] = useState(false);

    const handleBack = () => {
        router.back();
    };

    const loadData = async () => {
        try {
            if (!projectId) return;
            const [p, m] = await Promise.all([
                api.getProject(projectId),
                api.getProjectMembers(projectId)
            ]);
            setProject(p);
            setMembers(m);
        } catch (e) {
            console.error("Error loading collaborators:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [projectId]);

    const handleInvite = async () => {
        if (!inviteEmail.trim() || !projectId) return;
        setInviting(true);
        try {
            await api.addProjectMember(projectId, inviteEmail.trim());
            Alert.alert("Succès", "Collaborateur ajouté avec succès.");
            setInviteModalVisible(false);
            setInviteEmail('');
            loadData();
        } catch (e: any) {
            Alert.alert("Erreur", e.message || "Une erreur est survenue.");
        } finally {
            setInviting(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#000833" />
            </View>
        );
    }

    const admins = members.filter(m => m.role === 'owner' || m.role === 'editor');

    const owners = members.filter(m => m.role === 'owner');
    const others = members.filter(m => m.role !== 'owner');

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <SafeAreaView edges={['top']} style={styles.safeHeader}>
                    <View style={styles.navRow}>
                        <TouchableOpacity onPress={handleBack}>
                            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.addUserButton} onPress={() => setInviteModalVisible(true)}>
                            <Feather name="user-plus" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.headerTitle}>COLLABORATEURS</Text>
                    <Text style={styles.headerSubtitle}>{project?.name}</Text>
                </SafeAreaView>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>PROPRIÉTAIRE</Text>
                {owners.map((member) => (
                    <MemberCard key={member.user_id} member={member} />
                ))}

                <Text style={styles.sectionTitle}>MEMBRES</Text>
                {others.length > 0 ? (
                    others.map((member) => (
                        <MemberCard key={member.user_id} member={member} />
                    ))
                ) : (
                    <Text style={{ color: '#6E7591', fontFamily: 'Outfit_400Regular' }}>Aucun autre membre.</Text>
                )}

            </ScrollView>

            <SafeAreaView edges={['bottom']} style={styles.footer}>
                <TouchableOpacity style={styles.inviteButton} onPress={() => setInviteModalVisible(true)}>
                    <Feather name="user-plus" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.inviteButtonText}>Inviter un collaborateur</Text>
                </TouchableOpacity>
            </SafeAreaView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={inviteModalVisible}
                onRequestClose={() => setInviteModalVisible(false)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalCenteredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Inviter un collaborateur</Text>
                        <Text style={styles.modalText}>Entrez l'adresse email de la personne à inviter (elle doit déjà avoir un compte).</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="email@exemple.com"
                            value={inviteEmail}
                            onChangeText={setInviteEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonClose]}
                                onPress={() => setInviteModalVisible(false)}
                            >
                                <Text style={styles.textStyleCancel}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonConfirm]}
                                onPress={handleInvite}
                                disabled={inviting}
                            >
                                {inviting ? <ActivityIndicator color="white" /> : <Text style={styles.textStyle}>Inviter</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

function MemberCard({ member }: { member: ProjectMember }) {
    return (
        <View style={styles.card}>
            <View style={[styles.avatarBox, { backgroundColor: member.role === 'owner' ? '#000833' : '#E6E8F0' }]}>
                {member.role === 'owner' ? (
                    <Ionicons name="person-outline" size={24} color="#FFFFFF" />
                ) : (
                    <Ionicons name="person-outline" size={24} color="#6E7591" />
                )}
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.name}>{member.full_name || 'Utilisateur sans nom'}</Text>
                <Text style={styles.email}>{member.email}</Text>
            </View>
            {member.role === 'owner' && (
                <View style={styles.adminBadge}>
                    <Text style={styles.adminBadgeText}>Owner</Text>
                </View>
            )}
            {member.role === 'editor' && (
                <View style={[styles.adminBadge, { backgroundColor: '#F3E8FF' }]}>
                    <Text style={[styles.adminBadgeText, { color: '#9333EA' }]}>Editor</Text>
                </View>
            )}
            {member.role !== 'owner' && (
                <TouchableOpacity>
                    <MaterialCommunityIcons name="dots-vertical" size={24} color="#A7A9BE" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FB' },
    headerContainer: { backgroundColor: '#000833', paddingBottom: 24 },
    safeHeader: { paddingHorizontal: 24 },
    navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 10 },
    addUserButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 24, color: '#FFFFFF', textTransform: 'uppercase', marginBottom: 4 },
    headerSubtitle: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: '#A7A9BE' },

    content: { padding: 24, paddingBottom: 100 },

    sectionTitle: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: '#000833', textTransform: 'uppercase', marginBottom: 16, marginTop: 8 },

    card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    avatarBox: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    cardContent: { flex: 1 },
    name: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#000833', marginBottom: 2 },
    email: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: '#6E7591' },

    adminBadge: { backgroundColor: '#DBEAFE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    adminBadgeText: { fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: '#3B82F6' },

    footer: { padding: 24, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E6E8F0' },
    inviteButton: { backgroundColor: '#000833', borderRadius: 12, paddingVertical: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    inviteButtonText: { fontFamily: 'Outfit_600SemiBold', color: '#FFFFFF', fontSize: 16 },

    modalCenteredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%'
    },
    modalTitle: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 18,
        marginBottom: 10,
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontFamily: 'Outfit_400Regular',
    },
    input: {
        height: 50,
        width: '100%',
        borderColor: '#E6E8F0',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 20,
        fontFamily: 'Outfit_400Regular',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 10,
        width: '100%',
    },
    button: {
        borderRadius: 12,
        padding: 15,
        elevation: 2,
        flex: 1,
        alignItems: 'center',
    },
    buttonClose: {
        backgroundColor: '#E6E8F0',
    },
    buttonConfirm: {
        backgroundColor: '#000833',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Outfit_600SemiBold',
    },
    textStyleCancel: {
        color: '#000833',
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Outfit_600SemiBold',
    },
});
