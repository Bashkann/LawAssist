import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import authApi from '../../api/authApi';
import ErrorMessage from '../../components/ErrorMessage';

export default function RegisterScreen({ navigation }) {
  const { login } = useAuth();
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '', confirmPassword: '',
    phone: '', bar_association: '', bar_number: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (key, val) => { setForm({ ...form, [key]: val }); if (error) setError(''); };

  const handleSubmit = async () => {
    const { first_name, last_name, email, password, confirmPassword, phone, bar_association, bar_number } = form;
    if (!first_name || !last_name || !email || !password || !phone || !bar_association || !bar_number) {
      setError('Tüm alanlar zorunludur.'); return;
    }
    if (password.length < 8) { setError('Şifre en az 8 karakter olmalıdır.'); return; }
    if (password !== confirmPassword) { setError('Şifreler eşleşmiyor.'); return; }

    setLoading(true);
    try {
      const { confirmPassword: _, ...payload } = form;
      const res = await authApi.register(payload);
      const { lawyer, accessToken } = res.data.data;
      await login(lawyer, accessToken);
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt yapılamadı.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = styles.input;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <Ionicons name="scale-outline" size={24} color="#2563eb" />
          <Text style={styles.logoText}>LawAssist</Text>
        </View>

        <Text style={styles.title}>Kayıt Ol</Text>
        <Text style={styles.subtitle}>Yeni hesap oluşturun</Text>

        <ErrorMessage message={error} />

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Ad</Text>
            <TextInput style={inputStyle} placeholder="Ad" placeholderTextColor="#9ca3af" value={form.first_name} onChangeText={(t) => update('first_name', t)} />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Soyad</Text>
            <TextInput style={inputStyle} placeholder="Soyad" placeholderTextColor="#9ca3af" value={form.last_name} onChangeText={(t) => update('last_name', t)} />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput style={inputStyle} placeholder="ornek@email.com" placeholderTextColor="#9ca3af" value={form.email} onChangeText={(t) => update('email', t)} keyboardType="email-address" autoCapitalize="none" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Telefon</Text>
          <TextInput style={inputStyle} placeholder="+90 5XX XXX XX XX" placeholderTextColor="#9ca3af" value={form.phone} onChangeText={(t) => update('phone', t)} keyboardType="phone-pad" />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Baro</Text>
            <TextInput style={inputStyle} placeholder="Baro adı" placeholderTextColor="#9ca3af" value={form.bar_association} onChangeText={(t) => update('bar_association', t)} />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Baro Sicil No</Text>
            <TextInput style={inputStyle} placeholder="Sicil numarası" placeholderTextColor="#9ca3af" value={form.bar_number} onChangeText={(t) => update('bar_number', t)} />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Şifre</Text>
            <TextInput style={inputStyle} placeholder="En az 8 karakter" placeholderTextColor="#9ca3af" value={form.password} onChangeText={(t) => update('password', t)} secureTextEntry />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Şifre Tekrar</Text>
            <TextInput style={inputStyle} placeholder="Tekrar yazın" placeholderTextColor="#9ca3af" value={form.confirmPassword} onChangeText={(t) => update('confirmPassword', t)} secureTextEntry />
          </View>
        </View>

        <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.submitText}>{loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}</Text>
        </TouchableOpacity>

        <View style={styles.bottomRow}>
          <Text style={styles.bottomText}>Zaten hesabınız var mı? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#fff' },
  logoContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20, marginBottom: 24 },
  logoText: { fontSize: 20, fontWeight: '700', color: '#111827' },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#9ca3af', marginBottom: 20 },
  row: { flexDirection: 'row', gap: 12 },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: '#111827' },
  submitBtn: { backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8, marginBottom: 20 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  bottomRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  bottomText: { fontSize: 14, color: '#9ca3af' },
  linkText: { fontSize: 14, color: '#2563eb', fontWeight: '600' },
});
