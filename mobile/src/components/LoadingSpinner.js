import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

export default function LoadingSpinner({ text = 'Yükleniyor...', size = 'large' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color="#2563eb" />
      {text ? <Text style={styles.text}>{text}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 48 },
  text: { marginTop: 12, fontSize: 14, color: '#9ca3af' },
});
