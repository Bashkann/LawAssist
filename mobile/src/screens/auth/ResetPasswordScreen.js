import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import authApi from '../../api/authApi';
import ErrorMessage from '../../components/ErrorMessage';

export default function ResetPasswordScreen({ navigation, route }) {
  const token = route.params?.token || '';
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!form.password) { setError('Yeni şifre zorunludur.'); return; }
    if (form.password.length < 8) { setError('Şifre en az 8 karakter olmalıdır.'); return; }
    if (form.password !== form.confirmPassword) { setError('Şifreler eşleşmiyor.'); return; }
    setLoading(true);
    try {
      await authApi.resetPassword({ token, password: form.password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Şifre sıfırlama başarısız.');
    } finally { setLoading(false); }
  };

  if (!token) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Geçersiz Bağlantı</Text>
        <Text style={styles.subtitle}>Şifre sıfırlama bağlantısı geçersiz veya eksik.</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.linkText}>Yeni bağlantı iste</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {success ? (
        <View style={{ alignItems: 'center' }}>
          <View style={styles.successIcon}><Ionicons name="checkmark-circle" size={32} color="#16a34a" /></View>
          <Text style={styles.title}>Şifre Güncellendi</Text>
          <Text style={styles.subtitle}>Yeni şifrenizle giriş yapabilirsiniz.</Text>
          <TouchableOpacity style={styles.submitBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.submitText}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.title}>Yeni Şifre Belirle</Text>
          <Text style={styles.subtitle}>En az 8 karakterden oluşan yeni şifrenizi girin.</Text>
          <ErrorMessage message={error} />
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Yeni Şifre</Text>
            <TextInput style={styles.input} placeholder="En az 8 karakter" placeholderTextColor="#9ca3af"
              value={form.password} onChangeText={(t) => { setForm({...form, password: t}); setError(''); }} secureTextEntry />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Şifre Tekrar</Text>
            <TextInput style={styles.input} placeholder="Tekrar yazın" placeholderTextColor="#9ca3af"
              value={form.confirmPassword} onChangeText={(t) => { setForm({...form, confirmPassword: t}); setError(''); }} secureTextEntry />
          </View>
          <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.submitText}>{loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  successIcon: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#111827' },
  submitBtn: { backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  linkText: { fontSize: 14, color: '#2563eb', fontWeight: '600', textAlign: 'center' },
});
