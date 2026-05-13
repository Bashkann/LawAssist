import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import lawyersApi from '../../api/lawyersApi';
import listingsApi from '../../api/listingsApi';
import ApplicationCard from '../../components/ApplicationCard';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function MyApplicationsScreen() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => { if (user?.id) fetchData(); }, [user?.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await lawyersApi.getApplications(user.id);
      setApplications(res.data.data?.applications || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCancel = (app) => {
    Alert.alert('İptal', 'Bu başvurunuzu iptal etmek istediğinize emin misiniz?', [
      { text: 'Hayır', style: 'cancel' },
      { text: 'İptal Et', style: 'destructive', onPress: async () => {
        setCancellingId(app.id);
        try { await listingsApi.cancelApplication(app.listing_id, app.id); fetchData(); }
        catch (err) { Alert.alert('Hata', err.response?.data?.message || 'İptal işlemi başarısız.'); }
        finally { setCancellingId(null); }
      }},
    ]);
  };

  const filteredApps = filter === 'all' ? applications : applications.filter(a => a.status === filter);

  const stats = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const tabs = [
    { key: 'all', label: 'Tümü', count: stats.all },
    { key: 'pending', label: 'Beklemede', count: stats.pending },
    { key: 'approved', label: 'Onaylanan', count: stats.approved },
    { key: 'rejected', label: 'Reddedilen', count: stats.rejected },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Başvurularım</Text>
        <Text style={styles.subtitle}>Diğer avukatların ilanlarına yaptığınız başvurular</Text>
      </View>

      {loading ? <LoadingSpinner text="Başvurular yükleniyor..." /> : (
        <>
          {/* Stat cards */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: '#f9fafb' }]}>
              <Text style={styles.statLabel}>Toplam</Text>
              <Text style={[styles.statValue, { color: '#111827' }]}>{stats.all}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#eff6ff' }]}>
              <Text style={styles.statLabel}>Beklemede</Text>
              <Text style={[styles.statValue, { color: '#2563eb' }]}>{stats.pending}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#f0fdf4' }]}>
              <Text style={styles.statLabel}>Onaylanan</Text>
              <Text style={[styles.statValue, { color: '#16a34a' }]}>{stats.approved}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#fef2f2' }]}>
              <Text style={styles.statLabel}>Reddedilen</Text>
              <Text style={[styles.statValue, { color: '#ef4444' }]}>{stats.rejected}</Text>
            </View>
          </View>

          {/* Filter tabs */}
          <View style={styles.tabRow}>
            {tabs.map(tab => (
              <TouchableOpacity key={tab.key}
                style={[styles.tabBtn, filter === tab.key && styles.tabBtnActive]}
                onPress={() => setFilter(tab.key)}>
                <Text style={[styles.tabText, filter === tab.key && styles.tabTextActive]}>{tab.label} ({tab.count})</Text>
              </TouchableOpacity>
            ))}
          </View>

          <FlatList data={filteredApps} keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ApplicationCard application={item} onCancel={item.status === 'pending' ? handleCancel : undefined} showActions={item.status === 'pending'} />
            )}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>Başvuru Bulunamadı</Text>
                <Text style={styles.emptyText}>{filter === 'all' ? 'Henüz bir ilana başvuru yapmadınız.' : 'Bu filtreye uygun başvuru yok.'}</Text>
              </View>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  statCard: { flex: 1, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#f3f4f6' },
  statLabel: { fontSize: 10, fontWeight: '500', color: '#9ca3af' },
  statValue: { fontSize: 18, fontWeight: '700', marginTop: 2 },
  tabRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  tabBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff', marginBottom: 4 },
  tabBtnActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  tabText: { fontSize: 12, fontWeight: '500', color: '#6b7280' },
  tabTextActive: { color: '#fff' },
  list: { padding: 16 },
  emptyBox: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', padding: 48, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  emptyText: { fontSize: 13, color: '#9ca3af', textAlign: 'center' },
});
