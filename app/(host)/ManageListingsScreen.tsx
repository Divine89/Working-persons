import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import AuthGate from "../../components/AuthGate";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";

interface Listing {
  id: string;
  title: string;
  location: string;
  price: number;
  image_url: string | null;
  category: string;
  description: string;
  amenities: string[];
  created_at: string;
}

export default function ManageListingsScreen() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Edit modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<Listing | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchListings = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setListings(data ?? []);
    } catch (err: any) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchListings();
  };

  // ---- Delete ----
  const handleDelete = (item: Listing) => {
    Alert.alert(
      "Delete Listing",
      `Are you sure you want to delete "${item.title}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("listings")
                .delete()
                .eq("id", item.id)
                .eq("user_id", user?.id);

              if (error) throw error;
              setListings((prev) => prev.filter((l) => l.id !== item.id));
            } catch (err: any) {
              Alert.alert("Error", err.message ?? "Failed to delete listing.");
            }
          },
        },
      ],
    );
  };

  // ---- Edit ----
  const openEditModal = (item: Listing) => {
    setEditItem(item);
    setEditTitle(item.title);
    setEditDescription(item.description ?? "");
    setEditPrice(String(item.price));
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editItem || !user) return;
    if (!editTitle.trim() || !editPrice.trim()) {
      Alert.alert("Validation", "Title and price are required.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("listings")
        .update({
          title: editTitle.trim(),
          description: editDescription.trim(),
          price: parseFloat(editPrice),
        })
        .eq("id", editItem.id)
        .eq("user_id", user.id);

      if (error) throw error;

      setListings((prev) =>
        prev.map((l) =>
          l.id === editItem.id
            ? {
                ...l,
                title: editTitle.trim(),
                description: editDescription.trim(),
                price: parseFloat(editPrice),
              }
            : l,
        ),
      );
      setEditModalVisible(false);
      setEditItem(null);
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Failed to update listing.");
    } finally {
      setSaving(false);
    }
  };

  // ---- Render ----
  const renderItem = ({ item }: { item: Listing }) => (
    <View style={styles.card}>
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.placeholderImage]}>
          <Ionicons name="image-outline" size={36} color="#ccc" />
        </View>
      )}

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.cardLocation} numberOfLines={1}>
          {item.location}
        </Text>
        <Text style={styles.cardPrice}>${item.price}/night</Text>
        <Text style={styles.cardCategory}>{item.category}</Text>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => openEditModal(item)}
        >
          <Ionicons name="create-outline" size={20} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={20} color="#FF385C" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <AuthGate>
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Manage Listings" }} />

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#FF385C" />
          </View>
        ) : (
          <FlatList
            data={listings}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#FF385C"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Ionicons name="home-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>You have no listings yet.</Text>
                <Text style={styles.emptySubtext}>
                  Create your first listing from the Host tab.
                </Text>
              </View>
            }
          />
        )}

        {/* Edit Modal */}
        <Modal
          visible={editModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setEditModalVisible(false)}
        >
          <ScrollView
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Listing</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Listing title"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="Description"
                placeholderTextColor="#999"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Price per Night (USD)</Text>
              <TextInput
                style={styles.input}
                value={editPrice}
                onChangeText={(t) => setEditPrice(t.replace(/[^0-9.]/g, ""))}
                placeholder="99"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
              />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSaveEdit}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </Modal>
      </View>
    </AuthGate>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { padding: 16, paddingBottom: 40 },

  // Card
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#eee",
    overflow: "hidden",
  },
  cardImage: {
    width: 100,
    height: 100,
  },
  placeholderImage: {
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
  },
  cardTitle: { fontSize: 15, fontWeight: "600", color: "#222" },
  cardLocation: { fontSize: 13, color: "#717171", marginTop: 2 },
  cardPrice: { fontSize: 14, fontWeight: "600", color: "#222", marginTop: 4 },
  cardCategory: {
    fontSize: 11,
    color: "#FF385C",
    fontWeight: "500",
    marginTop: 2,
  },
  cardActions: {
    justifyContent: "center",
    paddingHorizontal: 10,
    gap: 12,
  },
  actionBtn: {
    padding: 6,
  },

  // Empty
  emptyWrap: { alignItems: "center", marginTop: 80 },
  emptyText: { fontSize: 17, fontWeight: "600", color: "#333", marginTop: 12 },
  emptySubtext: { fontSize: 14, color: "#717171", marginTop: 4 },

  // Modal
  modalContent: { padding: 24, paddingTop: 16 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: { fontSize: 22, fontWeight: "700" },

  // Form inputs (shared)
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    backgroundColor: "#fafafa",
  },
  textArea: { minHeight: 120 },

  saveBtn: {
    backgroundColor: "#FF385C",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
