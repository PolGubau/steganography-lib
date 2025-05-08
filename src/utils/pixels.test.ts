import { describe, it, expect } from "vitest";
import { calculateMaxBytes, decodeFromAlpha } from "./pixels";

// Mock ImageData for testing
class MockImageData {
  width: number;
  height: number;
  data: Uint8ClampedArray;
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.data = new Uint8ClampedArray(width * height * 4);
  }
}
describe("calculateMaxBytes", () => {
  it("calculates max bytes for a small image", () => {
    const image = new MockImageData(8, 8) as unknown as ImageData;
    const result = calculateMaxBytes(image);
    // 8x8 = 64 pixels, 1 bit per pixel = 8 bytes, sizeInKB = 8*8*4/1024 = 0.25KB, 0.25*0.8=0.2, min(0.2,8)=0.2
    expect(result).toBe(0);
  });

  it("calculates max bytes for a larger image", () => {
    const image = new MockImageData(100, 100) as unknown as ImageData;
    const result = calculateMaxBytes(image);
    // 100x100=10000 pixels, 10000/8=1250 bytes, sizeInKB=100*100*4/1024=39.0625, 39.0625*0.8=31.25, min(31.25,1250)=31.25
    expect(result).toBe(31);
  });

  it("returns 0 for 1x1 image", () => {
    const image = new MockImageData(1, 1) as unknown as ImageData;
    const result = calculateMaxBytes(image);
    expect(result).toBe(0);
  });
});
describe("decodeFromAlpha", () => {
  it("extracts bytes from alpha channel until null byte", () => {
    // RGBA: [0,0,0,65, 0,0,0,66, 0,0,0,67, 0,0,0,0]
    const arr = new Uint8ClampedArray([
      0, 0, 0, 65, 0, 0, 0, 66, 0, 0, 0, 67, 0, 0, 0, 0,
    ]);
    const result = decodeFromAlpha(arr);
    expect(Array.from(result)).toEqual([65, 66, 67]);
  });

  it("returns empty array if first alpha is null byte", () => {
    const arr = new Uint8ClampedArray([0, 0, 0, 0]);
    const result = decodeFromAlpha(arr);
    expect(Array.from(result)).toEqual([]);
  });

  it("extracts all alpha bytes if no null byte", () => {
    const arr = new Uint8ClampedArray([0, 0, 0, 10, 0, 0, 0, 20, 0, 0, 0, 30]);
    const result = decodeFromAlpha(arr);
    expect(Array.from(result)).toEqual([10, 20, 30]);
  });
});
