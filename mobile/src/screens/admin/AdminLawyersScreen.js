import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import adminApi from '../../api/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import { LAWYER_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatDate';

export default function AdminLawyersScreen({ navigation }) {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => { fetchLawyers(); }, [filter, page]);

  const fetchLawyers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getLawyers({ status: filter, page, limit: 20 });
      setLawyers(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch {} finally { setLoading(false); }
  };

  const renderItem = ({ item }) => {
    const status = LAWYER_STATUS[item.status];
    return (
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AdminLawyerDetail', { id: item.id })}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.first_name?.[0]}{item.last_name?.[0]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.first_name} {item.last_name}</Text>
            <Text style={styles.email}>{item.email}</Text>
          </View>
          {status && (
            <View style={[styles.badge, { backgroundColor: status.bg, borderColor: status.border }]}>
              <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
            </View>
          )}
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.metaText}>{item.bar_association || '—'}</Text>
          <Text style={styles.metaText}>{formatDate(item.created_at)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.filterRow}>
        {['all', 'active', 'suspended', 'deleted'].map(s => (
          <TouchableOpacity key={s} style={[styles.filterBtn, filter === s && styles.filterBtnActive]}
            onPress={() => { setFilter(s); setPage(1); }}>
            <Text style={[styles.filterText, filter === s && styles.filterTextActive]}>
              {s === 'all' ? 'Tümü' : LAWYER_STATUS[s]?.label || s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <LoadingSpinner text="Avukatlar yükleniyor..." /> : (
        <FlatList data={lawyers} keyExtractor={(item) => item.id} renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyBox}><Text style={styles.emptyText}>Avukat bulunamadı.</Text></View>
          }
          ListFooterComponent={pagination.totalPages > 1 ? (
            <View style={styles.paginationRow}>
              <TouchableOpacity style={styles.pageBtn} onPress={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <Text style={styles.pageBtnText}>Önceki</Text>
              </TouchableOpacity>
              <Text style={styles.pageInfo}>{page} / {pagination.totalPages}</Text>
              <TouchableOpacity style={styles.pageBtn} onPress={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}>
                <Text style={styles.pageBtnText}>Sonraki</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  filterRow: { flexDirection: 'row', padding: 16, gap: 8, flexWrap: 'wrap' },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  filterBtnActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  filterText: { fontSize: 13, fontWeight: '500', color: '#6b7280' },
  filterTextActive: { color: '#fff' },
  list: { paddingHorizontal: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', padding: 14, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  name: { fontSize: 14, fontWeight: '600', color: '#111827' },
  email: { fontSize: 12, color: '#9ca3af' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: '600' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, borderTopWidth: 1, borderTopColor: '#f9fafb', paddingTop: 8 },
  metaText: { fontSize: 12, color: '#9ca3af' },
  emptyBox: { padding: 48, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#9ca3af' },
  paginationRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, paddingVertical: 16 },
  pageBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  pageBtnText: { fontSize: 13, color: '#6b7280' },
  pageInfo: { fontSize: 13, color: '#6b7280' },
});
