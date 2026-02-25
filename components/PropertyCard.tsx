// components/PropertyCard.tsx
import { View, Text, Image, TouchableOpacity } from 'react-native';

export default function PropertyCard({ item }) {
  return (
    <TouchableOpacity className="mb-6 px-4">
      {/* Property Image */}
      <Image 
        source={{ uri: item.image }} 
        className="w-full aspect-[20/19] rounded-2xl" 
        resizeMode="cover"
      />
      
      {/* Text Details */}
      <View className="mt-3 flex-row justify-between items-start">
        <View className="flex-col gap-0.5">
          <Text className="font-bold text-lg text-gray-900">{item.location}</Text>
          <Text className="text-gray-500">Individual Host • {item.distance} km away</Text>
          <Text className="text-gray-500">{item.dates}</Text>
          <Text className="mt-1 font-bold text-gray-900">${item.price} <Text className="font-normal">night</Text></Text>
        </View>
        
        {/* Rating */}
        <View className="flex-row items-center">
          <Text className="text-sm text-gray-700">★ {item.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}