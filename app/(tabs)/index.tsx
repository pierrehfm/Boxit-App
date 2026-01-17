import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSession } from '@/context/AuthContext';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function HomeScreen() {
  const { signOut, user } = useSession();

  return (
    <View style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>Welcome Home!</ThemedText>
        <ThemedText style={styles.subtitle}>
          You are currently logged in as:
        </ThemedText>
        <ThemedText type="defaultSemiBold" style={styles.userText}>{user || 'Guest'}</ThemedText>

        <View style={styles.card}>
          <ThemedText>This is your personalized dashboard.</ThemedText>
        </View>

        <TouchableOpacity onPress={signOut} style={styles.button}>
          <ThemedText style={styles.buttonText}>Log Out</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
    // Note: Ideally use theme colors, but hardcoded white for simplicity matching login
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  userText: {
    fontSize: 18,
    marginBottom: 24,
  },
  card: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});
