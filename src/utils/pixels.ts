type CalculateMaxBytes = (image: ImageData) => number;
export const calculateMaxBytes: CalculateMaxBytes = (image) => {
	const width = image.width;
	const height = image.height;
	const totalPixels = width * height;

	// Asumimos que podemos usar 1 bit por píxel en el canal alfa, lo que da un máximo de 1 bit por píxel
	const bytesPerPixel = 1 / 8; // 1 bit por píxel

	// Calculamos el máximo de bytes basados en la imagen
	const maxBytes = totalPixels * bytesPerPixel;

	// Aquí podemos aplicar un factor de seguridad o un límite máximo dependiendo del tamaño de la imagen
	const sizeInKB = (image.width * image.height * 4) / 1024; // Estimación aproximada del tamaño de la imagen en KB
	const factorLimit = Math.min(sizeInKB * 0.8, maxBytes); // No exceder el 80% del tamaño de la imagen

	return Math.floor(factorLimit);
};

type DecodeFromAlpha = (imgData: Uint8ClampedArray) => Uint8Array;
export const decodeFromAlpha: DecodeFromAlpha = (imgData) => {
	const extracted: number[] = [];
	for (let i = 0; i < imgData.length; i += 4) {
		const byte = imgData[i + 3];
		if (byte === 0) break; // Stop on null byte (end of message)
		extracted.push(byte);
	}
	return new Uint8Array(extracted);
};
