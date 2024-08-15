// Copy from: https://github.com/uupaa/Hash.js/blob/master/lib/Hash.js
type HexString = string; // "004153434949ff"
type BinaryString = string;
type UINT32 = number;

export class MD5 {
  // pre-calculated table
  private static MD5_A = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf,
    0x4787c62a, 0xa8304613, 0xfd469501, 0x698098d8, 0x8b44f7af,
    0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e,
    0x49b40821, 0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
    0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8, 0x21e1cde6,
    0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8,
    0x676f02d9, 0x8d2a4c8a, 0xfffa3942, 0x8771f681, 0x6d9d6122,
    0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039,
    0xe6db99e5, 0x1fa27cf8, 0xc4ac5665, 0xf4292244, 0x432aff97,
    0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d,
    0x85845dd1, 0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
    0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
  ];
  // pre-calculated table
  private static MD5_S = [
    7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,
    5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,
    4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,
    6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21
  ];
  // pre-calculated table
  private static MD5_X = [
    0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15,
    1,  6, 11,  0,  5, 10, 15,  4,  9, 14,  3,  8, 13,  2,  7, 12,
    5,  8, 11, 14,  1,  4,  7, 10, 13,  0,  3,  6,  9, 12, 15,  2,
    0,  7, 14,  5, 12,  3, 10,  1,  8, 15,  6, 13,  4, 11,  2,  9
  ];

  constructor() {
  }
  public static hash(source:Uint8Array):Uint8Array {
    const buffer = createBufferWith64BytePadding(source);
    const e = source.length * 8;

    buffer[buffer.length - 8] = e & 0xff;
    buffer[buffer.length - 7] = e >>> 8 & 0xff;
    buffer[buffer.length - 6] = e >>> 16 & 0xff;
    buffer[buffer.length - 5] = e >>> 24 & 0xff;

    const hash = MD5.encode(buffer); // [a, b, c, d]
    const result = new Uint8Array(16);

    for (let ri = 0, hi = 0; hi < 4; ri += 4, ++hi) {
      result[ri] = hash[hi] & 0xff;
      result[ri + 1] = hash[hi] >>> 8 & 0xff;
      result[ri + 2] = hash[hi] >>> 16 & 0xff;
      result[ri + 3] = hash[hi] >>> 24 & 0xff;
    }
    return result;
  }
  private static encode(source:Uint8Array):Array<number> { // NumberArray
    // @ret Array - MD5 hash. [a, b, c, d]
    // setup default values
    let a = 0x67452301;
    let b = 0xefcdab89;
    let c = 0x98badcfe;
    let d = 0x10325476;

    // working and temporary
    let i = 0, j = 0, k = 0, n = 0;
    const iz = source.length;
    const word = [];

    for (; i < iz; i += 64) {
      for (j = 0; j < 16; ++j) {
        k = i + j * 4;
        word[j] = source[k] + ( source[k + 1] << 8 ) +
          ( source[k + 2] << 16 ) +
          ( source[k + 3] << 24 );
      }
      const aa = a;
      const bb = b;
      const cc = c;
      const dd = d;

      for (j = 0; j < 64; ++j) {
        n = j < 16 ? ( b & c ) | ( ~b & d ) // ff - Round 1
          : j < 32 ? ( b & d ) | ( c & ~d ) // gg - Round 2
          : j < 48 ? b ^ c ^ d              // hh - Round 3
          : c ^ ( b | ~d );                 // ii - Round 4
        n += a + word[MD5.MD5_X[j]] + MD5.MD5_A[j];

        const ra = b + ( ( n << MD5.MD5_S[j] ) | ( n >>> ( 32 - MD5.MD5_S[j] ) ) );
        const rb = b;
        const rc = c;
        // --- rotate ---
        a = d;
        b = ra;
        c = rb;
        d = rc;
      }
      a += aa;
      b += bb;
      c += cc;
      d += dd;
    }
    return [a, b, c, d];
  }
}

export const toUint8Array = (source:BinaryString|Uint8Array):Uint8Array => {
	if (source instanceof Uint8Array) { return source; }

  const result = new Uint8Array(source.length);

  for (let i = 0, iz = source.length; i < iz; ++i) {
    result[i] = source.charCodeAt(i) & 0xff;
  }
  return result;
}

export const toHexString = (source:UINT32|Uint8Array|Uint16Array|Uint32Array):HexString => {
	const HEX:string = "0123456789abcdef";
	const result:Array<string> = [];

	if (typeof source === "number") { // is UINT32
		source = new Uint32Array([source]);
	}
	if (source instanceof Uint8Array) {
		for (let i = 0, iz = source.length; i < iz; ++i) {
			var u8 = source[i];
			result.push( HEX[(u8  >>  4) & 0xf], HEX[(u8       ) & 0xf] );
		}
	} else if (source instanceof Uint16Array) {
		for (let i = 0, iz = source.length; i < iz; ++i) {
			var u16 = source[i];
			result.push( HEX[(u16 >> 12) & 0xf], HEX[(u16 >>  8) & 0xf],
			HEX[(u16 >>  4) & 0xf], HEX[(u16      ) & 0xf] );
		}
	} else if (source instanceof Uint32Array) {
		for (let i = 0, iz = source.length; i < iz; ++i) {
			var u32 = source[i];
			result.push( HEX[(u32 >>> 28) & 0xf], HEX[(u32 >>> 24) & 0xf],
			HEX[(u32 >>> 20) & 0xf], HEX[(u32 >>> 16) & 0xf],
			HEX[(u32 >>> 12) & 0xf], HEX[(u32 >>>  8) & 0xf],
			HEX[(u32 >>>  4) & 0xf], HEX[(u32       ) & 0xf] );
		}
	}
	return result.join("");
}

export const createBufferWith64BytePadding = (source:Uint8Array):Uint8Array => {
  const iz     = source.length;
  const remain = (iz + 1) % 64;
  let times    = (iz + 1) >> 6;

  if (remain > 56) {
    ++times;
  }
  const buffer = new Uint8Array( (times + 1) << 6 );

  buffer.set(source);
  buffer[iz] = 0x80;
  return buffer;
}

export const addUint8Array = (source:Uint8Array, add:Uint8Array):Uint8Array => {
	const result = new Uint8Array(source.length + add.length);

	result.set(source, 0);
	result.set(add, source.length);
	return result;
}
