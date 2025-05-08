type ConcatBytes = (...chunks: Uint8Array[]) => Uint8Array;
export const concatBytes: ConcatBytes = (...chunks) => {
  const size = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
};

type GetRandomBytes = (length: number) => Uint8Array;
export const getRandomBytes: GetRandomBytes = (length) => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
};
