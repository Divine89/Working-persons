import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  onPress?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.searchContainer} onPress={onPress}>
      <View style={styles.searchSection}>
        <Ionicons name="search" size={20} color="#000" />
        <View>
          <Text style={styles.locationText}>Location</Text>
          <Text style={styles.subText}>Where are you going?</Text>
        </View>
      </View>

      <View style={styles.separator} />

      <View style={styles.searchSection}>
        <Text style={styles.dateText}>Dates</Text>
        <Text style={styles.subText}>Add when you want to go</Text>
      </View>

      <View style={styles.separator} />

      <View style={styles.searchSection}>
        <Text style={styles.guestsText}>Guests</Text>
        <Text style={styles.subText}>Add guests</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 10,
    marginHorizontal: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    borderColor: '#c2c2c2',
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  locationText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  dateText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  guestsText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  subText: {
    color: '#717171',
    fontSize: 12,
    marginLeft: 5,
  },
  separator: {
    width: 1,
    height: '80%',
    backgroundColor: '#c2c2c2',
    marginHorizontal: 5,
  },
});

export default SearchBar;
