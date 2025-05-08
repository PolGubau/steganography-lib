import { describe, it, expect, vi, beforeEach } from "vitest";
import { encryptMessage } from "./encrypt";
import * as bytesUtils from "../utils/bytes";
import * as deriveKeyModule from "./derive-key";

const encoder = new TextEncoder();

describe("encryptMessage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should return plaintext encoding if no password is provided", async () => {
    const message = "hello world";
    const result = await encryptMessage(message);
    expect(result).toEqual(encoder.encode(`PLAINTEXT::${message}`));
  });

  it("should return encrypted message if password is provided", async () => {
    // Mock getRandomBytes to return predictable values
    const salt = new Uint8Array(16).fill(1);
    const iv = new Uint8Array(12).fill(2);
    vi.spyOn(bytesUtils, "getRandomBytes")
      .mockImplementationOnce(() => salt)
      .mockImplementationOnce(() => iv);

    // Mock deriveKey to return a CryptoKey
    const fakeKey = {} as CryptoKey;
    vi.spyOn(deriveKeyModule, "deriveKey").mockResolvedValue(fakeKey);

    // Mock crypto.subtle.encrypt
    const encryptedData = new Uint8Array([10, 20, 30, 40]).buffer;
    vi.stubGlobal("crypto", {
      subtle: {
        encrypt: vi.fn().mockResolvedValue(encryptedData),
      },
    });

    // Mock concatBytes to just concatenate all Uint8Arrays
    vi.spyOn(bytesUtils, "concatBytes").mockImplementation(
      (...arrays: Uint8Array[]) => {
        const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const arr of arrays) {
          result.set(arr, offset);
          offset += arr.length;
        }
        return result;
      },
    );

    const message = "secret";
    const password = "pass";
    const result = await encryptMessage(message, password);

    // Check prefix
    const prefix = encoder.encode("ENCRYPTED::");
    expect(Buffer.from(result.slice(0, prefix.length)).toString()).toBe(
      "ENCRYPTED::",
    );

    // Check salt
    expect(
      result.slice(prefix.length, prefix.length + salt.length),
    ).toStrictEqual(salt);

    // Check iv
    const ivStart = prefix.length + salt.length;
    expect(result.slice(ivStart, ivStart + iv.length)).toStrictEqual(iv);

    // Check encrypted data
    const encryptedStart = ivStart + iv.length;
    expect(result.slice(encryptedStart)).toStrictEqual(
      new Uint8Array(encryptedData),
    );
  });
});
