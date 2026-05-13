import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import authApi from '../../api/authApi';
import ErrorMessage from '../../components/ErrorMessage';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) { setError('Email adresi zorunludur.'); return; }
    setLoading(true); setError('');
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'İşlem başarısız.');
    } finally { setLoading(false); }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.logoContainer}>
        <Ionicons name="scale-outline" size={24} color="#2563eb" />
        <Text style={styles.logoText}>LawAssist</Text>
      </View>

      {sent ? (
        <View style={styles.center}>
          <View style={styles.successIcon}><Ionicons name="mail-outline" size={32} color="#16a34a" /></View>
          <Text style={styles.title}>Email Gönderildi</Text>
          <Text style={styles.subtitle}>Kayıtlı bir hesap varsa şifre sıfırlama bağlantısı gönderildi.</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Giriş sayfasına dön</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.title}>Şifremi Unuttum</Text>
          <Text style={styles.subtitle}>Email adresinizi girin, şifre sıfırlama bağlantısı göndereceğiz.</Text>
          <ErrorMessage message={error} />
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Adresi</Text>
            <TextInput style={styles.input} placeholder="ornek@email.com" placeholderTextColor="#9ca3af"
              value={email} onChangeText={(t) => { setEmail(t); if (error) setError(''); }}
              keyboardType="email-address" autoCapitalize="none" />
          </View>
          <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.submitText}>{loading ? 'Gönderiliyor...' : 'Bağlantı Gönder'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ alignSelf: 'center', marginTop: 16 }}>
            <Text style={styles.linkText}>Giriş sayfasına dön</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  logoContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 32 },
  logoText: { fontSize: 20, fontWeight: '700', color: '#111827' },
  center: { alignItems: 'center' },
  successIcon: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#111827' },
  submitBtn: { backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  linkText: { fontSize: 14, color: '#2563eb', fontWeight: '600' },
});
