
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import adminApi from '../../api/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import { LISTING_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatDate';

export default function AdminListingsScreen({ navigation }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => { fetchListings(); }, [filter, page]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getListings({ status: filter, page, limit: 20 });
      setListings(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch {} finally { setLoading(false); }
  };

  const renderItem = ({ item }) => {
    const status = LISTING_STATUS[item.status];
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          {status && (
            <View style={[styles.badge, { backgroundColor: status.bg, borderColor: status.border }]}>
              <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
            </View>
          )}
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={13} color="#9ca3af" />
            <Text style={styles.metaText}>{item.city}</Text>
          </View>
          <Text style={styles.metaText}>{item.courthouse}</Text>
          <Text style={styles.metaText}>{formatDate(item.hearing_date)}</Text>
        </View>
        <Text style={styles.ownerText}>
          İlan sahibi: {item.owner_first_name} {item.owner_last_name}
        </Text>
        {item.description ? <Text style={styles.descText} numberOfLines={2}>{item.description}</Text> : null}
        <TouchableOpacity style={styles.detailLink} onPress={() => navigation.navigate('AdminLawyerDetail', { id: item.owner_id })}>
          <Text style={styles.detailLinkText}>Avukat Detay</Text>
          <Ionicons name="chevron-forward" size={14} color="#2563eb" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.filterRow}>
        {['all', 'active', 'passive', 'cancelled'].map(s => (
          <TouchableOpacity key={s} style={[styles.filterBtn, filter === s && styles.filterBtnActive]}
            onPress={() => { setFilter(s); setPage(1); }}>
            <Text style={[styles.filterText, filter === s && styles.filterTextActive]}>
              {s === 'all' ? 'Tümü' : LISTING_STATUS[s]?.label || s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <LoadingSpinner text="İlanlar yükleniyor..." /> : (
        <FlatList data={listings} keyExtractor={(item) => item.id} renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<View style={styles.emptyBox}><Text style={styles.emptyText}>İlan bulunamadı.</Text></View>}
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
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  cardTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: '#111827' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: '600' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 12, color: '#6b7280' },
  ownerText: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  descText: { fontSize: 12, color: '#9ca3af', marginTop: 4, lineHeight: 16 },
  detailLink: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 8, alignSelf: 'flex-end' },
  detailLinkText: { fontSize: 12, fontWeight: '500', color: '#2563eb' },
  emptyBox: { padding: 48, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#9ca3af' },
  paginationRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, paddingVertical: 16 },
  pageBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  pageBtnText: { fontSize: 13, color: '#6b7280' },
  pageInfo: { fontSize: 13, color: '#6b7280' },
});
