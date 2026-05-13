import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TURKEY_CITIES, getCourthousesByCity } from '../utils/constants';

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
            <TouchableOpacity style={styles.optionItem} onPress={() => { onSelect(''); onClose(); setSearch(''); }}>
              <Text style={[styles.optionText, { color: '#9ca3af' }]}>Tümü</Text>
            </TouchableOpacity>
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

export default function ListingFilters({ city, date, courthouse, onCityChange, onDateChange, onCourthouseChange, onSearch, onClear }) {
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showCourthousePicker, setShowCourthousePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = (event, d) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (d) {
      setSelectedDate(d);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      onDateChange(`${yyyy}-${mm}-${dd}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setShowCityPicker(true)}>
          <Ionicons name="location-outline" size={16} color="#6b7280" />
          <Text style={styles.filterText} numberOfLines={1}>{city || 'Şehir'}</Text>
          <Ionicons name="chevron-down" size={14} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, !city && { opacity: 0.5 }]}
          onPress={() => { if (city) setShowCourthousePicker(true); }}
          disabled={!city}
        >
          <Ionicons name="business-outline" size={16} color="#6b7280" />
          <Text style={styles.filterText} numberOfLines={1}>{courthouse || 'Adliye'}</Text>
          <Ionicons name="chevron-down" size={14} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* Tarih secici */}
      <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
        <Ionicons name="calendar-outline" size={16} color="#6b7280" />
        <Text style={[styles.filterText, !date && { color: '#9ca3af' }]}>{date || 'Tarih seçin'}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <View>
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            locale="tr-TR"
          />
          {Platform.OS === 'ios' && (
            <TouchableOpacity style={styles.dateConfirmBtn} onPress={() => setShowDatePicker(false)}>
              <Text style={styles.dateConfirmText}>Tamam</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.searchBtn} onPress={onSearch}>
          <Ionicons name="search" size={16} color="#fff" />
          <Text style={styles.searchBtnText}>Ara</Text>
        </TouchableOpacity>
        {(city || date || courthouse) ? (
          <TouchableOpacity style={styles.clearBtn} onPress={onClear}>
            <Text style={styles.clearBtnText}>Temizle</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <PickerModal visible={showCityPicker} onClose={() => setShowCityPicker(false)} title="Şehir Seçin" options={TURKEY_CITIES}
        onSelect={(val) => { onCityChange(val); if (val !== city) onCourthouseChange(''); }} />
      <PickerModal visible={showCourthousePicker} onClose={() => setShowCourthousePicker(false)} title="Adliye Seçin"
        options={getCourthousesByCity(city)} onSelect={onCourthouseChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', padding: 16, marginBottom: 16 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  filterBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  filterText: { flex: 1, fontSize: 13, color: '#374151' },
  dateBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  dateConfirmBtn: { alignSelf: 'center', backgroundColor: '#2563eb', paddingHorizontal: 32, paddingVertical: 10, borderRadius: 12, marginBottom: 8 },
  dateConfirmText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  buttonRow: { flexDirection: 'row', gap: 8 },
  searchBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#2563eb', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12 },
  searchBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  clearBtn: { borderWidth: 1, borderColor: '#e5e7eb', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12 },
  clearBtnText: { color: '#6b7280', fontSize: 13, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  searchInput: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#374151', marginBottom: 8 },
  optionItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  optionText: { fontSize: 15, color: '#374151' },
});
