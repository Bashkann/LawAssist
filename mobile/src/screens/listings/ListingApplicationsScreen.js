import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import listingsApi from '../../api/listingsApi';
import applicationsApi from '../../api/applicationsApi';
import ApplicationCard from '../../components/ApplicationCard';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ListingApplicationsScreen({ navigation, route }) {
  const { listingId, listingTitle } = route.params;
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await listingsApi.getApplications(listingId);
      setApplications(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchApplications(); }, [listingId]);

  const handleApprove = (app) => {
    Alert.alert('Onaylama', 'Bu başvuruyu onaylamak istediğinize emin misiniz? İlan kapatılacak.', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Onayla', onPress: async () => {
        try { await applicationsApi.approve(app.id); fetchApplications(); }
        catch (err) { Alert.alert('Hata', err.response?.data?.message || 'Onaylama başarısız.'); }
      }},
    ]);
  };

  const handleReject = (app) => {
    Alert.alert('Reddetme', 'Bu başvuruyu reddetmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Reddet', style: 'destructive', onPress: async () => {
        try { await applicationsApi.reject(app.id); fetchApplications(); }
        catch (err) { Alert.alert('Hata', err.response?.data?.message || 'Reddetme başarısız.'); }
      }},
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>Gelen Başvurular</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>{listingTitle}</Text>
        </View>
      </View>

      {loading ? <LoadingSpinner text="Başvurular yükleniyor..." /> : (
        <FlatList
          data={applications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ApplicationCard application={item} onApprove={handleApprove} onReject={handleReject} />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Başvuru Yok</Text>
              <Text style={styles.emptyText}>Bu ilana henüz başvuru yapılmamış.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  headerBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  headerSubtitle: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  list: { padding: 16 },
  emptyBox: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', padding: 48, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  emptyText: { fontSize: 13, color: '#9ca3af' },
});
