import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import PropertyCard from '../../components/PropertyCard';

const CATEGORIES = [
  { name: 'Tiny Homes', icon: 'home-outline' },
  { name: 'Cabins', icon: 'leaf-outline' },
  { name: 'Trending', icon: 'flame-outline' },
  { name: 'Beachfront', icon: 'boat-outline' },
  { name: 'Luxury', icon: 'diamond-outline' },
  { name: 'Castles', icon: 'shield-checkmark-outline' },
];

export default function HomeScreen() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Tiny Homes');

  useEffect(() => {
    fetchListings();
  }, []);

  async function fetchListings() {
    try {
      setLoading(true);
      // Fetching from 'listings' table. 
      // Ensure your table columns match: location, price, rating, image_url
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setListings(data);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  }

  // Header Search Bar Component
  const RenderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#FF385C" />
        <View>
          <Text style={styles.searchTitle}>Where to?</Text>
          <Text style={styles.searchSubtitle}>Anywhere • Any week • Add guests</Text>
        </View>
      </TouchableOpacity>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.categoryContainer}
      >
        {CATEGORIES.map((item) => (
          <TouchableOpacity 
            key={item.name} 
            onPress={() => setActiveCategory(item.name)}
            style={[
              styles.categoryItem, 
              activeCategory === item.name && styles.categoryItemActive
            ]}
          >
            <Ionicons 
              name={item.icon as any} 
              size={24} 
              color={activeCategory === item.name ? '#000' : '#717171'} 
            />
            <Text style={[
              styles.categoryText, 
              activeCategory === item.name && styles.categoryTextActive
            ]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF385C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ header: () => <RenderHeader /> }} />
      
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <PropertyCard 
            item={{
              location: item.location,
              price: item.price,
              rating: item.rating || "New",
              image: item.image_url,
              dates: "Available now"
            }} 
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No listings found in this area.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    backgroundColor: '#fff',
    paddingTop: 50, // Adjust based on device notch
    paddingBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'white',
    width: '90%',
    padding: 12,
    borderRadius: 30,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#c2c2c2',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 1, height: 1 },
  },
  searchTitle: {
    fontWeight: '700',
    fontSize: 14,
  },
  searchSubtitle: {
    color: '#717171',
    fontSize: 12,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 25,
    alignItems: 'center',
  },
  categoryItem: {
    alignItems: 'center',
    gap: 4,
    paddingBottom: 10,
  },
  categoryItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  categoryText: {
    fontSize: 12,
    color: '#717171',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#000',
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#717171',
    fontSize: 16,
  }
});