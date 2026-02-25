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
import { Home, Leaf, Flame, Ship, Diamond, ShieldCheck } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import PropertyCard from '../../components/PropertyCard';
import SearchBar from '../../components/SearchBar'; // Import the new SearchBar component

const CATEGORIES = [
  { name: 'Tiny Homes', icon: 'Home' },
  { name: 'Cabins', icon: 'Leaf' },
  { name: 'Trending', icon: 'Flame' },
  { name: 'Beachfront', icon: 'Ship' },
  { name: 'Luxury', icon: 'Diamond' },
  { name: 'Castles', icon: 'ShieldCheck' },
];

const iconMap = {
  Home: Home,
  Leaf: Leaf,
  Flame: Flame,
  Ship: Ship,
  Diamond: Diamond,
  ShieldCheck: ShieldCheck,
};

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
      <SearchBar /> {/* Use the new SearchBar component */}
      
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
            {React.createElement(iconMap[item.icon as keyof typeof iconMap], {
              size: 24,
              color: activeCategory === item.name ? '#000' : '#717171',
            })}
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
    paddingTop: 80, // Adjust based on device notch and for the floating search bar
    paddingBottom: 10,
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
    borderBottomWidth: 4,
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