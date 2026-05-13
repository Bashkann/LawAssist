import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, Alert, TextInput, Modal, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import lawyersApi from '../../api/lawyersApi';
import listingsApi from '../../api/listingsApi';
import applicationsApi from '../../api/applicationsApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { StatusBadge } from '../../components/ApplicationCard';
import { formatDate } from '../../utils/formatDate';
import { LISTING_STATUS, TURKEY_CITIES, getCourthousesByCity } from '../../utils/constants';

// ---- Şehir/Adliye picker modal ----
function PickerModal({ visible, onClose, title, options, onSelect }) {
  const [search, setSearch] = useState('');
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={() => { onClose(); setSearch(''); }}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <TextInput style={styles.searchInput} placeholder="Ara..." placeholderTextColor="#9ca3af" value={search} onChangeText={setSearch} />
          <ScrollView style={{ maxHeight: 400 }} keyboardShouldPersistTaps="handled">
            {filtered.map(option => (
              <TouchableOpacity key={option} style={styles.optionItem} onPress={() => { onSelect(option); onClose(); setSearch(''); }}>
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ---- Düzenle Modal ----
function EditListingModal({ visible, listing, onClose, onUpdated }) {
  const [form, setForm] = useState({ title: '', description: '', city: '', courthouse: '', hearing_date: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showCourthousePicker, setShowCourthousePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (listing) {
      setForm({
        title: listing.title || '',
        description: listing.description || '',
        city: listing.city || '',
        courthouse: listing.courthouse || '',
        hearing_date: listing.hearing_date ? listing.hearing_date.split('T')[0] : '',
      });
      if (listing.hearing_date) setSelectedDate(new Date(listing.hearing_date));
    }
  }, [listing]);

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const onDateChange = (event, date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      update('hearing_date', `${yyyy}-${mm}-${dd}`);
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.city || !form.courthouse || !form.hearing_date) {
      setError('Başlık, şehir, adliye ve tarih zorunludur.'); return;
    }
    setLoading(true); setError('');
    try {
      await listingsApi.update(listing.id, form);
      Alert.alert('Başarılı', 'İlan güncellendi.');
      onUpdated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Güncelleme başarısız.');
    } finally { setLoading(false); }
  };

  if (!listing) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '85%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>İlanı Düzenle</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#6b7280" /></TouchableOpacity>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled">
            <ErrorMessage message={error} />
            <Text style={styles.fieldLabel}>Başlık *</Text>
            <TextInput style={styles.fieldInput} value={form.title} onChangeText={(t) => update('title', t)} />

            <Text style={styles.fieldLabel}>Aciklama</Text>
            <TextInput style={[styles.fieldInput, { minHeight: 60, textAlignVertical: 'top' }]} value={form.description} onChangeText={(t) => update('description', t)} multiline />

            <Text style={styles.fieldLabel}>Sehir *</Text>
            <TouchableOpacity style={styles.fieldPicker} onPress={() => setShowCityPicker(true)}>
              <Text style={styles.fieldPickerText}>{form.city || 'Şehir seçin'}</Text>
              <Ionicons name="chevron-down" size={14} color="#9ca3af" />
            </TouchableOpacity>

            <Text style={styles.fieldLabel}>Adliye *</Text>
            <TouchableOpacity style={[styles.fieldPicker, !form.city && { opacity: 0.5 }]} onPress={() => form.city && setShowCourthousePicker(true)} disabled={!form.city}>
              <Text style={styles.fieldPickerText}>{form.courthouse || 'Adliye seçin'}</Text>
              <Ionicons name="chevron-down" size={14} color="#9ca3af" />
            </TouchableOpacity>

            <Text style={styles.fieldLabel}>Durusma Tarihi *</Text>
            <TouchableOpacity style={styles.fieldPicker} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={14} color="#9ca3af" />
              <Text style={styles.fieldPickerText}>{form.hearing_date || 'Tarih secin'}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <View>
                <DateTimePicker value={selectedDate} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onDateChange} />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity style={styles.dateConfirmBtn} onPress={() => setShowDatePicker(false)}>
                    <Text style={{ color: '#fff', fontWeight: '600' }}>Tamam</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity style={[styles.saveBtn, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
                <Text style={styles.saveBtnText}>{loading ? 'Kaydediliyor...' : 'Kaydet'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelModalBtn} onPress={onClose}>
                <Text style={styles.cancelModalText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <PickerModal visible={showCityPicker} onClose={() => setShowCityPicker(false)} title="Şehir Seçin" options={TURKEY_CITIES}
            onSelect={(val) => { update('city', val); update('courthouse', ''); }} />
          <PickerModal visible={showCourthousePicker} onClose={() => setShowCourthousePicker(false)} title="Adliye Seçin"
            options={getCourthousesByCity(form.city)} onSelect={(val) => update('courthouse', val)} />
        </View>
      </View>
    </Modal>
  );
}

// ---- Ana Ekran ----
export default function MyListingsScreen({ navigation }) {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [applications, setApplications] = useState({});
  const [editListing, setEditListing] = useState(null);

  const fetchListings = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await lawyersApi.getListings(user.id, filter || undefined);
      setListings(res.data.data?.listings || []);
    } catch (err) {
      setError(err.response?.data?.message || 'İlanlar yüklenemedi.');
    } finally { setLoading(false); }
  }, [user?.id, filter]);

  useEffect(() => { fetchListings(); }, [fetchListings]);
  useEffect(() => {
    const unsub = navigation.addListener('focus', fetchListings);
    return unsub;
  }, [navigation, fetchListings]);

  const fetchApplications = async (listingId) => {
    try {
      const res = await listingsApi.getApplications(listingId);
      setApplications(prev => ({ ...prev, [listingId]: res.data.data || [] }));
    } catch {}
  };

  const toggleExpand = (id) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (!applications[id]) fetchApplications(id);
  };

  const handleDelete = (id) => {
    Alert.alert('Emin misiniz?', 'Bu ilanı yayından kaldırmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Kaldır', style: 'destructive', onPress: async () => {
        try { await listingsApi.remove(id); fetchListings(); }
        catch (err) { Alert.alert('Hata', err.response?.data?.message || 'Silme başarısız.'); }
      }},
    ]);
  };

  const handleApprove = (app, listingId) => {
    Alert.alert('Onayla', 'Bu basvuruyu onaylamak istediğinize emin misiniz? İlan kapatılacak.', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Onayla', onPress: async () => {
        try { await applicationsApi.approve(app.id); fetchApplications(listingId); fetchListings(); }
        catch (err) { Alert.alert('Hata', err.response?.data?.message || 'Onaylama başarısız.'); }
      }},
    ]);
  };

  const handleReject = (app, listingId) => {
    Alert.alert('Reddet', 'Bu basvuruyu reddetmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Reddet', style: 'destructive', onPress: async () => {
        try { await applicationsApi.reject(app.id); fetchApplications(listingId); fetchListings(); }
        catch (err) { Alert.alert('Hata', err.response?.data?.message || 'Reddetme başarısız.'); }
      }},
    ]);
  };

  const filters = [
    { key: '', label: 'Tümü' },
    { key: 'active', label: 'Aktif' },
    { key: 'passive', label: 'Pasif' },
    { key: 'cancelled', label: 'İptal' },
  ];

  const renderItem = ({ item }) => {
    const status = LISTING_STATUS[item.status];
    const isExpanded = expandedId === item.id;
    const apps = applications[item.id];

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
              {status && (
                <View style={[styles.badge, { backgroundColor: status.bg, borderColor: status.border }]}>
                  <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
                </View>
              )}
            </View>
            <Text style={styles.cardMeta}>{item.city} — {item.courthouse} — {formatDate(item.hearing_date)}</Text>
            {item.description ? <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text> : null}
          </View>
        </View>

        {/* Aksiyon butonlari */}
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setEditListing(item)}>
            <Ionicons name="create-outline" size={14} color="#2563eb" />
            <Text style={[styles.actionBtnText, { color: '#2563eb' }]}>Düzenle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => toggleExpand(item.id)}>
            <Ionicons name="people-outline" size={14} color="#2563eb" />
            <Text style={[styles.actionBtnText, { color: '#2563eb' }]}>{isExpanded ? 'Gizle' : 'Başvurular'}</Text>
          </TouchableOpacity>
          {item.status === 'active' && (
            <TouchableOpacity style={[styles.actionBtn, { borderColor: '#fecaca' }]} onPress={() => handleDelete(item.id)}>
              <Ionicons name="trash-outline" size={14} color="#dc2626" />
              <Text style={[styles.actionBtnText, { color: '#dc2626' }]}>Kaldır</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Gelen basvurular */}
        {isExpanded && (
          <View style={styles.appsSection}>
            <Text style={styles.appsSectionTitle}>Gelen Başvurular</Text>
            {!apps ? <LoadingSpinner text="" size="small" /> :
              apps.length === 0 ? <Text style={styles.noApps}>Henüz başvuru yok.</Text> :
              apps.map(app => (
                <View key={app.id} style={styles.appCard}>
                  <View style={{ flex: 1 }}>
                    {app.applicant && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <View style={styles.appAvatar}>
                          <Text style={styles.appAvatarText}>{app.applicant.first_name?.[0]}{app.applicant.last_name?.[0]}</Text>
                        </View>
                        <View>
                          <Text style={styles.appName}>{app.applicant.first_name} {app.applicant.last_name}</Text>
                          <Text style={styles.appInfo}>{app.applicant.bar_association} — {app.applicant.bar_number}</Text>
                        </View>
                      </View>
                    )}
                    {app.note ? <Text style={styles.appNote}>"{app.note}"</Text> : null}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <StatusBadge status={app.status} />
                      <Text style={styles.appDate}>{formatDate(app.created_at)}</Text>
                    </View>
                  </View>
                  {app.status === 'pending' && (
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                      <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(app, item.id)}>
                        <Text style={styles.approveBtnText}>Onayla</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(app, item.id)}>
                        <Text style={styles.rejectBtnText}>Reddet</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            }
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>İlanlarım</Text>
          <Text style={styles.subtitle}>Tevkil ilanlarınızı yönetin</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.incomingBtn} onPress={() => navigation.navigate('IncomingApplications')}>
            <Text style={styles.incomingBtnText}>Gelen Başvurular</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate('CreateListing')}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.createBtnText}>Yeni İlan</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterRow}>
        {filters.map(f => (
          <TouchableOpacity key={f.key}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => setFilter(f.key)}>
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ErrorMessage message={error} />

      {loading ? <LoadingSpinner text="İlanlar yükleniyor..." /> : (
        <FlatList data={listings} keyExtractor={(item) => item.id} renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>İlan Bulunamadı</Text>
              <Text style={styles.emptyText}>Henüz bir ilan oluşturmadınız.</Text>
            </View>
          }
        />
      )}

      <EditListingModal visible={!!editListing} listing={editListing} onClose={() => setEditListing(null)} onUpdated={fetchListings} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, flexWrap: 'wrap', gap: 8 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  createBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#2563eb', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12 },
  createBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  incomingBtn: { borderWidth: 1, borderColor: '#bfdbfe', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: '#fff' },
  incomingBtnText: { color: '#2563eb', fontSize: 12, fontWeight: '600' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  filterBtnActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  filterText: { fontSize: 13, fontWeight: '500', color: '#6b7280' },
  filterTextActive: { color: '#fff' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 12, overflow: 'hidden' },
  cardHeader: { padding: 16, paddingBottom: 8 },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#111827' },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  cardMeta: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  cardDesc: { fontSize: 13, color: '#9ca3af' },
  cardActions: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 12, paddingTop: 4 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#bfdbfe' },
  actionBtnText: { fontSize: 12, fontWeight: '500' },
  // Gelen basvurular
  appsSection: { borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#f9fafb' },
  appsSectionTitle: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 10 },
  noApps: { fontSize: 13, color: '#9ca3af' },
  appCard: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6', padding: 12, marginBottom: 8 },
  appAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center' },
  appAvatarText: { fontSize: 10, fontWeight: '700', color: '#6b7280' },
  appName: { fontSize: 13, fontWeight: '600', color: '#111827' },
  appInfo: { fontSize: 11, color: '#9ca3af' },
  appNote: { fontSize: 12, color: '#6b7280', fontStyle: 'italic', marginTop: 4 },
  appDate: { fontSize: 11, color: '#9ca3af' },
  approveBtn: { backgroundColor: '#059669', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 10 },
  approveBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  rejectBtn: { borderWidth: 1, borderColor: '#fecaca', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 10 },
  rejectBtnText: { color: '#dc2626', fontSize: 12, fontWeight: '600' },
  emptyBox: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', padding: 48, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  emptyText: { fontSize: 13, color: '#9ca3af' },
  // Modal ortak
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  searchInput: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#374151', marginBottom: 8 },
  optionItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  optionText: { fontSize: 15, color: '#374151' },
  // Edit modal fields
  fieldLabel: { fontSize: 12, fontWeight: '500', color: '#6b7280', marginBottom: 4, marginTop: 10 },
  fieldInput: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 14, color: '#111827', backgroundColor: '#fff' },
  fieldPicker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff', gap: 6 },
  fieldPickerText: { fontSize: 14, color: '#111827', flex: 1 },
  dateConfirmBtn: { alignSelf: 'center', backgroundColor: '#2563eb', paddingHorizontal: 32, paddingVertical: 8, borderRadius: 10, marginTop: 4, marginBottom: 4 },
  saveBtn: { flex: 1, backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  cancelModalBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  cancelModalText: { color: '#6b7280', fontSize: 14, fontWeight: '500' },
});
