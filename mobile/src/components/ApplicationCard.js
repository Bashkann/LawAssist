import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APPLICATION_STATUS } from '../utils/constants';
import { formatDate } from '../utils/formatDate';

export function StatusBadge({ status }) {
  const s = APPLICATION_STATUS[status];
  if (!s) return null;
  return (
    <View style={[styles.badge, { backgroundColor: s.bg, borderColor: s.border }]}>
      <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
    </View>
  );
}

export default function ApplicationCard({ application, onApprove, onReject, onCancel, showActions = true }) {
  const app = application;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        {app.listing_title || app.listing?.title ? (
          <View style={styles.listingBadge}>
            <Text style={styles.listingBadgeText} numberOfLines={1}>
              {app.listing_title || app.listing?.title || 'İlan'}
            </Text>
          </View>
        ) : null}
        <StatusBadge status={app.status} />
      </View>

      {/* Başvuran bilgisi (gelen başvurularda) */}
      {app.applicant && (
        <View style={styles.applicantRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {app.applicant.first_name?.[0]}{app.applicant.last_name?.[0]}
            </Text>
          </View>
          <View>
            <Text style={styles.applicantName}>{app.applicant.first_name} {app.applicant.last_name}</Text>
            <Text style={styles.applicantInfo}>{app.applicant.bar_association} — {app.applicant.bar_number}</Text>
          </View>
        </View>
      )}

      {/* İlan sahibi (yapılan başvurularda) */}
      {app.owner_first_name && (
        <Text style={styles.ownerText}>İlan sahibi: {app.owner_first_name} {app.owner_last_name}</Text>
      )}

      {app.note ? <Text style={styles.note}>"{app.note}"</Text> : null}

      <View style={styles.metaRow}>
        {(app.listing_city || app.listing?.city) && (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={13} color="#9ca3af" />
            <Text style={styles.metaText}>{app.listing_city || app.listing?.city}</Text>
          </View>
        )}
        {(app.listing_hearing_date || app.listing?.hearing_date) && (
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={13} color="#9ca3af" />
            <Text style={styles.metaText}>{formatDate(app.listing_hearing_date || app.listing?.hearing_date)}</Text>
          </View>
        )}
        <Text style={styles.metaText}>Başvuru: {formatDate(app.created_at)}</Text>
      </View>

      {/* Aksiyonlar */}
      {showActions && app.status === 'pending' && (
        <View style={styles.actions}>
          {onApprove && (
            <TouchableOpacity style={styles.approveBtn} onPress={() => onApprove(app)}>
              <Text style={styles.approveBtnText}>Onayla</Text>
            </TouchableOpacity>
          )}
          {onReject && (
            <TouchableOpacity style={styles.rejectBtn} onPress={() => onReject(app)}>
              <Text style={styles.rejectBtnText}>Reddet</Text>
            </TouchableOpacity>
          )}
          {onCancel && (
            <TouchableOpacity style={styles.rejectBtn} onPress={() => onCancel(app)}>
              <Text style={styles.rejectBtnText}>İptal Et</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', padding: 16, marginBottom: 12 },
  topRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  listingBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, borderWidth: 1, borderColor: '#bfdbfe', maxWidth: '70%' },
  listingBadgeText: { fontSize: 11, fontWeight: '500', color: '#2563eb' },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  applicantRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 10, fontWeight: '700', color: '#6b7280' },
  applicantName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  applicantInfo: { fontSize: 11, color: '#9ca3af' },
  ownerText: { fontSize: 13, fontWeight: '600', color: '#111827', marginBottom: 4 },
  note: { fontSize: 13, color: '#6b7280', fontStyle: 'italic', marginVertical: 4 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 11, color: '#9ca3af' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12 },
  approveBtn: { backgroundColor: '#059669', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12 },
  approveBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  rejectBtn: { borderWidth: 1, borderColor: '#fecaca', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12 },
  rejectBtnText: { color: '#dc2626', fontSize: 12, fontWeight: '600' },
});
