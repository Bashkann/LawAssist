import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminLawyersScreen from '../screens/admin/AdminLawyersScreen';
import AdminLawyerDetailScreen from '../screens/admin/AdminLawyerDetailScreen';
import AdminListingsScreen from '../screens/admin/AdminListingsScreen';

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1e40af' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Admin Panel' }} />
      <Stack.Screen name="AdminLawyers" component={AdminLawyersScreen} options={{ title: 'Avukat Yönetimi' }} />
      <Stack.Screen name="AdminLawyerDetail" component={AdminLawyerDetailScreen} options={{ title: 'Avukat Detay' }} />
      <Stack.Screen name="AdminListings" component={AdminListingsScreen} options={{ title: 'İlan Yönetimi' }} />
    </Stack.Navigator>
  );
}
