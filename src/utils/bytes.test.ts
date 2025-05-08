import { describe, expect, it } from "vitest";
import { concatBytes, getRandomBytes } from "./bytes";

describe("concatBytes", () => {
	it("should concatenate multiple Uint8Arrays", () => {
		const a = new Uint8Array([1, 2]);
		const b = new Uint8Array([3, 4]);
		const c = new Uint8Array([5]);
		const result = concatBytes(a, b, c);
		expect(result).toEqual(new Uint8Array([1, 2, 3, 4, 5]));
	});

	it("should return an empty Uint8Array when no arguments are passed", () => {
		const result = concatBytes();
		expect(result).toEqual(new Uint8Array([]));
	});

	it("should handle a single Uint8Array", () => {
		const a = new Uint8Array([42]);
		const result = concatBytes(a);
		expect(result).toEqual(new Uint8Array([42]));
	});
});

describe("getRandomBytes", () => {
	it("should return a Uint8Array of the specified length", () => {
		const length = 16;
		const result = getRandomBytes(length);
		expect(result).toBeInstanceOf(Uint8Array);
		expect(result.length).toBe(length);
	});

	it("should fill the array with random values", () => {
		// Mock crypto.getRandomValues for deterministic test
		const mockValues = new Uint8Array([1, 2, 3, 4]);
		const originalGetRandomValues = globalThis.crypto.getRandomValues;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		(globalThis.crypto as any).getRandomValues = (arr: Uint8Array) => {
			arr.set(mockValues.subarray(0, arr.length));
			return arr;
		};
		const result = getRandomBytes(4);
		expect(result).toEqual(mockValues);
		globalThis.crypto.getRandomValues = originalGetRandomValues;
	});

	it("should return an empty Uint8Array if length is 0", () => {
		const result = getRandomBytes(0);
		expect(result).toEqual(new Uint8Array([]));
	});
});
