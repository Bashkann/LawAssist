import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import lawyersApi from '../../api/lawyersApi';
import listingsApi from '../../api/listingsApi';
import applicationsApi from '../../api/applicationsApi';
import { StatusBadge } from '../../components/ApplicationCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate } from '../../utils/formatDate';

export default function IncomingApplicationsScreen({ navigation }) {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { if (user?.id) fetchData(); }, [user?.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const listingsRes = await lawyersApi.getListings(user.id);
      const myListings = listingsRes.data.data?.listings || [];
      const allApps = [];
      for (const listing of myListings) {
        try {
          const appsRes = await listingsApi.getApplications(listing.id);
          const apps = appsRes.data.data || [];
          apps.forEach(app => { allApps.push({ ...app, listing }); });
        } catch {}
      }
      setApplications(allApps);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleApprove = (app) => {
    Alert.alert('Onaylama', 'Bu başvuruyu onaylamak istediğinize emin misiniz? İlan kapatılacak ve diğer başvurular reddedilecektir.', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Onayla', onPress: async () => {
        try { await applicationsApi.approve(app.id); fetchData(); }
        catch (err) { Alert.alert('Hata', err.response?.data?.message || 'Onaylama başarısız.'); }
      }},
    ]);
  };

  const handleReject = (app) => {
    Alert.alert('Reddetme', 'Bu başvuruyu reddetmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Reddet', style: 'destructive', onPress: async () => {
        try { await applicationsApi.reject(app.id); fetchData(); }
        catch (err) { Alert.alert('Hata', err.response?.data?.message || 'Reddetme başarısız.'); }
      }},
    ]);
  };

  const filteredApps = filter === 'all' ? applications : applications.filter(a => a.status === filter);

  const stats = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    cancelled: applications.filter(a => a.status === 'cancelled').length,
  };

  const tabs = [
    { key: 'all', label: 'Tümü', count: stats.all },
    { key: 'pending', label: 'Beklemede', count: stats.pending },
    { key: 'approved', label: 'Onaylanan', count: stats.approved },
    { key: 'rejected', label: 'Reddedilen', count: stats.rejected },
    { key: 'cancelled', label: 'İptal', count: stats.cancelled },
  ];

  const renderItem = ({ item: app }) => (
    <View style={styles.card}>
      <View style={styles.topRow}>
        {(app.listing?.title) && (
          <View style={styles.listingBadge}>
            <Text style={styles.listingBadgeText} numberOfLines={1}>{app.listing?.title}</Text>
          </View>
        )}
        <StatusBadge status={app.status} />
      </View>

      {app.applicant && (
        <View style={styles.applicantRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{app.applicant.first_name?.[0]}{app.applicant.last_name?.[0]}</Text>
          </View>
          <View>
            <Text style={styles.applicantName}>{app.applicant.first_name} {app.applicant.last_name}</Text>
            <Text style={styles.applicantInfo}>{app.applicant.bar_association} — {app.applicant.bar_number}</Text>
          </View>
        </View>
      )}

      {app.note ? <Text style={styles.note}>"{app.note}"</Text> : null}

      <View style={styles.metaRow}>
        {app.listing?.city && (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={13} color="#9ca3af" />
            <Text style={styles.metaText}>{app.listing.city}</Text>
          </View>
        )}
        {app.listing?.hearing_date && (
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={13} color="#9ca3af" />
            <Text style={styles.metaText}>{formatDate(app.listing.hearing_date)}</Text>
          </View>
        )}
        <Text style={styles.metaText}>Başvuru: {formatDate(app.created_at)}</Text>
      </View>

      {app.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(app)}>
            <Text style={styles.approveBtnText}>Onayla</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(app)}>
            <Text style={styles.rejectBtnText}>Reddet</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>İlanlarıma Gelen Başvurular</Text>
          <Text style={styles.headerSubtitle}>İlanlarınıza yapılan başvuruları buradan yönetebilirsiniz.</Text>
        </View>
      </View>

      {loading ? <LoadingSpinner text="Başvurular yükleniyor..." /> : (
        <>
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

          <View style={styles.tabRow}>
            {tabs.map(tab => (
              <TouchableOpacity key={tab.key}
                style={[styles.tabBtn, filter === tab.key && styles.tabBtnActive]}
                onPress={() => setFilter(tab.key)}>
                <Text style={[styles.tabText, filter === tab.key && styles.tabTextActive]}>
                  {tab.label} ({tab.count})
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <FlatList data={filteredApps} keyExtractor={(item) => item.id} renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>Başvuru Bulunamadı</Text>
                <Text style={styles.emptyText}>
                  {filter === 'all' ? 'İlanlarınıza henüz başvuru yapılmamış.' : 'Bu filtreye uygun başvuru yok.'}
                </Text>
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
  headerBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  headerSubtitle: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginVertical: 12 },
  statCard: { flex: 1, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#f3f4f6' },
  statLabel: { fontSize: 10, fontWeight: '500', color: '#9ca3af' },
  statValue: { fontSize: 18, fontWeight: '700', marginTop: 2 },
  tabRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  tabBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff', marginBottom: 4 },
  tabBtnActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  tabText: { fontSize: 12, fontWeight: '500', color: '#6b7280' },
  tabTextActive: { color: '#fff' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', padding: 16, marginBottom: 12 },
  topRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  listingBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, borderWidth: 1, borderColor: '#bfdbfe', maxWidth: '65%' },
  listingBadgeText: { fontSize: 11, fontWeight: '500', color: '#2563eb' },
  applicantRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 10, fontWeight: '700', color: '#6b7280' },
  applicantName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  applicantInfo: { fontSize: 11, color: '#9ca3af' },
  note: { fontSize: 13, color: '#6b7280', fontStyle: 'italic', marginVertical: 4 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 11, color: '#9ca3af' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12 },
  approveBtn: { backgroundColor: '#059669', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12 },
  approveBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  rejectBtn: { borderWidth: 1, borderColor: '#fecaca', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12 },
  rejectBtnText: { color: '#dc2626', fontSize: 12, fontWeight: '600' },
  emptyBox: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', padding: 48, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  emptyText: { fontSize: 13, color: '#9ca3af', textAlign: 'center' },
});
