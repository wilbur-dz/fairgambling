/** Pure sync SHA-256 + HMAC-SHA256 (Stake-compatible, ported from mock). */

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

const IV = new Uint32Array([
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
  0x1f83d9ab, 0x5be0cd19,
]);

function rotr(x: number, n: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

function sha256(message: Uint8Array): Uint8Array {
  const state = new Uint32Array(IV);
  const w = new Uint32Array(64);
  const bitLen = 8 * message.length;
  const rem = (message.length + 1 + 8) % 64;
  const pad = rem <= 0 ? -rem : 64 - rem;
  const total = message.length + 1 + pad + 8;
  const buf = new Uint8Array(total);
  buf.set(message);
  buf[message.length] = 0x80;
  buf[total - 4] = (bitLen >>> 24) & 255;
  buf[total - 3] = (bitLen >>> 16) & 255;
  buf[total - 2] = (bitLen >>> 8) & 255;
  buf[total - 1] = bitLen & 255;

  for (let offset = 0; offset < total; offset += 64) {
    for (let i = 0; i < 16; i++) {
      const a = offset + 4 * i;
      w[i] =
        (buf[a] << 24) |
        (buf[a + 1] << 16) |
        (buf[a + 2] << 8) |
        buf[a + 3];
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = state;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }
    state[0] = (state[0] + a) >>> 0;
    state[1] = (state[1] + b) >>> 0;
    state[2] = (state[2] + c) >>> 0;
    state[3] = (state[3] + d) >>> 0;
    state[4] = (state[4] + e) >>> 0;
    state[5] = (state[5] + f) >>> 0;
    state[6] = (state[6] + g) >>> 0;
    state[7] = (state[7] + h) >>> 0;
  }

  const out = new Uint8Array(32);
  for (let i = 0; i < 8; i++) {
    out[4 * i] = (state[i] >>> 24) & 255;
    out[4 * i + 1] = (state[i] >>> 16) & 255;
    out[4 * i + 2] = (state[i] >>> 8) & 255;
    out[4 * i + 3] = state[i] & 255;
  }
  return out;
}

export function stringToBytes(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

export function bytesToHex(bytes: Uint8Array): string {
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

export function hmacSha256(
  key: string | Uint8Array,
  message: string | Uint8Array,
): Uint8Array {
  let keyBytes = typeof key === "string" ? stringToBytes(key) : key;
  const msgBytes = typeof message === "string" ? stringToBytes(message) : message;

  if (keyBytes.length > 64) {
    keyBytes = sha256(keyBytes);
  }

  const block = new Uint8Array(64);
  block.set(keyBytes);

  const ipad = new Uint8Array(64);
  const opad = new Uint8Array(64);
  for (let i = 0; i < 64; i++) {
    ipad[i] = 0x36 ^ block[i];
    opad[i] = 0x5c ^ block[i];
  }

  const inner = new Uint8Array(64 + msgBytes.length);
  inner.set(ipad);
  inner.set(msgBytes, 64);
  const innerHash = sha256(inner);

  const outer = new Uint8Array(96);
  outer.set(opad);
  outer.set(innerHash, 64);
  return sha256(outer);
}
