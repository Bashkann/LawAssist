import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import ListingCard from '../../components/ListingCard';
import ListingFilters from '../../components/ListingFilters';
import LoadingSpinner from '../../components/LoadingSpinner';
import listingsApi from '../../api/listingsApi';

export default function ListingsScreen() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const [courthouse, setCourthouse] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = {};
      if (city) params.city = city;
      if (date) params.date = date;
      if (courthouse) params.courthouse = courthouse;
      const res = await listingsApi.getAll(params);
      setListings(res.data.data || []);
      setSearched(true);
    } catch (err) { setListings([]); }
    finally { setLoading(false); }
  };

  const handleClear = () => {
    setCity(''); setDate(''); setCourthouse('');
    setListings([]); setSearched(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Tevkil İlanları</Text>
        <Text style={styles.subtitle}>Filtre kullanarak size uygun ilanları bulun</Text>
      </View>
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ListingCard listing={item} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <ListingFilters city={city} date={date} courthouse={courthouse}
            onCityChange={setCity} onDateChange={setDate} onCourthouseChange={setCourthouse}
            onSearch={handleSearch} onClear={handleClear} />
        }
        ListEmptyComponent={
          loading ? <LoadingSpinner text="İlanlar yükleniyor..." /> :
          searched ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>İlan Bulunamadı</Text>
              <Text style={styles.emptyText}>Filtreleri değiştirerek tekrar arayabilirsiniz.</Text>
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Arama Yapın</Text>
              <Text style={styles.emptyText}>Yukarıdaki filtreleri kullanarak ilanları arayın.</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  list: { padding: 16, paddingTop: 8 },
  emptyBox: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', padding: 48, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  emptyText: { fontSize: 13, color: '#9ca3af', textAlign: 'center' },
});
