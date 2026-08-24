import CryptoJS from "crypto-js";

// =========================================================
// AES SECRET KEY
// =========================================================

const SECRET_KEY = import.meta.env.VITE_MESSAGE_SECRET_KEY;

if (!SECRET_KEY) {
  console.warn(
    "⚠️ VITE_MESSAGE_SECRET_KEY is not configured"
  );
}

// =========================================================
// ENCRYPT MESSAGE
// =========================================================

export function encryptMessage(text) {
  if (!text || typeof text !== "string") {
    return text;
  }

  try {
    const encrypted = CryptoJS.AES.encrypt(
      text,
      SECRET_KEY
    ).toString();

    return encrypted;
  } catch (error) {
    console.error(
      "❌ Message encryption failed:",
      error.message
    );

    return text;
  }
}

// =========================================================
// DECRYPT MESSAGE
// =========================================================

export function decryptMessage(encryptedText) {
  if (
    !encryptedText ||
    typeof encryptedText !== "string"
  ) {
    return encryptedText;
  }

  try {
    const bytes = CryptoJS.AES.decrypt(
      encryptedText,
      SECRET_KEY
    );

    const decryptedText = bytes.toString(
      CryptoJS.enc.Utf8
    );

    // If decryption produces nothing,
    // return the original text.
    //
    // This is useful for old messages that were
    // created before AES encryption was implemented.

    if (!decryptedText) {
      return encryptedText;
    }

    return decryptedText;
  } catch (error) {
    console.error(
      "❌ Message decryption failed:",
      error.message
    );

    return encryptedText;
  }
}