import crypto from "crypto";

const algorithm = "aes-256-cbc";
const encryptionKey = process.env.ENCRYPTION_KEY;

if (!encryptionKey || encryptionKey.length !== 64) {
  console.error(
    "ENCRYPTION_KEY environment variable is not set or not 32 bytes (64 hex characters) long."
  );
  process.exit(1);
}

const keyBuffer = Buffer.from(encryptionKey, "hex");

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decrypt(encryptedText: string): string {
  const textParts = encryptedText.split(":");
  const iv = Buffer.from(textParts.shift()!, "hex");
  const encrypted = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(algorithm, keyBuffer, iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
