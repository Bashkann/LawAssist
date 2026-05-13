import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import lawyersApi from '../../api/lawyersApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { formatDate } from '../../utils/formatDate';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [lawyer, setLawyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    fetchProfile();
  }, [user?.id]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => { if (user?.id) fetchProfile(); });
    return unsubscribe;
  }, [navigation, user?.id]);

  const fetchProfile = async () => {
    try {
      const res = await lawyersApi.getProfile(user.id);
      setLawyer(res.data.data.lawyer);
    } catch (err) {
      setError(err.response?.data?.message || 'Profil yüklenemedi.');
    } finally { setLoading(false); }
  };

  const handleDelete = () => {
    Alert.alert('Hesabı Sil', 'Hesabınızı kalıcı olarak silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        setDeleting(true);
        try { await lawyersApi.deleteProfile(user.id); await logout(); }
        catch (err) { Alert.alert('Hata', err.response?.data?.message || 'Silme başarısız.'); setDeleting(false); }
      }},
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Çıkış', 'Çıkış yapmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', onPress: async () => { await logout(); } },
    ]);
  };

  const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  );

  if (loading) return <LoadingSpinner text="Profil yükleniyor..." />;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <ErrorMessage message={error} />
        {lawyer && (
          <View style={styles.card}>
            <View style={styles.gradientBar} />
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{lawyer.first_name?.[0]}{lawyer.last_name?.[0]}</Text>
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.name}>{lawyer.first_name} {lawyer.last_name}</Text>
                <Text style={styles.email}>{lawyer.email}</Text>
              </View>
            </View>

            <View style={styles.infoGrid}>
              <InfoRow label="Ad" value={lawyer.first_name} />
              <InfoRow label="Soyad" value={lawyer.last_name} />
              <InfoRow label="Email" value={lawyer.email} />
              <InfoRow label="Telefon" value={lawyer.phone} />
              <InfoRow label="Baro" value={lawyer.bar_association} />
              <InfoRow label="Sicil No" value={lawyer.bar_number} />
              <InfoRow label="Durum" value={lawyer.status === 'active' ? 'Aktif' : lawyer.status} />
              <InfoRow label="Kayıt Tarihi" value={formatDate(lawyer.created_at)} />
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
                <Ionicons name="create-outline" size={16} color="#fff" />
                <Text style={styles.editBtnText}>Profili Düzenle</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={16} color="#6b7280" />
                <Text style={styles.logoutBtnText}>Çıkış Yap</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={deleting}>
                <Text style={styles.deleteBtnText}>{deleting ? 'Siliniyor...' : 'Hesabı Sil'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  container: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', overflow: 'hidden' },
  gradientBar: { height: 48, backgroundColor: '#2563eb' },
  profileHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: -24 },
  avatar: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#1e40af', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#fff' },
  name: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8 },
  email: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  infoGrid: { paddingHorizontal: 16, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#f3f4f6', marginTop: 16 },
  infoRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  infoLabel: { fontSize: 11, fontWeight: '500', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 14, color: '#111827', marginTop: 2 },
  actions: { padding: 16, gap: 10, borderTopWidth: 1, borderTopColor: '#f3f4f6', marginTop: 8 },
  editBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 12 },
  editBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: '#e5e7eb', paddingVertical: 12, borderRadius: 12 },
  logoutBtnText: { color: '#6b7280', fontSize: 14, fontWeight: '500' },
  deleteBtn: { alignItems: 'center', paddingVertical: 12, borderWidth: 2, borderColor: '#dc2626', borderRadius: 12 },
  deleteBtnText: { color: '#dc2626', fontSize: 14, fontWeight: '600' },
});
