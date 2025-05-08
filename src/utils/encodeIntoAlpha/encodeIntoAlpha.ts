import { calculateMaxBytes } from "../pixels";

type EncodeIntoAlpha = (image: ImageData, message: Uint8Array) => void;

export const encodeIntoAlpha: EncodeIntoAlpha = (image, message) => {
  const imgData = image.data;



  // Check if the message is too long for the calculated max bytes
  // This is a custom check to ensure the message fits within the image's alpha channel
  if (message.length > calculateMaxBytes(image)) {
    throw new Error("Message too long");
  }




  // Check if the image is large enough to hold the message
  // Each pixel has 4 bytes (RGBA), so we need to check if the message can fit
  // in the alpha channel of the image data.
  // A message can't be larger than the number of pixels in the image times 4 (RGBA).
  if (message.length * 4 > imgData.length) {
    throw new Error("Image too small");
  }


  // The message is encoded into the alpha channel of the image data.

  for (let i = 0; i < message.length; i++) {
    imgData[i * 4 + 3] = message[i]; // Use alpha channel
  }
};
