import { decryptMessage } from "./crypto/decrypt";
import { encryptMessage } from "./crypto/encrypt";
import { concatBytes } from "./utils/bytes";
import { encodeIntoAlpha } from "./utils/encodeIntoAlpha/encodeIntoAlpha";
import { decodeFromAlpha } from "./utils/pixels";

export interface SteganoOptions {
  password?: string;
}
/**
 * Oculta un mensaje en la imagen usando el canal alfa
 */
export const embedMessage = async (
  image: HTMLImageElement,
  message: string,
  options?: SteganoOptions,
): Promise<HTMLCanvasElement> => {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");
  ctx.drawImage(image, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const encoded = await encryptMessage(message, options?.password);
  encodeIntoAlpha(imgData, concatBytes(encoded, new Uint8Array([0]))); // Add null terminator
  ctx.putImageData(imgData, 0, 0);

  return canvas;
};

/**
 * Extrae un mensaje de la imagen, desencriptándolo si es necesario
 */
export const extractMessage = async (
  image: HTMLImageElement,
  options?: SteganoOptions,
): Promise<string> => {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");
  ctx.drawImage(image, 0, 0);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const hidden = decodeFromAlpha(imgData.data);
  return await decryptMessage(hidden, options?.password);
};
