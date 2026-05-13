import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import adminApi from '../../api/adminApi';
import ErrorMessage from '../../components/ErrorMessage';

export default function AdminLoginScreen({ navigation }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.email || !form.password) { setError('Email ve şifre zorunludur.'); return; }
    setLoading(true); setError('');
    try {
      const res = await adminApi.login(form);
      await SecureStore.setItemAsync('adminToken', res.data.data.token);
      await SecureStore.setItemAsync('admin', JSON.stringify(res.data.data.admin));
      // AppNavigator 1sn arayla adminToken kontrolu yapiyor,
      // token set edildigi anda otomatik AdminStack'e gecilecek.
    } catch (err) {
      setError(err.response?.data?.message || 'Giriş yapılamadı.');
    } finally { setLoading(false); }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.logoContainer}>
        <View style={styles.iconBox}>
          <Ionicons name="shield-checkmark-outline" size={28} color="#2563eb" />
        </View>
        <Text style={styles.logoText}>LawAssist</Text>
      </View>

      <View style={styles.adminBadge}>
        <View style={styles.dot} />
        <Text style={styles.adminBadgeText}>Admin Paneli</Text>
      </View>

      <Text style={styles.title}>Yönetici Girişi</Text>

      <ErrorMessage message={error} />

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email Adresi</Text>
        <TextInput style={styles.input} placeholder="Admin mailiniz" placeholderTextColor="#9ca3af"
          value={form.email} onChangeText={(t) => { setForm({...form, email: t}); setError(''); }}
          keyboardType="email-address" autoCapitalize="none" />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Şifre</Text>
        <TextInput style={styles.input} placeholder="Admin şifreniz" placeholderTextColor="#9ca3af"
          value={form.password} onChangeText={(t) => { setForm({...form, password: t}); setError(''); }}
          secureTextEntry />
      </View>

      <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.submitText}>{loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity style={styles.lawyerBtn} onPress={() => navigation.navigate('Login')}>
        <Ionicons name="person-outline" size={16} color="#6b7280" />
        <Text style={styles.lawyerBtnText}>Avukat Girişi</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  logoContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  logoText: { fontSize: 22, fontWeight: '700', color: '#111827' },
  adminBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#eff6ff', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#bfdbfe', marginBottom: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#2563eb' },
  adminBadgeText: { fontSize: 12, fontWeight: '600', color: '#2563eb' },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#111827' },
  submitBtn: { backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 24 },
  lawyerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12 },
  lawyerBtnText: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
});
