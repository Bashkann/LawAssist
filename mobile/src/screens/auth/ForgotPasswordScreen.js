import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import authApi from '../../api/authApi';
import ErrorMessage from '../../components/ErrorMessage';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) { setError('Email adresi zorunludur.'); return; }
    setLoading(true); setError('');
    try {
      await authApi.forgotPassword(email, 'mobile');
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'İşlem başarısız.');
    } finally { setLoading(false); }
  };

  const handleTokenSubmit = () => {
    if (!token.trim()) { setError('Lütfen token giriniz.'); return; }
    setError('');
    navigation.navigate('ResetPassword', { token: token.trim() });
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.logoContainer}>
        <Ionicons name="scale-outline" size={24} color="#2563eb" />
        <Text style={styles.logoText}>LawAssist</Text>
      </View>

      {!sent ? (
        // --- ADIM 1: Email gir ---
        <>
          <Text style={styles.title}>Şifremi Unuttum</Text>
          <Text style={styles.subtitle}>Email adresinizi girin, şifre sıfırlama bağlantısı göndereceğiz.</Text>
          <ErrorMessage message={error} />
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Adresi</Text>
            <TextInput
              style={styles.input}
              placeholder="ornek@email.com"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={(t) => { setEmail(t); if (error) setError(''); }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitText}>{loading ? 'Gönderiliyor...' : 'Bağlantı Gönder'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backBtn}>
            <Text style={styles.linkText}>Giriş sayfasına dön</Text>
          </TouchableOpacity>
        </>
      ) : (
        // --- ADIM 2: Mail gönderildi, token gir ---
        <>
          <View style={styles.center}>
            <View style={styles.successIcon}>
              <Ionicons name="mail-outline" size={32} color="#16a34a" />
            </View>
            <Text style={styles.title}>Email Gönderildi</Text>
            <Text style={styles.subtitle}>
              Mailinize gelen bağlantıdaki token'ı aşağıya yapıştırın.{'\n'}
              Bağlantı şu şekilde görünür:{'\n'}
              <Text style={styles.hintCode}>...?token=</Text>
              <Text style={styles.hintBold}>BURASI TOKEN</Text>
            </Text>
          </View>

          <ErrorMessage message={error} />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sıfırlama Token'ı</Text>
            <TextInput
              style={styles.input}
              placeholder="Token'ı buraya yapıştırın"
              placeholderTextColor="#9ca3af"
              value={token}
              onChangeText={(t) => { setToken(t); if (error) setError(''); }}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleTokenSubmit}>
            <Text style={styles.submitText}>Devam Et</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSubmit} style={styles.backBtn}>
            <Text style={styles.linkText}>Tekrar gönder</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backBtn}>
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
  center: { alignItems: 'center', marginBottom: 8 },
  successIcon: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  hintCode: { fontSize: 13, color: '#6b7280', fontFamily: 'monospace' },
  hintBold: { fontSize: 13, color: '#2563eb', fontWeight: '700' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#111827' },
  submitBtn: { backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  backBtn: { alignSelf: 'center', marginTop: 16 },
  linkText: { fontSize: 14, color: '#2563eb', fontWeight: '600' },
});