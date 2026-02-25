import React, { useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { Stack } from 'expo-router';

// Placeholder for individual step components
const CategoryStep = ({ onNext }) => (
  <View style={styles.stepContainer}>
    <Text style={styles.stepTitle}>Step 1: Property Category</Text>
    <Text>Select your property type here.</Text>
    <Button title="Next" onPress={onNext} />
  </View>
);

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

// ---------------------------------------------------------------------------
// Main Screen (Wizard)
// ---------------------------------------------------------------------------
export default function HostFormScreen() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);

  const handleChange = (field: keyof ListingFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleAmenity = (amenity: string) => {
    setForm((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to create a listing.");
      return;
    }

    setSubmitting(true);
    try {
      const location = [form.address, form.city, form.state, form.country]
        .filter(Boolean)
        .join(", ");

      const { error } = await supabase.from("listings").insert({
        user_id: user.id,
        category: form.category,
        location,
        address: form.address,
        city: form.city,
        state: form.state,
        country: form.country,
        zip_code: form.zipCode,
        image_url: form.imageUrls[0] ?? null,
        images: form.imageUrls,
        title: form.title,
        description: form.description,
        amenities: form.amenities,
        price: parseFloat(form.price),
      });

      if (error) throw error;

      Alert.alert("Success", "Your listing has been published!", [
        {
          text: "OK",
          onPress: () => {
            setForm(INITIAL_FORM);
            setStep(1);
            router.replace("/(tabs)");
          },
        },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Failed to create listing.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <CategoryStep onNext={handleNext} />;
      case 2:
        return <LocationStep onNext={handleNext} onBack={handleBack} />;
      case 3:
        return (
          <ImageUploadStep
            imageUrls={form.imageUrls}
            onImagesChange={(urls) =>
              setForm((p) => ({ ...p, imageUrls: urls }))
            }
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        );
      case 4:
        return (
          <DetailsStep
            form={form}
            onChange={handleChange}
            onToggleAmenity={handleToggleAmenity}
            onBack={() => setStep(3)}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        );
      default:
        return <CategoryStep onNext={handleNext} />;
    }
  };

  return (
    <AuthGate>
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Become a Host" }} />
        <StepIndicator current={step} total={TOTAL_STEPS} />
        {renderStep()}
      </View>
    </AuthGate>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  stepScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 6,
    color: "#222",
  },
  stepSubtitle: {
    fontSize: 14,
    color: "#717171",
    marginBottom: 24,
    lineHeight: 20,
  },

  // Step Indicator
  indicatorRow: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  indicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  indicatorDotActive: {
    backgroundColor: "#FF385C",
  },
  indicatorDotInactive: {
    backgroundColor: "#ddd",
  },

  // Category grid
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  categoryCard: {
    width: "47%",
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    gap: 8,
  },
  categoryCardActive: {
    borderColor: "#FF385C",
    backgroundColor: "#FFF0F3",
  },
  categoryLabel: {
    fontSize: 14,
    color: "#717171",
    fontWeight: "500",
  },
  categoryLabelActive: {
    color: "#FF385C",
    fontWeight: "600",
  },

  // Inputs
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    backgroundColor: "#fafafa",
  },
  textArea: {
    minHeight: 120,
  },
  row: {
    flexDirection: "row",
  },

  // Suggestions
  suggestionsBox: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    marginTop: 4,
    overflow: "hidden",
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
    gap: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },

  // Images
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  imageThumbWrap: {
    position: "relative",
  },
  imageThumb: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  removeImgBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#fff",
    borderRadius: 11,
  },
  coverBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  coverBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  addImageBtn: {
    width: 100,
    height: 100,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  addImageText: {
    fontSize: 11,
    color: "#717171",
  },

  // Amenities
  amenitiesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  amenityChip: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  amenityChipActive: {
    borderColor: "#FF385C",
    backgroundColor: "#FFF0F3",
  },
  amenityChipText: {
    fontSize: 13,
    color: "#717171",
  },
  amenityChipTextActive: {
    color: "#FF385C",
    fontWeight: "600",
  },

  // Buttons
  primaryBtn: {
    backgroundColor: "#FF385C",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 28,
    alignItems: "center",
    minWidth: 120,
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 28,
    alignItems: "center",
    minWidth: 100,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
});
