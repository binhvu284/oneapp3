/**
 * Server-side API key encryption using AES-256-GCM (Deno Web Crypto).
 *
 * Keys are stored as "v2:<base64(iv + ciphertext)>".
 * Legacy XOR+Base64 values (no prefix) are detected and decoded for
 * backward compatibility — they are not re-encrypted automatically so
 * existing records continue to work.
 */

const SECRET = Deno.env.get("OBFUSCATION_SECRET") ?? "oneapp-super-secret-key-2026";
const ALGORITHM = "AES-GCM";

async function deriveKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const base = await crypto.subtle.importKey("raw", enc.encode(SECRET), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: enc.encode("oneapp-salt-v2"), iterations: 100_000, hash: "SHA-256" },
    base,
    { name: ALGORITHM, length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export const obscureApiKey = async (text: string): Promise<string> => {
  if (!text) return text;
  const key = await deriveKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const cipher = await crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, enc.encode(text));
  const combined = new Uint8Array(iv.byteLength + cipher.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipher), iv.byteLength);
  return "v2:" + btoa(String.fromCharCode(...combined));
};

export const revealApiKey = async (stored: string): Promise<string> => {
  if (!stored) return stored;

  // AES-GCM format
  if (stored.startsWith("v2:")) {
    const key = await deriveKey();
    const raw = atob(stored.slice(3));
    const bytes = Uint8Array.from(raw, (c) => c.charCodeAt(0));
    const iv = bytes.slice(0, 12);
    const cipher = bytes.slice(12);
    const plain = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, cipher);
    return new TextDecoder().decode(plain);
  }

  // Legacy XOR+Base64 fallback
  try {
    const decoded = atob(stored);
    return decoded
      .split("")
      .map((c, i) =>
        String.fromCharCode(c.charCodeAt(0) ^ SECRET.charCodeAt(i % SECRET.length))
      )
      .join("");
  } catch {
    return stored; // plaintext legacy key
  }
};
