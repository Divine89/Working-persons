import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput } from 'react-native';
import { Stack } from 'expo-router';

// Placeholder for individual step components
interface CategoryStepProps {
  onNext: () => void;
  listingData: any; 
  setListingData: React.Dispatch<React.SetStateAction<any>>;
}

const CategoryStep = ({ onNext, listingData, setListingData }: CategoryStepProps) => {
  const categories = ['House', 'Apartment', 'Condo', 'Villa', 'Cabin'];

  const handleCategorySelect = (category: string) => {
    setListingData((prev: any) => ({ ...prev, category }));
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step 1: Property Category</Text>
      <View>
        {categories.map((category) => (
          <Button
            key={category}
            title={category}
            onPress={() => handleCategorySelect(category)}
            color={listingData.category === category ? 'blue' : 'gray'} 
          />
        ))}
      </View>
      <Button
        title="Next"
        onPress={onNext}
        disabled={!listingData.category}
      />
    </View>
  );
};

const LocationStep = ({ onNext, onBack }) => (
  <View style={styles.stepContainer}>
    <Text style={styles.stepTitle}>Step 2: Location</Text>
    <Text>Enter property location here with autocomplete.</Text>
    <Button title="Back" onPress={onBack} />
    <Button title="Next" onPress={onNext} />
  </View>
);

const ImageUploadStep = ({ onNext, onBack }) => (
  <View style={styles.stepContainer}>
    <Text style={styles.stepTitle}>Step 3: Image Upload</Text>
    <Text>Upload property images here.</Text>
    <Button title="Back" onPress={onBack} />
    <Button title="Next" onPress={onNext} />
  </View>
);

const DetailsStep = ({ onNext, onBack }) => (
  <View style={styles.stepContainer}>
    <Text style={styles.stepTitle}>Step 4: Details & Price</Text>
    <Text>Add description, amenities, and price.</Text>
    <Button title="Back" onPress={onBack} />
    <Button title="Submit Listing" onPress={onNext} />
  </View>
);

export default function HostFormScreen() {
  const [step, setStep] = useState(1);
  const [listingData, setListingData] = useState({
    category: "",
    location: {},
    images: [],
    description: "",
    amenities: [],
    price: 0,
  });

  const handleNext = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = () => {
    // This is where the listing will be inserted into Supabase
    console.log('Submitting listing...');
    alert('Listing Submitted!');
    // Reset form or navigate away
    setStep(1); // For now, reset to first step
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <CategoryStep onNext={handleNext} listingData={listingData} setListingData={setListingData} />;
      case 2:
        return <LocationStep onNext={handleNext} onBack={handleBack} listingData={listingData} setListingData={setListingData} />;
      case 3:
        return <ImageUploadStep onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <DetailsStep onNext={handleSubmit} onBack={handleBack} />;
      default:
        return <CategoryStep onNext={handleNext} listingData={listingData} setListingData={setListingData} />;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Become a Host' }} />
      {renderStep()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
