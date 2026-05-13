import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import lawyersApi from '../api/lawyersApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) { setLoading(false); return; }

      // Token'dan user id'yi çıkar (basit decode)
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role === 'admin') { setLoading(false); return; }
      if (payload.exp * 1000 < Date.now()) {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('user');
        setLoading(false);
        return;
      }

      // Cache'den user'ı yükle
      const cached = await SecureStore.getItemAsync('user');
      if (cached) setUser(JSON.parse(cached));

      // API'den güncel profili al
      const res = await lawyersApi.getProfile(payload.id);
      const lawyer = res.data.data.lawyer;
      setUser(lawyer);
      await SecureStore.setItemAsync('user', JSON.stringify(lawyer));
    } catch (e) {
      try {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('user');
      } catch {}
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (lawyer, token) => {
    await SecureStore.setItemAsync('accessToken', token);
    await SecureStore.setItemAsync('user', JSON.stringify(lawyer));
    setUser(lawyer);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('user');
    setUser(null);
  };

  const updateUser = async (updatedLawyer) => {
    setUser(updatedLawyer);
    await SecureStore.setItemAsync('user', JSON.stringify(updatedLawyer));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;
