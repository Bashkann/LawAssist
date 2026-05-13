import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import adminApi from '../../api/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminDashboardScreen({ navigation }) {
  const [stats, setStats] = useState({ lawyers: 0, active: 0, suspended: 0, listings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const [lawyersRes, listingsRes, activeRes, suspRes] = await Promise.all([
        adminApi.getLawyers({ limit: 1 }),
        adminApi.getListings({ limit: 1 }),
        adminApi.getLawyers({ status: 'active', limit: 1 }),
        adminApi.getLawyers({ status: 'suspended', limit: 1 }),
      ]);
      setStats({
        lawyers: lawyersRes.data.pagination?.total || 0,
        active: activeRes.data.pagination?.total || 0,
        suspended: suspRes.data.pagination?.total || 0,
        listings: listingsRes.data.pagination?.total || 0,
      });
    } catch {} finally { setLoading(false); }
  };

  const handleLogout = () => {
    Alert.alert('Çıkış', 'Admin panelinden çıkmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', onPress: async () => {
        await SecureStore.deleteItemAsync('adminToken');
        await SecureStore.deleteItemAsync('admin');
        // AppNavigator otomatik olarak AuthStack'e donecek
      }},
    ]);
  };

  if (loading) return <LoadingSpinner text="Panel yükleniyor..." />;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtitle}>Sistem genel durumu</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <StatCard icon="people" label="Toplam Avukat" value={stats.lawyers} color="#111827" bg="#f9fafb" />
          <StatCard icon="checkmark-circle" label="Aktif" value={stats.active} color="#16a34a" bg="#f0fdf4" />
          <StatCard icon="warning" label="Askıda" value={stats.suspended} color="#d97706" bg="#fffbeb" />
          <StatCard icon="document-text" label="Toplam İlan" value={stats.listings} color="#2563eb" bg="#eff6ff" />
        </View>

        <TouchableOpacity style={styles.menuCard} onPress={() => navigation.navigate('AdminLawyers')}>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Avukat Yönetimi</Text>
            <Text style={styles.menuDesc}>Avukat hesaplarını görüntüle, düzenle, askıya al veya sil.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuCard} onPress={() => navigation.navigate('AdminListings')}>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>İlan Yönetimi</Text>
            <Text style={styles.menuDesc}>Tüm tevkil ilanlarını denetle.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, label, value, color, bg }) {
  return (
    <View style={[styles.statCard, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={24} color={color} style={{ marginBottom: 4 }} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  container: { padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  logoutBtn: { padding: 8 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard: { width: '48%', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f3f4f6' },
  statLabel: { fontSize: 11, fontWeight: '500', color: '#9ca3af', marginBottom: 2 },
  statValue: { fontSize: 24, fontWeight: '700' },
  menuCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  menuTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  menuDesc: { fontSize: 13, color: '#9ca3af' },
});
