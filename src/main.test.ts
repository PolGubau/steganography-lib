import { describe, it, expect, vi, beforeEach } from "vitest";
import * as encryptModule from "./crypto/encrypt";
import * as decryptModule from "./crypto/decrypt";
import * as encodeModule from "./utils/encodeIntoAlpha/encodeIntoAlpha";
import * as decodeModule from "./utils/pixels";
import { concatBytes } from "./utils/bytes";
import { embedMessage, extractMessage } from "./main";

// Util para crear imagen simulada
const createMockImage = (width = 2, height = 2): HTMLImageElement => {
  const img = new Image(width, height);
  img.width = width;
  img.height = height;
  return img;
};

const setupCanvasMock = () => {
  const ctxMock = {
    drawImage: vi.fn(),
    getImageData: vi.fn(() => ({
      data: new Uint8ClampedArray(16), // RGBA * 2x2
      width: 2,
      height: 2,
    })),
    putImageData: vi.fn(),
  };

  vi.stubGlobal("document", {
    createElement: vi.fn(() => ({
      width: 0,
      height: 0,
      getContext: vi.fn(() => ctxMock),
    })),
  });
};

describe("Steganography", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    setupCanvasMock();
  });

  describe("embedMessage ", () => {
    it("should encode encrypted message into image alpha", async () => {
      const img = createMockImage();
      const fakeEncrypted = new Uint8Array([1, 2, 3]);

      vi.spyOn(encryptModule, "encryptMessage").mockResolvedValue(
        fakeEncrypted,
      );
      const encodeSpy = vi
        .spyOn(encodeModule, "encodeIntoAlpha")
        .mockImplementation(() => {});

      const canvas = await embedMessage(img, "Hello", {
        password: "1234",
      });

      expect(encryptModule.encryptMessage).toHaveBeenCalledWith(
        "Hello",
        "1234",
      );
      expect(encodeSpy).toHaveBeenCalledWith(
        expect.any(Object),
        concatBytes(fakeEncrypted, new Uint8Array([0])),
      );
      expect(canvas).toHaveProperty("width", img.width);
    });

    it("should throw if canvas context is null", async () => {
      vi.stubGlobal("document", {
        createElement: vi.fn(() => ({
          getContext: vi.fn(() => null),
        })),
      });

      const img = createMockImage();
      await expect(embedMessage(img, "Hello")).rejects.toThrow(
        "Canvas context not available",
      );
    });
  });

  describe(" extractMessage", () => {
    it("should decode and decrypt message from image alpha", async () => {
      const img = createMockImage();
      const fakeDecoded = new Uint8Array([1, 2, 3]);
      const decrypted = "Hidden message";

      vi.spyOn(decodeModule, "decodeFromAlpha").mockReturnValue(fakeDecoded);
      vi.spyOn(decryptModule, "decryptMessage").mockResolvedValue(decrypted);

      const result = await extractMessage(img, { password: "1234" });

      expect(decodeModule.decodeFromAlpha).toHaveBeenCalled();
      expect(decryptModule.decryptMessage).toHaveBeenCalledWith(
        fakeDecoded,
        "1234",
      );
      expect(result).toBe(decrypted);
    });

    it("should throw if canvas context is null", async () => {
      vi.stubGlobal("document", {
        createElement: vi.fn(() => ({
          getContext: vi.fn(() => null),
        })),
      });

      const img = createMockImage();
      await expect(extractMessage(img)).rejects.toThrow(
        "Canvas context not available",
      );
    });
  });
});
