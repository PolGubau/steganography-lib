import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { decryptMessage } from "./decrypt";
import * as deriveKeyModule from "./derive-key";

const encoder = new TextEncoder();

describe("decryptMessage", () => {
	it("should decode PLAINTEXT message", async () => {
		const message = "PLAINTEXT::Hello world!";
		const data = encoder.encode(message);
		const result = await decryptMessage(data);
		expect(result).toBe("Hello world!");
	});

	it("should throw error for ENCRYPTED message without password", async () => {
		const prefix = encoder.encode("ENCRYPTED::");
		const salt = new Uint8Array(16);
		const iv = new Uint8Array(12);
		const payload = new Uint8Array([1, 2, 3]);
		const data = new Uint8Array([...prefix, ...salt, ...iv, ...payload]);
		await expect(decryptMessage(data)).rejects.toThrow(
			"Password required to decrypt",
		);
	});

	describe("ENCRYPTED message with password", () => {
		const password = "test-password";
		const plaintext = "Secret message";
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		let decryptSpy: any;

		beforeAll(() => {
			// Mock deriveKey
			vi.spyOn(deriveKeyModule, "deriveKey").mockResolvedValue({} as CryptoKey);

			// Mock crypto.subtle.decrypt
			decryptSpy = vi
				.spyOn(globalThis.crypto.subtle, "decrypt")
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				.mockResolvedValue(new TextEncoder().encode(plaintext).buffer as any);
		});

		afterAll(() => {
			vi.restoreAllMocks();
		});

		it("should decrypt ENCRYPTED message with password", async () => {
			const prefix = encoder.encode("ENCRYPTED::");
			const salt = new Uint8Array(16);
			const iv = new Uint8Array(12);
			const payload = encoder.encode(plaintext);
			const data = new Uint8Array([...prefix, ...salt, ...iv, ...payload]);

			const result = await decryptMessage(data, password);
			expect(result).toBe(plaintext);
			expect(deriveKeyModule.deriveKey).toHaveBeenCalledWith(password, salt);
			expect(decryptSpy).toHaveBeenCalled();
		});
	});

	it("should throw error for invalid message format", async () => {
		const data = encoder.encode("UNKNOWN::data");
		await expect(decryptMessage(data)).rejects.toThrow(
			"Invalid message format",
		);
	});
});
