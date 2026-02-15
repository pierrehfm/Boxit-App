
import LogoHorizontal from '@/assets/images/logoHorizontal.svg';
import { useSession } from '@/context/AuthContext';
import { api, Box, Project, ProjectStats } from '@/lib/api';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { user } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectStats, setCurrentProjectStats] = useState<ProjectStats | null>(null);
  const [recentBoxes, setRecentBoxes] = useState<Box[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const fetchedProjects = await api.getUserProjects();
      setProjects(fetchedProjects);

      if (fetchedProjects.length > 0) {
        const firstProject = fetchedProjects[0];
        const stats = await api.getProjectStats(firstProject.id);
        setCurrentProjectStats(stats);

        const boxes = await api.getRecentBoxes(firstProject.id);
        setRecentBoxes(boxes);
      } else {
        setCurrentProjectStats(null);
        setRecentBoxes([]);
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

  const handleProjectPress = (projectId: string) => {
    router.push({ pathname: '/project-dashboard', params: { projectId } });
  };

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.fixedHeader}>
        <View style={styles.header}>
          <LogoHorizontal width={120} height={40} />
          <TouchableOpacity onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={24} color="#000833" />
          </TouchableOpacity>
        </View>
        <View style={styles.separator} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>MES PROJETS EN COURS</Text>
          <TouchableOpacity onPress={() => { /* Navigate to a full list if created */ }}>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#000833" style={{ marginVertical: 20 }} />
        ) : projects.length > 0 && currentProjectStats ? (
          <TouchableOpacity activeOpacity={0.9} onPress={() => handleProjectPress(projects[0].id)}>
            <View style={styles.heroCard}>
              <View style={styles.heroHeader}>
                <Text style={styles.heroTitle} numberOfLines={2}>{currentProjectStats.project_name}</Text>
                <View style={styles.dateContainer}>
                  <MaterialCommunityIcons name="calendar-blank" size={16} color="#A7A9BE" />
                  <Text style={styles.heroDate}>
                    {format(new Date(projects[0].created_at), 'd MMM yyyy', { locale: fr })}
                  </Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{currentProjectStats.total_boxes}</Text>
                  <Text style={styles.statLabel}>Cartons</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{currentProjectStats.total_items}</Text>
                  <Text style={styles.statLabel}>Objets</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>
                    {currentProjectStats.total_boxes > 0
                      ? Math.round(((currentProjectStats.boxes_sealed + currentProjectStats.boxes_unpacked) / currentProjectStats.total_boxes) * 100)
                      : 0}%
                  </Text>
                  <Text style={styles.statLabel}>Complété</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={[styles.heroCard, { alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={[styles.heroTitle, { textAlign: 'center', marginBottom: 12 }]}>Aucun projet</Text>
            <Text style={[styles.heroDate, { marginBottom: 20 }]}>Commencez votre premier déménagement !</Text>
            <TouchableOpacity
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 }}
              onPress={() => { router.push('/new-project') /* Assumes new project screen, if not make one */ }}
            >
              <Text style={{ color: '#FFFFFF', fontFamily: 'Outfit_600SemiBold' }}>Créer un projet</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Actions Rapides */}
        <Text style={styles.sectionTitle}>ACTIONS RAPIDES</Text>
        <View style={styles.actionsGrid}>
          <ActionButton
            icon="plus"
            label="NOUVEAU"
            library="MaterialCommunityIcons"
            onPress={() => {
              if (projects.length > 0) {
                router.push({ pathname: '/new-box', params: { projectId: projects[0].id } });
              } else {
                // handle create project
                // Note: Assuming new-project flow exists or should be created.
              }
            }}
          />
          <ActionButton
            icon="scan-helper"
            label="SCANNER"
            library="MaterialCommunityIcons"
            onPress={() => router.push('/(tabs)/scan')}
          />
          <ActionButton
            icon="bookmark"
            label="CARTONS"
            library="Ionicons"
            onPress={() => router.push('/(tabs)/cartons')}
          />
          <ActionButton
            icon="magnify"
            label="RECHERCHE"
            library="MaterialCommunityIcons"
            onPress={() => router.push('/(tabs)/recherche')}
          />
        </View>

        <Text style={styles.sectionTitle}>CARTONS RÉCENTS</Text>

        {recentBoxes.length > 0 ? (
          recentBoxes.map((box) => (
            <BoxCard
              key={box.id}
              id={`QR - ${box.qr_code}`}
              title={box.name}
              location={`${box.room || 'Sans pièce'} • ${(box as any).item_count || 0} Objets`}
              tags={[]}
            />
          ))
        ) : (
          <Text style={{ color: '#6E7591', fontFamily: 'Outfit_400Regular', marginTop: 10 }}>Aucun carton récent.</Text>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function ActionButton({ icon, label, library, onPress }: { icon: string, label: string, library: 'Ionicons' | 'MaterialCommunityIcons', onPress?: () => void }) {
  const IconComponent = library === 'Ionicons' ? Ionicons : MaterialCommunityIcons;
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <IconComponent name={icon as any} size={32} color="#000833" />
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function BoxCard({ id, title, location, tags }: { id: string, title: string, location: string, tags: string[] }) {
  return (
    <View style={styles.boxCard}>
      <View style={styles.boxIconContainer}>
        <View style={styles.boxIcon}>
          <MaterialCommunityIcons name="package-variant-closed" size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.boxId}>{id}</Text>
      </View>
      <View style={styles.boxContent}>
        <Text style={styles.boxTitle}>{title}</Text>
        <Text style={styles.boxLocation}>{location}</Text>
        {tags.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsRow}>
            {tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  fixedHeader: {
    paddingHorizontal: 24,
    paddingTop: 10,
    backgroundColor: '#F8F9FB',
    zIndex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 52,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userName: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: '#000833',
    textTransform: 'uppercase',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000833',
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#E6E8F0',
    marginHorizontal: -24,
    // marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: '#000833',
    textTransform: 'uppercase',
  },
  seeAll: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: '#6E7591',
    textDecorationLine: 'underline',
  },
  heroCard: {
    backgroundColor: '#000833',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000833',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 5,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    textTransform: 'uppercase',
    maxWidth: '60%',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroDate: {
    color: '#E0E0E0',
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontFamily: 'Outfit_500Medium',
    fontSize: 24,
    marginBottom: 4,
  },
  statLabel: {
    color: '#A7A9BE',
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionLabel: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 10,
    color: '#000833',
    textTransform: 'uppercase',
  },
  boxCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  boxIconContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  boxIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#000833',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  boxId: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 10,
    color: '#000833',
  },
  boxContent: {
    flex: 1,
  },
  boxTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: '#000833',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  boxLocation: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    color: '#000833',
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
  },
  tag: {
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  tagText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 10,
    color: '#000833',
  },
});
