import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import authApi from '../../api/authApi';
import ErrorMessage from '../../components/ErrorMessage';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (!form.email || !form.password) { setError('Email ve şifre zorunludur.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(form);
      const { lawyer, accessToken } = res.data.data;
      await login(lawyer, accessToken);
    } catch (err) {
      setError(err.response?.data?.message || 'Giriş yapılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="scale-outline" size={28} color="#2563eb" />
          </View>
          <Text style={styles.logoText}>LawAssist</Text>
        </View>

        <Text style={styles.title}>Giriş Yap</Text>
        <Text style={styles.subtitle}>Hesabınıza giriş yapın</Text>

        <ErrorMessage message={error} />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Adresi</Text>
          <TextInput
            style={styles.input}
            placeholder="ornek@email.com"
            placeholderTextColor="#9ca3af"
            value={form.email}
            onChangeText={(t) => { setForm({ ...form, email: t }); if (error) setError(''); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Şifre</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Şifreniz"
              placeholderTextColor="#9ca3af"
              value={form.password}
              onChangeText={(t) => { setForm({ ...form, password: t }); if (error) setError(''); }}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotText}>Şifremi Unuttum</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitText}>{loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}</Text>
        </TouchableOpacity>

        <View style={styles.bottomRow}>
          <Text style={styles.bottomText}>Hesabınız yok mu? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>Kayıt Ol</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.adminBtn} onPress={() => navigation.navigate('AdminLogin')}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#6b7280" />
          <Text style={styles.adminBtnText}>Yönetici Girişi</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  logoContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 32 },
  logoIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  logoText: { fontSize: 22, fontWeight: '700', color: '#111827', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 4, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  subtitle: { fontSize: 14, color: '#9ca3af', marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#111827' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12 },
  passwordInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#111827' },
  eyeBtn: { paddingHorizontal: 12 },
  forgotText: { fontSize: 13, color: '#2563eb', fontWeight: '500', textAlign: 'right', marginBottom: 20 },
  submitBtn: { backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  bottomRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
  bottomText: { fontSize: 14, color: '#9ca3af' },
  linkText: { fontSize: 14, color: '#2563eb', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginBottom: 20 },
  adminBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12 },
  adminBtnText: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
});
