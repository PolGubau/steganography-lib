import { deriveKey } from "./derive-key";

const textDecoder = new TextDecoder();

type DecryptedMessage = (
	data: Uint8Array,
	password?: string,
) => Promise<string>;

export const decryptMessage: DecryptedMessage = async (data, password) => {
	const prefix = textDecoder.decode(data.slice(0, 11));

	if (prefix === "PLAINTEXT::") {
		return textDecoder.decode(data.slice(11));
	}
	if (prefix === "ENCRYPTED::") {
		if (!password) throw new Error("Password required to decrypt");
		const salt = data.slice(11, 27);
		const iv = data.slice(27, 39);
		const payload = data.slice(39);
		const key = await deriveKey(password, salt);
		const decrypted = await crypto.subtle.decrypt(
			{ name: "AES-GCM", iv },
			key,
			payload,
		);
		return textDecoder.decode(new Uint8Array(decrypted));
	}
	throw new Error("Invalid message format");
};
