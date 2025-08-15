import CryptoJS from "crypto-js";

/**
 * Encrypt a single piece of data
 * @param {string} data - The data to encrypt
 * @param {string} key - The encryption key
 * @returns {string|null} - Encrypted string or null if no data
 */
export const encryptData = (data, key) => {
  if (!data || data === "") return null;
  try {
    return CryptoJS.AES.encrypt(data.toString(), key).toString();
  } catch (error) {
    console.error("Encryption error:", error);
    return null;
  }
};

/**
 * Decrypt a single piece of data
 * @param {string} encryptedData - The encrypted data
 * @param {string} key - The encryption key
 * @returns {string|null} - Decrypted string or null if no data/error
 */
export const decryptData = (encryptedData, key) => {
  if (!encryptedData || encryptedData === "") return null;
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || null;
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};

/**
 * Encrypt a wishlist item object for database storage
 * @param {Object} itemData - The item data to encrypt
 * @param {string} itemData.title - Item title
 * @param {string} itemData.link - Item link
 * @param {string|number} itemData.price - Item price
 * @param {string} itemData.notes - Item notes
 * @param {string} key - The encryption key
 * @returns {Object} - Object with encrypted fields
 */
export const encryptWishlistItem = (itemData, key) => {
  return {
    encrypted_name: encryptData(itemData.title, key),
    encrypted_link: encryptData(itemData.link, key),
    encrypted_price: encryptData(itemData.price?.toString(), key),
    encrypted_notes: encryptData(itemData.notes, key),
  };
};

/**
 * Decrypt a wishlist item from database
 * @param {Object} encryptedItem - The encrypted item from database
 * @param {string} key - The encryption key
 * @returns {Object} - Decrypted item in component format
 */
export const decryptWishlistItem = (encryptedItem, key) => {
  const decryptedPrice = decryptData(encryptedItem.encrypted_price, key);

  return {
    id: encryptedItem.id,
    title: decryptData(encryptedItem.encrypted_name, key) || "",
    link: decryptData(encryptedItem.encrypted_link, key) || "",
    price: decryptedPrice ? parseFloat(decryptedPrice) : 0,
    notes: decryptData(encryptedItem.encrypted_notes, key) || "",
    createdAt: encryptedItem.created_at,
    updatedAt: encryptedItem.updated_at,
  };
};

/**
 * Generate a shared key for Secret Santa pairings
 * @param {string} giverId - ID of the gift giver
 * @param {string} receiverId - ID of the gift receiver
 * @param {string} season - Optional season identifier (e.g., 'christmas2024')
 * @returns {string} - Shared encryption key
 */
export const generateSharedKey = (
  giverId,
  receiverId,
  season = "secretsanta2024"
) => {
  return CryptoJS.SHA256(giverId + receiverId + season).toString();
};

/**
 * Validate that encrypted data can be decrypted (useful for testing)
 * @param {string} encryptedData - Encrypted string
 * @param {string} key - Encryption key
 * @returns {boolean} - True if data can be decrypted successfully
 */
export const validateEncryption = (encryptedData, key) => {
  try {
    const decrypted = decryptData(encryptedData, key);
    return decrypted !== null;
  } catch {
    return false;
  }
};
