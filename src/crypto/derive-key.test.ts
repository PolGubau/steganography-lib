import { describe, expect, it } from "vitest";
import { deriveKey } from "./derive-key";

describe("deriveKey", () => {
	it("should derive a CryptoKey from password and salt", async () => {
		const password = "test-password";
		const salt = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
		const key = await deriveKey(password, salt);

		expect(key).toBeDefined();
		expect(key.type).toBe("secret");
		expect(key.algorithm).toMatchObject({ name: "AES-GCM", length: 256 });
		expect(key.extractable).toBe(true);
		expect(key.usages).toContain("encrypt");
		expect(key.usages).toContain("decrypt");
	});

	it("should produce different keys for different salts", async () => {
		const password = "test-password";
		const salt1 = new Uint8Array([1, 2, 3, 4]);
		const salt2 = new Uint8Array([5, 6, 7, 8]);
		const key1 = await deriveKey(password, salt1);
		const key2 = await deriveKey(password, salt2);

		// Export keys to compare their raw values
		const raw1 = await crypto.subtle.exportKey("raw", key1);
		const raw2 = await crypto.subtle.exportKey("raw", key2);

		expect(Buffer.from(raw1).equals(Buffer.from(raw2))).toBe(false);
	});

	it("should produce the same key for same password and salt", async () => {
		const password = "test-password";
		const salt = new Uint8Array([9, 10, 11, 12]);
		const key1 = await deriveKey(password, salt);
		const key2 = await deriveKey(password, salt);

		const raw1 = await crypto.subtle.exportKey("raw", key1);
		const raw2 = await crypto.subtle.exportKey("raw", key2);

		expect(Buffer.from(raw1).equals(Buffer.from(raw2))).toBe(true);
	});
});
