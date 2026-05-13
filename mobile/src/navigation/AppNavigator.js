import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import LawyerTabs from './LawyerTabs';
import AdminStack from './AdminStack';
import LoadingSpinner from '../components/LoadingSpinner';

const RootStack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  const checkAdmin = useCallback(async () => {
    try {
      const adminToken = await SecureStore.getItemAsync('adminToken');
      setIsAdmin(!!adminToken);
    } catch {
      setIsAdmin(false);
    } finally {
      setCheckingAdmin(false);
    }
  }, []);

  useEffect(() => { checkAdmin(); }, [checkAdmin, user]);

  // Admin login/logout sonrasi yeniden kontrol
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const adminToken = await SecureStore.getItemAsync('adminToken');
        const newVal = !!adminToken;
        if (newVal !== isAdmin) setIsAdmin(newVal);
      } catch {}
    }, 1000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  if (loading || checkingAdmin) {
    return <LoadingSpinner text="Uygulama yükleniyor..." />;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <RootStack.Screen name="LawyerTabs" component={LawyerTabs} />
        ) : isAdmin ? (
          <RootStack.Screen name="AdminStack" component={AdminStack} />
        ) : (
          <RootStack.Screen name="AuthStack" component={AuthStack} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
