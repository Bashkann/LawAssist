import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Alert, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import listingsApi from '../../api/listingsApi';
import ErrorMessage from '../../components/ErrorMessage';
import { TURKEY_CITIES, getCourthousesByCity } from '../../utils/constants';

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
            {filtered.length === 0 && <Text style={styles.noResult}>Sonuç bulunamadı</Text>}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function CreateListingScreen({ navigation }) {
  const [form, setForm] = useState({ title: '', description: '', city: '', courthouse: '', hearing_date: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showCourthousePicker, setShowCourthousePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const update = (key, val) => { setForm(prev => ({ ...prev, [key]: val })); if (error) setError(''); };

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
      setError('Başlık, şehir, adliye ve duruşma tarihi zorunludur.'); return;
    }
    setLoading(true);
    try {
      await listingsApi.create(form);
      Alert.alert('Başarılı', 'İlan oluşturuldu.', [{ text: 'Tamam', onPress: () => navigation.goBack() }]);
    } catch (err) {
      setError(err.response?.data?.message || 'İlan oluşturulamadı.');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yeni İlan Oluştur</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <ErrorMessage message={error} />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Başlık *</Text>
          <TextInput style={styles.input} placeholder="İlan başlığı" placeholderTextColor="#9ca3af" value={form.title} onChangeText={(t) => update('title', t)} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Açıklama</Text>
          <TextInput style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]} placeholder="Detaylı açıklama (opsiyonel)" placeholderTextColor="#9ca3af" value={form.description} onChangeText={(t) => update('description', t)} multiline numberOfLines={3} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Sehir *</Text>
          <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowCityPicker(true)}>
            <Text style={form.city ? styles.pickerText : styles.pickerPlaceholder}>{form.city || 'Şehir seçin'}</Text>
            <Ionicons name="chevron-down" size={16} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Adliye *</Text>
          <TouchableOpacity
            style={[styles.pickerBtn, !form.city && { opacity: 0.5 }]}
            onPress={() => { if (form.city) setShowCourthousePicker(true); }}
            disabled={!form.city}
          >
            <Text style={form.courthouse ? styles.pickerText : styles.pickerPlaceholder}>
              {form.courthouse || (form.city ? 'Adliye seçin' : 'Önce şehir seçin')}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Durusma Tarihi *</Text>
          <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar-outline" size={16} color="#9ca3af" />
            <Text style={form.hearing_date ? styles.pickerText : styles.pickerPlaceholder}>
              {form.hearing_date || 'Tarih seçin'}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <View>
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={new Date()}
              onChange={onDateChange}
              locale="tr-TR"
            />
            {Platform.OS === 'ios' && (
              <TouchableOpacity style={styles.dateConfirmBtn} onPress={() => setShowDatePicker(false)}>
                <Text style={styles.dateConfirmText}>Tamam</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.submitText}>{loading ? 'Oluşturuluyor...' : 'İlan Oluştur'}</Text>
        </TouchableOpacity>

        <PickerModal visible={showCityPicker} onClose={() => setShowCityPicker(false)} title="Şehir Seçin" options={TURKEY_CITIES}
          onSelect={(val) => { update('city', val); update('courthouse', ''); }} />
        <PickerModal visible={showCourthousePicker} onClose={() => setShowCourthousePicker(false)} title="Adliye Seçin"
          options={getCourthousesByCity(form.city)} onSelect={(val) => update('courthouse', val)} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  container: { padding: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#111827', backgroundColor: '#fff' },
  pickerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, backgroundColor: '#fff', gap: 8 },
  pickerText: { fontSize: 14, color: '#111827', flex: 1 },
  pickerPlaceholder: { fontSize: 14, color: '#9ca3af', flex: 1 },
  dateConfirmBtn: { alignSelf: 'center', backgroundColor: '#2563eb', paddingHorizontal: 32, paddingVertical: 10, borderRadius: 12, marginTop: 8, marginBottom: 8 },
  dateConfirmText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  submitBtn: { backgroundColor: '#059669', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  searchInput: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#374151', marginBottom: 8 },
  optionItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  optionText: { fontSize: 15, color: '#374151' },
  noResult: { textAlign: 'center', color: '#9ca3af', paddingVertical: 20 },
});
