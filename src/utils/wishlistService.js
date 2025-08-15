import { supabase } from "./supabase";
import {
  encryptData,
  decryptData,
  encryptWishlistItem,
  decryptWishlistItem,
} from "./encryption";

export const saveWishlistItem = async (itemData, user) => {
  const userKey = user.email;

  // Map your existing structure to encrypted database fields
  const encryptedItem = {
    user_id: user.id,
    encrypted_name: encryptData(itemData.title, userKey), // title -> name
    encrypted_link: encryptData(itemData.link, userKey),
    encrypted_price: encryptData(itemData.price?.toString(), userKey),
    encrypted_notes: encryptData(itemData.notes, userKey),
  };

  const { error } = await supabase
    .from("wishlist_items_test")
    .insert(encryptedItem);

  return { error };
};

export const updateWishlistItem = async (itemId, itemData, user) => {
  const userKey = user.email;

  const encryptedItem = {
    ...encryptWishlistItem(itemData, userKey),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("wishlist_items_test")
    .update(encryptedItem)
    .eq("id", itemId)
    .eq("user_id", user.id); // Ensure user can only update their own items

  return { data, error };
};

export const deleteWishlistItem = async (itemId, userId) => {
  const { data, error } = await supabase
    .from("wishlist_items_test")
    .delete()
    .eq("id", itemId)
    .eq("user_id", userId);

  return { data, error };
};

export const getMyWishlist = async (user) => {
  const { data, error } = await supabase
    .from("wishlist_items_test")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { data: null, error };

  // Convert back to your existing component format
  const decryptedItems = data.map((item) => ({
    id: item.id,
    title: decryptData(item.encrypted_name, user.email), // name -> title
    link: decryptData(item.encrypted_link, user.email),
    price: parseFloat(decryptData(item.encrypted_price, user.email)) || 0,
    notes: decryptData(item.encrypted_notes, user.email),
    createdAt: item.created_at,
  }));

  return { data: decryptedItems, error: null };
};

export const getGifteeWishlist = async (giverId) => {
  // First get the pairing to find receiver and shared key
  const { data: pairing, error: pairingError } = await supabase
    .from("secret_santa_pairings")
    .select("receiver_id, shared_key")
    .eq("giver_id", giverId)
    .single();

  if (pairingError || !pairing) {
    return { data: [], error: "No Secret Santa assignment found" };
  }

  // Get giftee's wishlist items that have been prepared for Secret Santa
  const { data: items, error } = await supabase
    .from("wishlist_items_test")
    .select("*")
    .eq("user_id", pairing.receiver_id)
    .not("shared_key", "is", null) // Only items prepared for sharing
    .order("created_at", { ascending: false });

  if (error) return { data: null, error };

  // Decrypt with shared key
  const decryptedItems = items.map((item) =>
    decryptWishlistItem(item, pairing.shared_key)
  );

  return { data: decryptedItems, error: null };
};

// Function to prepare wishlist items for Secret Santa (called after draw)
export const prepareItemsForSecretSanta = async (pairings) => {
  for (const { receiver, shared_key } of pairings) {
    // Get receiver's items
    const { data: items } = await supabase
      .from("wishlist_items_test")
      .select("*")
      .eq("user_id", receiver.id);

    // Re-encrypt each item with shared key
    for (const item of items) {
      // Decrypt with receiver's email
      const decryptedItem = decryptWishlistItem(item, receiver.email);

      // Re-encrypt with shared key
      const reEncryptedItem = {
        shared_key: shared_key,
        ...encryptWishlistItem(decryptedItem, shared_key),
      };

      await supabase
        .from("wishlist_items_test")
        .update(reEncryptedItem)
        .eq("id", item.id);
    }
  }
};
