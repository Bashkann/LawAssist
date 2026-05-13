import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../utils/formatDate';
import { LISTING_STATUS } from '../utils/constants';
import listingsApi from '../api/listingsApi';

export default function ListingCard({ listing, onApplied }) {
  const [showApply, setShowApply] = useState(false);
  const [note, setNote] = useState('');
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState('');

  const handleApply = async () => {
    setApplying(true);
    setError('');
    try {
      await listingsApi.apply(listing.id, { note: note || undefined });
      setApplied(true);
      setShowApply(false);
      if (onApplied) onApplied();
    } catch (err) {
      setError(err.response?.data?.message || 'Başvuru yapılamadı.');
    } finally {
      setApplying(false);
    }
  };

  const status = LISTING_STATUS[listing.status];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>{listing.title}</Text>
            {status && (
              <View style={[styles.badge, { backgroundColor: status.bg, borderColor: status.border }]}>
                <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
              </View>
            )}
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={14} color="#9ca3af" />
              <Text style={styles.infoText}>{listing.city}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="business-outline" size={14} color="#9ca3af" />
              <Text style={styles.infoText}>{listing.courthouse}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={14} color="#9ca3af" />
              <Text style={styles.infoText}>{formatDate(listing.hearing_date)}</Text>
            </View>
          </View>
          {listing.description ? (
            <Text style={styles.desc} numberOfLines={2}>{listing.description}</Text>
          ) : null}
          {listing.owner && (
            <View style={styles.ownerRow}>
              <View style={styles.ownerAvatar}>
                <Text style={styles.ownerInitials}>
                  {listing.owner.first_name?.[0]}{listing.owner.last_name?.[0]}
                </Text>
              </View>
              <Text style={styles.ownerName}>
                {listing.owner.first_name} {listing.owner.last_name}
                {listing.owner.bar_association ? ` — ${listing.owner.bar_association}` : ''}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Başvur butonu */}
      <View style={styles.actionRow}>
        {applied ? (
          <View style={styles.appliedBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
            <Text style={styles.appliedText}>Başvuruldu</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.applyBtn} onPress={() => setShowApply(!showApply)}>
            <Text style={styles.applyBtnText}>{showApply ? 'Vazgeç' : 'Başvur'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Başvuru formu */}
      {showApply && !applied && (
        <View style={styles.applyForm}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TextInput
            style={styles.noteInput}
            placeholder="Başvuru notunuz (opsiyonel, max 500 karakter)..."
            placeholderTextColor="#9ca3af"
            value={note}
            onChangeText={setNote}
            maxLength={500}
            multiline
            numberOfLines={3}
          />
          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[styles.sendBtn, applying && { opacity: 0.5 }]}
              onPress={handleApply}
              disabled={applying}
            >
              <Text style={styles.sendBtnText}>{applying ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowApply(false); setError(''); }}>
              <Text style={styles.cancelBtnText}>Vazgeç</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 12, overflow: 'hidden' },
  header: { padding: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  title: { fontSize: 15, fontWeight: '700', color: '#111827', flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: 13, color: '#6b7280' },
  desc: { fontSize: 13, color: '#6b7280', marginBottom: 8, lineHeight: 18 },
  ownerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  ownerAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  ownerInitials: { fontSize: 9, fontWeight: '700', color: '#2563eb' },
  ownerName: { fontSize: 12, color: '#9ca3af' },
  actionRow: { paddingHorizontal: 16, paddingBottom: 12 },
  applyBtn: { backgroundColor: '#2563eb', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12, alignSelf: 'flex-start' },
  applyBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  appliedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f0fdf4', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#bbf7d0', alignSelf: 'flex-start' },
  appliedText: { fontSize: 13, fontWeight: '500', color: '#16a34a' },
  applyForm: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: '#f9fafb', paddingTop: 12 },
  errorText: { color: '#dc2626', fontSize: 13, marginBottom: 8 },
  noteInput: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 14, color: '#111827', minHeight: 80, textAlignVertical: 'top', marginBottom: 12 },
  formButtons: { flexDirection: 'row', gap: 8 },
  sendBtn: { backgroundColor: '#059669', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
  sendBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  cancelBtn: { borderWidth: 1, borderColor: '#e5e7eb', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
  cancelBtnText: { color: '#6b7280', fontSize: 13, fontWeight: '500' },
});
