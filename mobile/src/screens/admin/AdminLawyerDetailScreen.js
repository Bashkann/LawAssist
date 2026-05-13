import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import adminApi from '../../api/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { LAWYER_STATUS, LISTING_STATUS, APPLICATION_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatDate';

export default function AdminLawyerDetailScreen({ route }) {
  const { id } = route.params;
  const [lawyer, setLawyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [suspendDate, setSuspendDate] = useState('');
  const [showSuspendDatePicker, setShowSuspendDatePicker] = useState(false);
  const [selectedSuspendDate, setSelectedSuspendDate] = useState(new Date());
  const [actionLoading, setActionLoading] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => { fetchLawyer(); }, [id]);

  const fetchLawyer = async () => {
    try {
      const res = await adminApi.getLawyerById(id);
      const data = res.data.data;
      setLawyer(data);
      setEditForm({ firstName: data.first_name || '', lastName: data.last_name || '', email: data.email || '', phone: data.phone || '' });
    } catch (err) { setError(err.response?.data?.message || 'Avukat bulunamadı.'); }
    finally { setLoading(false); }
  };

  const handleSuspend = async () => {
    if (!suspendDate) { Alert.alert('Uyarı', 'Askı bitiş tarihi seçin.'); return; }
    setActionLoading('suspend');
    try { await adminApi.suspendLawyer(id, { suspendUntil: suspendDate }); fetchLawyer(); setSuspendDate(''); }
    catch (err) { Alert.alert('Hata', err.response?.data?.message || 'İşlem başarısız.'); }
    finally { setActionLoading(''); }
  };

  const handleDelete = () => {
    Alert.alert('Hesabı Sil', 'Bu avukatın hesabını silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        setActionLoading('delete');
        try { await adminApi.deleteLawyer(id); fetchLawyer(); }
        catch (err) { Alert.alert('Hata', err.response?.data?.message || 'Silme başarısız.'); }
        finally { setActionLoading(''); }
      }},
    ]);
  };

  const handleUpdate = async () => {
    setEditLoading(true); setEditError('');
    try { await adminApi.updateLawyer(id, editForm); setEditOpen(false); fetchLawyer(); }
    catch (err) { setEditError(err.response?.data?.message || 'Güncelleme başarısız.'); }
    finally { setEditLoading(false); }
  };

  if (loading) return <LoadingSpinner text="Yükleniyor..." />;

  const status = LAWYER_STATUS[lawyer?.status];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <ErrorMessage message={error} />
        {lawyer && (
          <>
            {/* Profil kartı */}
            <View style={styles.card}>
              <View style={styles.gradientBar} />
              <View style={styles.profileRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{lawyer.first_name?.[0]}{lawyer.last_name?.[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.name}>{lawyer.first_name} {lawyer.last_name}</Text>
                    {status && <View style={[styles.badge, { backgroundColor: status.bg, borderColor: status.border }]}><Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text></View>}
                  </View>
                  <Text style={styles.email}>{lawyer.email}</Text>
                </View>
              </View>
              <View style={styles.infoGrid}>
                <InfoItem label="Telefon" value={lawyer.phone} />
                <InfoItem label="Baro" value={lawyer.bar_association} />
                <InfoItem label="Sicil No" value={lawyer.bar_number} />
                <InfoItem label="Kayıt" value={formatDate(lawyer.created_at)} />
              </View>
            </View>

            {/* Aksiyonlar */}
            {lawyer.status !== 'deleted' && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Yönetim İşlemleri</Text>
                <View style={styles.suspendRow}>
                  <TouchableOpacity style={styles.dateInput} onPress={() => setShowSuspendDatePicker(true)}>
                    <Ionicons name="calendar-outline" size={14} color="#9ca3af" />
                    <Text style={{ flex: 1, fontSize: 13, color: suspendDate ? '#111827' : '#9ca3af' }}>
                      {suspendDate || 'Askı bitiş tarihi seçin'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.suspendBtn} onPress={handleSuspend} disabled={actionLoading === 'suspend'}>
                    <Text style={styles.suspendBtnText}>{actionLoading === 'suspend' ? '...' : 'Askıya Al'}</Text>
                  </TouchableOpacity>
                </View>
                {showSuspendDatePicker && (
                  <View style={{ paddingHorizontal: 16 }}>
                    <DateTimePicker
                      value={selectedSuspendDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      minimumDate={new Date()}
                      onChange={(event, date) => {
                        if (Platform.OS === 'android') setShowSuspendDatePicker(false);
                        if (date) {
                          setSelectedSuspendDate(date);
                          const yyyy = date.getFullYear();
                          const mm = String(date.getMonth() + 1).padStart(2, '0');
                          const dd = String(date.getDate()).padStart(2, '0');
                          setSuspendDate(`${yyyy}-${mm}-${dd}`);
                        }
                      }}
                    />
                    {Platform.OS === 'ios' && (
                      <TouchableOpacity style={{ alignSelf: 'center', backgroundColor: '#2563eb', paddingHorizontal: 32, paddingVertical: 8, borderRadius: 10, marginBottom: 8 }}
                        onPress={() => setShowSuspendDatePicker(false)}>
                        <Text style={{ color: '#fff', fontWeight: '600' }}>Tamam</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.editActionBtn} onPress={() => setEditOpen(true)}>
                    <Text style={styles.editActionText}>Düzenle</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteActionBtn} onPress={handleDelete} disabled={actionLoading === 'delete'}>
                    <Text style={styles.deleteActionText}>{actionLoading === 'delete' ? '...' : 'Hesabı Sil'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* İlanları */}
            {lawyer.listings?.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>İlanları ({lawyer.listings.length})</Text>
                {lawyer.listings.map(l => {
                  const ls = LISTING_STATUS[l.status];
                  return (
                    <View key={l.id} style={styles.listItem}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.listItemTitle} numberOfLines={1}>{l.title}</Text>
                        <Text style={styles.listItemMeta}>{l.city} — {formatDate(l.hearing_date)}</Text>
                      </View>
                      {ls && <View style={[styles.badge, { backgroundColor: ls.bg, borderColor: ls.border }]}><Text style={[styles.badgeText, { color: ls.color }]}>{ls.label}</Text></View>}
                    </View>
                  );
                })}
              </View>
            )}

            {/* Başvuruları */}
            {lawyer.applications?.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Başvuruları ({lawyer.applications.length})</Text>
                {lawyer.applications.map(a => {
                  const as2 = APPLICATION_STATUS[a.status];
                  return (
                    <View key={a.id} style={styles.listItem}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.listItemTitle} numberOfLines={1}>{a.listing_title}</Text>
                        <Text style={styles.listItemMeta}>{a.listing_city} — {formatDate(a.listing_hearing_date)}</Text>
                      </View>
                      {as2 && <View style={[styles.badge, { backgroundColor: as2.bg, borderColor: as2.border }]}><Text style={[styles.badgeText, { color: as2.color }]}>{as2.label}</Text></View>}
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Avukat Bilgilerini Düzenle</Text>
            <ErrorMessage message={editError} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}><Text style={styles.inputLabel}>Ad</Text><TextInput style={styles.modalInput} value={editForm.firstName} onChangeText={t => setEditForm({...editForm, firstName: t})} /></View>
              <View style={{ flex: 1 }}><Text style={styles.inputLabel}>Soyad</Text><TextInput style={styles.modalInput} value={editForm.lastName} onChangeText={t => setEditForm({...editForm, lastName: t})} /></View>
            </View>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput style={styles.modalInput} value={editForm.email} onChangeText={t => setEditForm({...editForm, email: t})} keyboardType="email-address" />
            <Text style={styles.inputLabel}>Telefon</Text>
            <TextInput style={styles.modalInput} value={editForm.phone} onChangeText={t => setEditForm({...editForm, phone: t})} keyboardType="phone-pad" />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <TouchableOpacity style={[styles.saveModalBtn, editLoading && { opacity: 0.6 }]} onPress={handleUpdate} disabled={editLoading}>
                <Text style={styles.saveModalText}>{editLoading ? 'Kaydediliyor...' : 'Kaydet'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelModalBtn} onPress={() => { setEditOpen(false); setEditError(''); }}>
                <Text style={styles.cancelModalText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function InfoItem({ label, value }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  container: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 12, overflow: 'hidden' },
  gradientBar: { height: 40, backgroundColor: '#2563eb' },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, marginTop: -16 },
  avatar: { width: 52, height: 52, borderRadius: 14, backgroundColor: '#1e40af', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  name: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 8 },
  email: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: '600' },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6', marginTop: 12 },
  infoItem: { width: '50%', marginBottom: 10 },
  infoLabel: { fontSize: 11, color: '#9ca3af' },
  infoValue: { fontSize: 13, fontWeight: '500', color: '#111827', marginTop: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', padding: 16, paddingBottom: 8 },
  suspendRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 10 },
  dateInput: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  suspendBtn: { backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fde68a', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  suspendBtnText: { fontSize: 13, fontWeight: '600', color: '#d97706' },
  actionRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 16 },
  editActionBtn: { backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  editActionText: { fontSize: 13, fontWeight: '600', color: '#2563eb' },
  deleteActionBtn: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  deleteActionText: { fontSize: 13, fontWeight: '600', color: '#dc2626' },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#f9fafb' },
  listItemTitle: { fontSize: 13, fontWeight: '600', color: '#111827' },
  listItemMeta: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: '500', color: '#6b7280', marginBottom: 4, marginTop: 8 },
  modalInput: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 14, color: '#111827' },
  saveModalBtn: { flex: 1, backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  saveModalText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  cancelModalBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  cancelModalText: { color: '#6b7280', fontSize: 14, fontWeight: '500' },
});
