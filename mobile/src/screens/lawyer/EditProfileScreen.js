import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import lawyersApi from '../../api/lawyersApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

export default function EditProfileScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', bar_association: '', bar_number: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await lawyersApi.getProfile(user.id);
        const l = res.data.data.lawyer;
        setForm({ first_name: l.first_name || '', last_name: l.last_name || '', email: l.email || '', phone: l.phone || '', bar_association: l.bar_association || '', bar_number: l.bar_number || '' });
      } catch (err) { setError(err.response?.data?.message || 'Profil yüklenemedi.'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [user.id]);

  const update = (key, val) => { setForm({ ...form, [key]: val }); if (error) setError(''); };

  const handleSubmit = async () => {
    setSaving(true); setError('');
    try {
      const res = await lawyersApi.updateProfile(user.id, form);
      const updated = res.data.data.lawyer;
      await updateUser(updated);
      Alert.alert('Başarılı', 'Profil güncellendi.', [{ text: 'Tamam', onPress: () => navigation.goBack() }]);
    } catch (err) {
      setError(err.response?.data?.message || 'Güncelleme başarısız.');
    } finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner text="Profil yükleniyor..." />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profili Düzenle</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <ErrorMessage message={error} />
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Ad</Text>
            <TextInput style={styles.input} value={form.first_name} onChangeText={(t) => update('first_name', t)} />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Soyad</Text>
            <TextInput style={styles.input} value={form.last_name} onChangeText={(t) => update('last_name', t)} />
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={form.email} onChangeText={(t) => update('email', t)} keyboardType="email-address" autoCapitalize="none" />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Telefon</Text>
          <TextInput style={styles.input} value={form.phone} onChangeText={(t) => update('phone', t)} keyboardType="phone-pad" />
        </View>
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Baro</Text>
            <TextInput style={styles.input} value={form.bar_association} onChangeText={(t) => update('bar_association', t)} />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Sicil No</Text>
            <TextInput style={styles.input} value={form.bar_number} onChangeText={(t) => update('bar_number', t)} />
          </View>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSubmit} disabled={saving}>
            <Text style={styles.saveBtnText}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelBtnText}>İptal</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  container: { padding: 16 },
  row: { flexDirection: 'row', gap: 12 },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: '#111827', backgroundColor: '#fff' },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  saveBtn: { flex: 1, backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  cancelBtn: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  cancelBtnText: { color: '#6b7280', fontSize: 15, fontWeight: '500' },
});
