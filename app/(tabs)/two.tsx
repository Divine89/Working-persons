import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

export default function WishlistScreen() {
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlists();
  }, []);

  async function fetchWishlists() {
    try {
      setLoading(true);
      // Logic: Fetching folders/collections of saved properties
      const { data, error } = await supabase
        .from('wishlists')
        .select('*, listings(image_url)') // Assuming a relation exists
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWishlists(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const renderWishlistItem = ({ item, index }: { item: any, index: number }) => {
    // We alternate heights to create a "Masonry/Bento" effect
    const isLarge = index % 3 === 0; 

    return (
      <TouchableOpacity 
        style={[styles.gridItem, { height: isLarge ? 280 : 220 }]}
        activeOpacity={0.8}
      >
        <Image 
          source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688' }} 
          style={styles.gridImage} 
        />
        <View style={styles.overlay}>
          <Text style={styles.gridTitle}>{item.name || 'Summer 2026'}</Text>
          <Text style={styles.gridSub}>{item.count || 0} saved</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF385C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerTitle: 'Wishlists',
        headerLargeTitle: true,
        headerTransparent: false,
        headerShadowVisible: false,
        headerRight: () => (
          <TouchableOpacity style={{ marginRight: 15 }}>
            <Text style={{ color: '#FF385C', fontWeight: '600' }}>Edit</Text>
          </TouchableOpacity>
        ),
      }} />

      <FlatList
        data={wishlists.length > 0 ? wishlists : [1, 2, 3, 4]} // Placeholder data if DB is empty
        renderItem={renderWishlistItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
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
  listPadding: {
    padding: 12,
  },
  gridItem: {
    flex: 1,
    margin: 8,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
    padding: 15,
  },
  gridTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  gridSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
});