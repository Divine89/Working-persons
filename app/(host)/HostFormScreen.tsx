import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Stack, router } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import AuthGate from "../../components/AuthGate";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ListingFormData {
  category: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  imageUrls: string[];
  title: string;
  description: string;
  amenities: string[];
  price: string;
}

const INITIAL_FORM: ListingFormData = {
  category: "",
  address: "",
  city: "",
  state: "",
  country: "",
  zipCode: "",
  imageUrls: [],
  title: "",
  description: "",
  amenities: [],
  price: "",
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const PROPERTY_CATEGORIES = [
  { label: "House", icon: "home-outline" },
  { label: "Apartment", icon: "business-outline" },
  { label: "Cabin", icon: "leaf-outline" },
  { label: "Villa", icon: "sunny-outline" },
  { label: "Tiny Home", icon: "cube-outline" },
  { label: "Beachfront", icon: "boat-outline" },
  { label: "Treehouse", icon: "flower-outline" },
  { label: "Loft", icon: "grid-outline" },
] as const;

const AMENITY_OPTIONS = [
  "WiFi",
  "Kitchen",
  "Free Parking",
  "Pool",
  "Hot Tub",
  "Air Conditioning",
  "Washer",
  "Dryer",
  "TV",
  "Gym",
  "Pet Friendly",
  "Smoke Alarm",
];

// ---------------------------------------------------------------------------
// Step 1 -- Property Category
// ---------------------------------------------------------------------------
function CategoryStep({
  selected,
  onSelect,
  onNext,
}: {
  selected: string;
  onSelect: (cat: string) => void;
  onNext: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.stepScroll}>
      <Text style={styles.stepTitle}>What type of property is this?</Text>
      <Text style={styles.stepSubtitle}>
        Pick the category that best describes your space.
      </Text>

      <View style={styles.categoryGrid}>
        {PROPERTY_CATEGORIES.map((cat) => {
          const isActive = selected === cat.label;
          return (
            <TouchableOpacity
              key={cat.label}
              style={[
                styles.categoryCard,
                isActive && styles.categoryCardActive,
              ]}
              onPress={() => onSelect(cat.label)}
            >
              <Ionicons
                name={cat.icon as any}
                size={32}
                color={isActive ? "#FF385C" : "#717171"}
              />
              <Text
                style={[
                  styles.categoryLabel,
                  isActive && styles.categoryLabelActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.primaryBtn, !selected && styles.primaryBtnDisabled]}
        onPress={onNext}
        disabled={!selected}
      >
        <Text style={styles.primaryBtnText}>Next</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Step 2 -- Location (address autocomplete-style)
// ---------------------------------------------------------------------------
function LocationStep({
  form,
  onChange,
  onNext,
  onBack,
}: {
  form: ListingFormData;
  onChange: (field: keyof ListingFormData, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);

  // Simulated autocomplete -- in production swap with Google Places or Mapbox
  const handleAddressChange = useCallback(
    (text: string) => {
      onChange("address", text);

      if (text.length < 3) {
        setSuggestions([]);
        return;
      }

      setSearching(true);
      // Simulated delay to mimic an API call
      const timer = setTimeout(() => {
        setSuggestions([
          `${text}, Downtown District`,
          `${text}, Lakeside Area`,
          `${text}, Hillcrest Neighborhood`,
        ]);
        setSearching(false);
      }, 400);

      return () => clearTimeout(timer);
    },
    [onChange],
  );

  const pickSuggestion = (s: string) => {
    onChange("address", s);
    setSuggestions([]);
  };

  const isValid =
    form.address.trim() && form.city.trim() && form.country.trim();

  return (
    <ScrollView
      contentContainerStyle={styles.stepScroll}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.stepTitle}>Where is your property located?</Text>
      <Text style={styles.stepSubtitle}>
        Start typing an address and pick from suggestions, then fill in the
        details.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Street Address</Text>
        <TextInput
          style={styles.input}
          placeholder="123 Main Street"
          placeholderTextColor="#999"
          value={form.address}
          onChangeText={handleAddressChange}
        />
        {searching && (
          <ActivityIndicator
            size="small"
            color="#FF385C"
            style={{ marginTop: 4 }}
          />
        )}
        {suggestions.length > 0 && (
          <View style={styles.suggestionsBox}>
            {suggestions.map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.suggestionRow}
                onPress={() => pickSuggestion(s)}
              >
                <Ionicons name="location-outline" size={16} color="#717171" />
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            placeholder="City"
            placeholderTextColor="#999"
            value={form.city}
            onChangeText={(t) => onChange("city", t)}
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>State / Province</Text>
          <TextInput
            style={styles.input}
            placeholder="State"
            placeholderTextColor="#999"
            value={form.state}
            onChangeText={(t) => onChange("state", t)}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Country</Text>
          <TextInput
            style={styles.input}
            placeholder="Country"
            placeholderTextColor="#999"
            value={form.country}
            onChangeText={(t) => onChange("country", t)}
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>ZIP / Postal Code</Text>
          <TextInput
            style={styles.input}
            placeholder="ZIP"
            placeholderTextColor="#999"
            value={form.zipCode}
            onChangeText={(t) => onChange("zipCode", t)}
          />
        </View>
      </View>

      <View style={styles.navRow}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={onBack}>
          <Text style={styles.secondaryBtnText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryBtn, !isValid && styles.primaryBtnDisabled]}
          onPress={onNext}
          disabled={!isValid}
        >
          <Text style={styles.primaryBtnText}>Next</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Step 3 -- Image Upload
// ---------------------------------------------------------------------------
function ImageUploadStep({
  imageUrls,
  onImagesChange,
  onNext,
  onBack,
}: {
  imageUrls: string[];
  onImagesChange: (urls: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [uploading, setUploading] = useState(false);

  const pickAndUpload = async () => {
    try {
      const permResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permResult.granted) {
        Alert.alert(
          "Permission required",
          "Please allow photo library access to upload images.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5,
      });

      if (result.canceled || !result.assets?.length) return;

      setUploading(true);
      const newUrls: string[] = [];

      for (const asset of result.assets) {
        const ext = asset.uri.split(".").pop() ?? "jpg";
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const filePath = `listings/${fileName}`;

        // Read the file as a blob for upload
        const response = await fetch(asset.uri);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from("listing-images")
          .upload(filePath, blob, {
            contentType: asset.mimeType ?? `image/${ext}`,
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          Alert.alert("Upload failed", uploadError.message);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from("listing-images")
          .getPublicUrl(filePath);

        if (urlData?.publicUrl) {
          newUrls.push(urlData.publicUrl);
        }
      }

      onImagesChange([...imageUrls, ...newUrls]);
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Failed to upload images.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const updated = imageUrls.filter((_, i) => i !== index);
    onImagesChange(updated);
  };

  return (
    <ScrollView contentContainerStyle={styles.stepScroll}>
      <Text style={styles.stepTitle}>Show off your property</Text>
      <Text style={styles.stepSubtitle}>
        Upload up to 5 photos. The first image will be the cover photo.
      </Text>

      <View style={styles.imageGrid}>
        {imageUrls.map((url, idx) => (
          <View key={url} style={styles.imageThumbWrap}>
            <Image source={{ uri: url }} style={styles.imageThumb} />
            <TouchableOpacity
              style={styles.removeImgBtn}
              onPress={() => removeImage(idx)}
            >
              <Ionicons name="close-circle" size={22} color="#FF385C" />
            </TouchableOpacity>
            {idx === 0 && (
              <View style={styles.coverBadge}>
                <Text style={styles.coverBadgeText}>Cover</Text>
              </View>
            )}
          </View>
        ))}

        {imageUrls.length < 5 && (
          <TouchableOpacity
            style={styles.addImageBtn}
            onPress={pickAndUpload}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#FF385C" />
            ) : (
              <>
                <Ionicons name="camera-outline" size={32} color="#717171" />
                <Text style={styles.addImageText}>Add Photos</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.navRow}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={onBack}>
          <Text style={styles.secondaryBtnText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.primaryBtn,
            imageUrls.length === 0 && styles.primaryBtnDisabled,
          ]}
          onPress={onNext}
          disabled={imageUrls.length === 0}
        >
          <Text style={styles.primaryBtnText}>Next</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Step 4 -- Details, Amenities, Price
// ---------------------------------------------------------------------------
function DetailsStep({
  form,
  onChange,
  onToggleAmenity,
  onBack,
  onSubmit,
  submitting,
}: {
  form: ListingFormData;
  onChange: (field: keyof ListingFormData, value: string) => void;
  onToggleAmenity: (amenity: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const isValid =
    form.title.trim() && form.description.trim() && parseFloat(form.price) > 0;

  return (
    <ScrollView
      contentContainerStyle={styles.stepScroll}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.stepTitle}>Describe your listing</Text>
      <Text style={styles.stepSubtitle}>
        Add a catchy title, description, amenities, and a nightly price.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Listing Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Cozy lakeside cabin"
          placeholderTextColor="#999"
          value={form.title}
          onChangeText={(t) => onChange("title", t)}
          maxLength={80}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Tell guests what makes your place special..."
          placeholderTextColor="#999"
          value={form.description}
          onChangeText={(t) => onChange("description", t)}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Amenities</Text>
        <View style={styles.amenitiesWrap}>
          {AMENITY_OPTIONS.map((a) => {
            const active = form.amenities.includes(a);
            return (
              <TouchableOpacity
                key={a}
                style={[styles.amenityChip, active && styles.amenityChipActive]}
                onPress={() => onToggleAmenity(a)}
              >
                <Text
                  style={[
                    styles.amenityChipText,
                    active && styles.amenityChipTextActive,
                  ]}
                >
                  {a}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Price per Night (USD)</Text>
        <TextInput
          style={styles.input}
          placeholder="99"
          placeholderTextColor="#999"
          value={form.price}
          onChangeText={(t) => onChange("price", t.replace(/[^0-9.]/g, ""))}
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.navRow}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={onBack}>
          <Text style={styles.secondaryBtnText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.primaryBtn,
            (!isValid || submitting) && styles.primaryBtnDisabled,
          ]}
          onPress={onSubmit}
          disabled={!isValid || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryBtnText}>Submit Listing</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Progress Indicator
// ---------------------------------------------------------------------------
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.indicatorRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.indicatorDot,
            i + 1 <= current
              ? styles.indicatorDotActive
              : styles.indicatorDotInactive,
          ]}
        />
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Screen (Wizard)
// ---------------------------------------------------------------------------
export default function HostFormScreen() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ListingFormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const TOTAL_STEPS = 4;

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
        return (
          <CategoryStep
            selected={form.category}
            onSelect={(cat) => handleChange("category", cat)}
            onNext={() => setStep(2)}
          />
        );
      case 2:
        return (
          <LocationStep
            form={form}
            onChange={handleChange}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        );
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
        return null;
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
