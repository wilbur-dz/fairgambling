import { hmacSha256, stringToBytes } from "./crypto";

/**
 * Stake originals float generator.
 * HMAC key = serverSeed bytes; message = `${clientSeed}:${noncePart}:${cursorIndex}`
 */
export function generateFloats(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  count: number,
  cursor = 0,
  emptyNonceWhenZero = true,
): number[] {
  const key = stringToBytes(serverSeed);
  const needed = 4 * count;
  const bytes = new Uint8Array(needed);
  let filled = 0;
  let cursorIndex = Math.floor(cursor / 32);
  let byteOffset = cursor % 32;
  const noncePart =
    emptyNonceWhenZero && nonce === 0 ? "" : String(nonce);

  while (filled < needed) {
    const msg = stringToBytes(`${clientSeed}:${noncePart}:${cursorIndex}`);
    const digest = hmacSha256(key, msg);
    while (byteOffset < 32 && filled < needed) {
      bytes[filled] = digest[byteOffset];
      filled++;
      byteOffset++;
    }
    byteOffset = 0;
    cursorIndex++;
  }

  const floats: number[] = [];
  for (let i = 0; i < count; i++) {
    const o = 4 * i;
    floats.push(
      bytes[o] / 256 +
        bytes[o + 1] / 65536 +
        bytes[o + 2] / 16777216 +
        bytes[o + 3] / 4294967296,
    );
  }
  return floats;
}
