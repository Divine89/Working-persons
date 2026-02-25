import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import AuthGate from "../../components/AuthGate";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";

/**
 * Stripe Checkout Integration Template
 *
 * Flow overview:
 * 1. Guest selects a listing and navigates here with listing details.
 * 2. This screen shows a booking summary (listing info, dates, price).
 * 3. On "Pay Now", the app calls a Supabase Edge Function (or your own API)
 *    that creates a Stripe Checkout Session on the server side.
 * 4. The returned session URL is opened in a web browser (or Stripe SDK sheet).
 * 5. After payment, Stripe redirects to a success/cancel URL, and a webhook
 *    on your server confirms the payment and creates the booking record.
 *
 * IMPORTANT: Never handle raw card data on the client. Always use Stripe's
 * hosted Checkout or the Stripe SDK payment sheet for PCI compliance.
 *
 * Prerequisites:
 * - A Supabase Edge Function (or Express/Next.js API route) at
 *   `/functions/v1/create-checkout-session` that calls Stripe's API.
 * - STRIPE_SECRET_KEY set as a secret in your backend environment.
 * - A `bookings` table in Supabase to record confirmed payments.
 */

// ---- Server-side Edge Function template (for reference) --------------------
// Deploy this as a Supabase Edge Function or an API route on your backend.
//
// // supabase/functions/create-checkout-session/index.ts
// import { serve } from 'https://deno.land/std/http/server.ts';
// import Stripe from 'https://esm.sh/stripe@13?target=deno';
//
// const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' });
//
// serve(async (req) => {
//   const { listingId, listingTitle, priceInCents, nights, userId } = await req.json();
//
//   const session = await stripe.checkout.sessions.create({
//     payment_method_types: ['card'],
//     line_items: [{
//       price_data: {
//         currency: 'usd',
//         product_data: { name: listingTitle },
//         unit_amount: priceInCents,
//       },
//       quantity: nights,
//     }],
//     mode: 'payment',
//     success_url: 'https://yourapp.com/booking-success?session_id={CHECKOUT_SESSION_ID}',
//     cancel_url: 'https://yourapp.com/booking-cancelled',
//     metadata: { listingId, userId },
//   });
//
//   return new Response(JSON.stringify({ url: session.url }), {
//     headers: { 'Content-Type': 'application/json' },
//   });
// });
// ---------------------------------------------------------------------------

interface BookingParams {
  listingId?: string;
  listingTitle?: string;
  listingImage?: string;
  listingLocation?: string;
  pricePerNight?: string;
  nights?: string;
}

export default function CheckoutScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams() as unknown as BookingParams;
  const [processing, setProcessing] = useState(false);

  const pricePerNight = parseFloat(params.pricePerNight ?? "0");
  const nights = parseInt(params.nights ?? "1", 10);
  const subtotal = pricePerNight * nights;
  const serviceFee = Math.round(subtotal * 0.12 * 100) / 100; // 12% service fee
  const total = subtotal + serviceFee;

  const handleCheckout = async () => {
    if (!user) {
      Alert.alert("Error", "You must be signed in to book.");
      return;
    }

    setProcessing(true);
    try {
      // Call your backend to create a Stripe Checkout session
      const { data, error } = await supabase.functions.invoke(
        "create-checkout-session",
        {
          body: {
            listingId: params.listingId,
            listingTitle: params.listingTitle ?? "Booking",
            priceInCents: Math.round(total * 100),
            nights,
            userId: user.id,
          },
        },
      );

      if (error) throw error;

      if (data?.url) {
        // Open the Stripe Checkout page in the device browser
        // In production, use expo-web-browser or @stripe/stripe-react-native
        const { openBrowserAsync } = await import("expo-web-browser");
        await openBrowserAsync(data.url);
      } else {
        Alert.alert("Error", "No checkout URL returned from the server.");
      }
    } catch (err: any) {
      Alert.alert(
        "Checkout Error",
        err.message ??
          "Could not start the checkout process. Make sure the backend is configured.",
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AuthGate>
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Confirm & Pay" }} />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Listing Summary */}
          <View style={styles.summaryCard}>
            {params.listingImage ? (
              <Image
                source={{ uri: params.listingImage }}
                style={styles.listingImage}
              />
            ) : (
              <View style={[styles.listingImage, styles.imagePlaceholder]}>
                <Ionicons name="image-outline" size={32} color="#ccc" />
              </View>
            )}
            <View style={styles.summaryDetails}>
              <Text style={styles.listingTitle} numberOfLines={2}>
                {params.listingTitle ?? "Property"}
              </Text>
              <Text style={styles.listingLocation} numberOfLines={1}>
                {params.listingLocation ?? ""}
              </Text>
            </View>
          </View>

          {/* Price Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Details</Text>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                ${pricePerNight.toFixed(2)} x {nights} night
                {nights > 1 ? "s" : ""}
              </Text>
              <Text style={styles.priceValue}>${subtotal.toFixed(2)}</Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service fee</Text>
              <Text style={styles.priceValue}>${serviceFee.toFixed(2)}</Text>
            </View>

            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total (USD)</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>

          {/* Payment info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment</Text>
            <View style={styles.stripeInfo}>
              <Ionicons name="lock-closed-outline" size={18} color="#717171" />
              <Text style={styles.stripeInfoText}>
                You will be redirected to Stripe's secure checkout to complete
                payment.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Pay button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.payBtn, processing && styles.payBtnDisabled]}
            onPress={handleCheckout}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.payBtnText}>Pay ${total.toFixed(2)}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </AuthGate>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { padding: 20, paddingBottom: 100 },

  // Summary card
  summaryCard: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 24,
  },
  listingImage: { width: 110, height: 100 },
  imagePlaceholder: {
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  summaryDetails: { flex: 1, padding: 12, justifyContent: "center" },
  listingTitle: { fontSize: 16, fontWeight: "600", color: "#222" },
  listingLocation: { fontSize: 13, color: "#717171", marginTop: 4 },

  // Sections
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
    color: "#222",
  },

  // Price rows
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  priceLabel: { fontSize: 15, color: "#333" },
  priceValue: { fontSize: 15, color: "#333" },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    marginTop: 8,
    paddingTop: 14,
  },
  totalLabel: { fontSize: 16, fontWeight: "700", color: "#222" },
  totalValue: { fontSize: 16, fontWeight: "700", color: "#222" },

  // Stripe info
  stripeInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#f9f9f9",
    padding: 14,
    borderRadius: 10,
  },
  stripeInfoText: { flex: 1, fontSize: 13, color: "#717171", lineHeight: 19 },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    padding: 16,
    paddingBottom: 30,
  },
  payBtn: {
    backgroundColor: "#FF385C",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  payBtnDisabled: { opacity: 0.5 },
  payBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
