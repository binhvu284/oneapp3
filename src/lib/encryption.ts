/**
 * Client-side API key encryption using AES-256-GCM via Web Crypto API.
 *
 * Limitation: Without a user-supplied master password the key is derived
 * from a static secret, so possession of the source code still allows
 * decryption. The upgrade over the previous XOR approach is that
 * AES-GCM is semantically secure (different IV per call) and non-reversible
 * without knowing the derived key.
 *
 * For zero-knowledge security a user-provided password would be required.
 */

const STATIC_SECRET = import.meta.env.VITE_ENCRYPTION_SECRET ?? "oneapp-super-secret-key-2026";
const ALGORITHM = "AES-GCM";
const KEY_USAGE: KeyUsage[] = ["encrypt", "decrypt"];

async function deriveKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(STATIC_SECRET),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("oneapp-salt-v2"),
      iterations: 100_000,
      hash: "SHA-256",
    },
    baseKey,
    { name: ALGORITHM, length: 256 },
    false,
    KEY_USAGE,
  );
}

// ── Public API ────────────────────────────────────────────────────────────────

export const obscureApiKey = async (text: string): Promise<string> => {
  if (!text) return text;
  try {
    const key = await deriveKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const cipherBuf = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      enc.encode(text),
    );
    const combined = new Uint8Array(iv.byteLength + cipherBuf.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(cipherBuf), iv.byteLength);
    return "v2:" + btoa(String.fromCharCode(...combined));
  } catch (error) {
    if (import.meta.env.DEV) console.error("[encryption] encrypt error:", error);
    throw new Error("Failed to encrypt API key");
  }
};

export const revealApiKey = async (stored: string): Promise<string> => {
  if (!stored) return stored;

  // New AES-GCM format
  if (stored.startsWith("v2:")) {
    try {
      const key = await deriveKey();
      const raw = atob(stored.slice(3));
      const bytes = Uint8Array.from(raw, (c) => c.charCodeAt(0));
      const iv = bytes.slice(0, 12);
      const cipher = bytes.slice(12);
      const plain = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, cipher);
      return new TextDecoder().decode(plain);
    } catch (error) {
      if (import.meta.env.DEV) console.error("[encryption] decrypt error:", error);
      throw new Error("Failed to decrypt API key");
    }
  }

  // Legacy XOR+Base64 format — decode for backward compatibility
  try {
    const SECRET = STATIC_SECRET;
    const decoded = atob(stored);
    const revealed = decoded
      .split("")
      .map((char, i) =>
        String.fromCharCode(char.charCodeAt(0) ^ SECRET.charCodeAt(i % SECRET.length)),
      )
      .join("");
    return revealed;
  } catch {
    // Not base64 at all — plaintext legacy key
    return stored;
  }
};
