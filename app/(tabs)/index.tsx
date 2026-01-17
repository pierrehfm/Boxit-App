import { useSession } from '@/context/AuthContext';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// @ts-ignore
import LogoHorizontal from '@/assets/images/logoHorizontal.svg';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeScreen() {
  const { user } = useSession();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <LogoHorizontal width={120} height={40} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>JÉRÉMY DUC</Text>
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color="#fff" />
            </View>
          </View>
        </View>

        <View style={styles.separator} />

        {/* Hero Card - Déménagement Paris */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <Text style={styles.heroTitle}>DÉMÉNAGEMENT PARIS</Text>
            <View style={styles.dateContainer}>
              <MaterialCommunityIcons name="calendar-blank" size={16} color="#A7A9BE" />
              <Text style={styles.heroDate}>15 Jan 2026</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>24</Text>
              <Text style={styles.statLabel}>Cartons</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>52</Text>
              <Text style={styles.statLabel}>Objets</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>25%</Text>
              <Text style={styles.statLabel}>Complété</Text>
            </View>
          </View>
        </View>

        {/* Actions Rapides */}
        <Text style={styles.sectionTitle}>ACTIONS RAPIDES</Text>
        <View style={styles.actionsGrid}>
          <ActionButton icon="plus" label="NOUVEAU" library="MaterialCommunityIcons" />
          <ActionButton icon="scan-helper" label="SCANNER" library="MaterialCommunityIcons" />
          <ActionButton icon="bookmark" label="CARTONS" library="Ionicons" />
          <ActionButton icon="magnify" label="RECHERCHE" library="MaterialCommunityIcons" />
        </View>

        {/* Cartons Récents */}
        <Text style={styles.sectionTitle}>CARTONS RÉCENTS</Text>

        <BoxCard
          id="QR - 1203"
          title="LIVRES DE MA BIBLIOTHEQUE"
          location="Salon • 8 Objets"
          tags={['Romans', 'BD', 'Humour', 'PSY', '+8']}
        />

        <BoxCard
          id="QR - 2605"
          title="MA VAISSELLE"
          location="Cuisine • 30 Objets"
          tags={['Verres', 'Assiettes', 'Mug', 'Casseroles', '+5']}
        />

        <BoxCard
          id="QR - 3001"
          title="MEUBLES"
          location="Chambre • 30 Objets"
          tags={['Verres', 'Mug', 'Casseroles', '+5']}
        />

      </ScrollView>
    </SafeAreaView>
  );
}

function ActionButton({ icon, label, library }: { icon: string, label: string, library: 'Ionicons' | 'MaterialCommunityIcons' }) {
  const IconComponent = library === 'Ionicons' ? Ionicons : MaterialCommunityIcons;
  return (
    <TouchableOpacity style={styles.actionButton}>
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsRow}>
          {tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 10,
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
    marginBottom: 24,
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
  sectionTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 18,
    color: '#000833',
    textTransform: 'uppercase',
    marginBottom: 16,
    letterSpacing: 0.5,
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
