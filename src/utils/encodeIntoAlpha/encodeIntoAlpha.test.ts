import { type Mock, describe, expect, it, vi } from "vitest";
import { calculateMaxBytes } from "../pixels";
import { encodeIntoAlpha } from "./encodeIntoAlpha";

// Helper to create a blank ImageData-like object
function createImageData(width: number, height: number): ImageData {
	const data = new Uint8ClampedArray(width * height * 4);
	return { width, height, data } as ImageData;
}
vi.mock("../pixels", () => ({
	calculateMaxBytes: vi.fn(),
}));

const mockCalculateMaxBytes = calculateMaxBytes as Mock;

describe("encodeIntoAlpha", () => {
	it("encodes message bytes into the alpha channel", () => {
		const image = createImageData(2, 2); // 4 pixels, 16 bytes
		const message = new Uint8Array([10, 20, 30, 40]);
		mockCalculateMaxBytes.mockReturnValue(4);

		encodeIntoAlpha(image, message);

		// Check that alpha channel (every 4th byte starting at index 3) is set
		expect(image.data[3]).toBe(10);
		expect(image.data[7]).toBe(20);
		expect(image.data[11]).toBe(30);
		expect(image.data[15]).toBe(40);
	});

	it("throws if message is too long for calculateMaxBytes", () => {
		// Image is ok
		const image = createImageData(10, 10); // 100 pixels, 400 bytes

		// Message is 5 bytes long
		const message = new Uint8Array([1, 2, 3, 4, 5]);

		// The max bytes for this fn is 2, so the message is too long
		mockCalculateMaxBytes.mockReturnValue(2);

		expect(() => encodeIntoAlpha(image, message)).toThrow("Message too long");
	});

	it("throws if message is too long for image data", () => {
		const image = createImageData(1, 1); // 4 bytes (1 pixel)
		const message = new Uint8Array([1, 2]); // the message is 2 bytes long
		mockCalculateMaxBytes.mockReturnValue(3); // the max bytes is 3, the message is ok but the image is too small

		expect(() => encodeIntoAlpha(image, message)).toThrow("Image too small");
	});

	it("does not modify non-alpha channels", () => {
		const image = createImageData(2, 2);
		// Fill with known values
		image.data.set([1, 2, 3, 0, 4, 5, 6, 0, 7, 8, 9, 0, 10, 11, 12, 0]);
		const message = new Uint8Array([100, 101, 102, 103]);
		mockCalculateMaxBytes.mockReturnValue(4);
		encodeIntoAlpha(image, message);

		// Check that only alpha channels changed
		expect(image.data[0]).toBe(1);
		expect(image.data[1]).toBe(2);
		expect(image.data[2]).toBe(3);
		expect(image.data[3]).toBe(100);

		expect(image.data[4]).toBe(4);
		expect(image.data[5]).toBe(5);
		expect(image.data[6]).toBe(6);
		expect(image.data[7]).toBe(101);

		expect(image.data[8]).toBe(7);
		expect(image.data[9]).toBe(8);
		expect(image.data[10]).toBe(9);
		expect(image.data[11]).toBe(102);

		expect(image.data[12]).toBe(10);
		expect(image.data[13]).toBe(11);
		expect(image.data[14]).toBe(12);
		expect(image.data[15]).toBe(103);
	});
});
