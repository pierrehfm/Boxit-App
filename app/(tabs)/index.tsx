import LogoHorizontal from '@/assets/images/logoHorizontal.svg';
import { api, Project, ProjectStats } from '@/lib/api';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [allProjectStats, setAllProjectStats] = useState<ProjectStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const fetchedProjects = await api.getUserProjects();
      setProjects(fetchedProjects);

      if (fetchedProjects.length > 0) {
        const stats = await api.getAllProjectStats();
        setAllProjectStats(stats);
      } else {
        setAllProjectStats([]);
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.fixedHeader}>
        <View style={styles.header}>
          <LogoHorizontal width={120} height={40} />
          {/* <TouchableOpacity onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={24} color="#000833" />
          </TouchableOpacity> */}
        </View>
        <View style={styles.separator} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>MES PROJETS EN COURS</Text>
          <TouchableOpacity style={styles.addProjectButton} onPress={() => router.push('/new-project')}>
            <Ionicons name="add" size={20} color="#000833" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#000833" style={{ marginVertical: 20 }} />
        ) : projects.length > 0 ? (
          <>
            {projects.map(project => {
              const stats = allProjectStats.find(s => s.project_id === project.id);
              const total = Number(stats?.total_boxes ?? 0);
              const done = Number(stats?.boxes_sealed ?? 0) + Number(stats?.boxes_unpacked ?? 0);
              const progress = total > 0 ? Math.round((done / total) * 100) : 0;
              const isComplete = progress === 100;
              return (
                <TouchableOpacity
                  key={project.id}
                  activeOpacity={0.85}
                  onPress={() => router.push({ pathname: '/project-dashboard', params: { projectId: project.id } })}
                  style={styles.projectCard}
                >
                  <View style={styles.projectCardTop}>
                    <Text style={styles.projectCardName} numberOfLines={2}>{project.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: isComplete ? '#D1FAE5' : 'rgba(255,255,255,0.15)' }]}>
                      <Text style={[styles.statusBadgeText, { color: isComplete ? '#10B981' : '#FFFFFF' }]}>
                        {isComplete ? 'Terminé' : 'Actif'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.projectCardDate}>
                    {format(new Date(project.created_at), 'd MMM yyyy', { locale: fr })}
                  </Text>
                  <View style={styles.projectCardStats}>
                    <View style={styles.projectStatBox}>
                      <Text style={styles.projectStatValue}>{stats?.total_boxes ?? 0}</Text>
                      <Text style={styles.projectStatLabel}>Cartons</Text>
                    </View>
                    <View style={styles.projectStatBox}>
                      <Text style={styles.projectStatValue}>{stats?.total_items ?? 0}</Text>
                      <Text style={styles.projectStatLabel}>Objets</Text>
                    </View>
                    <View style={styles.projectStatBox}>
                      <Text style={styles.projectStatValue}>{progress}%</Text>
                      <Text style={styles.projectStatLabel}>Complété</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* <TouchableOpacity
              style={styles.addProjectCard}
              onPress={() => router.push('/new-project')}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={28} color="#A7A9BE" />
              <Text style={styles.addProjectCardText}>Nouveau projet</Text>
            </TouchableOpacity> */}
          </>
        ) : (
          <TouchableOpacity
            style={styles.emptyProjectCard}
            onPress={() => router.push('/new-project')}
          >
            <MaterialCommunityIcons name="package-variant" size={40} color="#A7A9BE" />
            <Text style={styles.emptyProjectTitle}>Aucun projet</Text>
            <Text style={styles.emptyProjectSub}>Créer mon premier déménagement</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  fixedHeader: { paddingHorizontal: 24, paddingTop: 10, backgroundColor: '#F8F9FB', zIndex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  separator: { height: 1, backgroundColor: '#E6E8F0', marginHorizontal: -24 },
  scrollContent: { padding: 24, paddingBottom: 100 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: '#000833', textTransform: 'uppercase' },
  addProjectButton: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: '#F0F2F5',
    justifyContent: 'center', alignItems: 'center',
  },

  projectCard: {
    backgroundColor: '#000833',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  projectCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  projectCardName: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#FFFFFF', textTransform: 'uppercase', flex: 1, marginRight: 10 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, flexShrink: 0 },
  statusBadgeText: { fontFamily: 'Outfit_600SemiBold', fontSize: 11 },
  projectCardDate: { fontFamily: 'Outfit_400Regular', fontSize: 11, color: '#A7A9BE', marginBottom: 20 },
  projectCardStats: { flexDirection: 'row', justifyContent: 'space-between' },
  projectStatBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  projectStatValue: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: '#FFFFFF', marginBottom: 2 },
  projectStatLabel: { fontFamily: 'Outfit_400Regular', fontSize: 10, color: '#A7A9BE' },

  addProjectCard: {
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E6E8F0',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 18,
    marginBottom: 8,
  },
  addProjectCardText: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: '#A7A9BE' },

  emptyProjectCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 36,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderStyle: 'dashed', borderColor: '#E6E8F0',
    gap: 10,
  },
  emptyProjectTitle: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#000833' },
  emptyProjectSub: { fontFamily: 'Outfit_400Regular', fontSize: 13, color: '#6E7591' },
});
