import { HapticTab } from '@/components/haptic-tab';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#A7A9BE',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.label,
      }}>

      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="cartons"
        options={{
          title: 'Cartons',
          tabBarIcon: ({ color }) => <Feather name="package" size={24} color={color} />,
        }}
      />

      {/* Middle Button - Scan */}
      <Tabs.Screen
        name="scan"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <View style={styles.scanButton}>
              <MaterialCommunityIcons name="qrcode-scan" size={30} color="#000833" />
            </View>
          ),
          tabBarLabel: () => null, // No label for scan button usually in this design
        }}
      />

      <Tabs.Screen
        name="recherche"
        options={{
          title: 'Recherche',
          tabBarIcon: ({ color }) => <Feather name="search" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="compte"
        options={{
          title: 'Compte',
          tabBarIcon: ({ color }) => <Feather name="user" size={24} color={color} />,
        }}
      />


    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#000833',
    borderTopWidth: 0,
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    paddingTop: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 0,
  },
  label: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 10,
    marginTop: 4,
  },
  scanButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFC107',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30, // Lift it up
    // shadowColor: '#FFC107',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.3,
    // shadowRadius: 8,
    // elevation: 5,
    borderWidth: 4,
    borderColor: '#000833', // Match background color to create 'cutout' effect if needed, or just hover
  }
});
