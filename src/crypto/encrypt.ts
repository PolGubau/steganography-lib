import { concatBytes, getRandomBytes } from "./../utils/bytes";
import { deriveKey } from "./derive-key";
const textEncoder = new TextEncoder();

type EncryptMessage = (
  message: string,
  password?: string,
) => Promise<Uint8Array>;

export const encryptMessage: EncryptMessage = async (message, password) => {
  if (!password) return textEncoder.encode(`PLAINTEXT::${message}`);

  const salt = getRandomBytes(16);
  const iv = getRandomBytes(12);
  const key = await deriveKey(password, salt);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    textEncoder.encode(message),
  );
  return concatBytes(
    textEncoder.encode("ENCRYPTED::"),
    salt,
    iv,
    new Uint8Array(encrypted),
  );
};
