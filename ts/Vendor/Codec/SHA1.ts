// Copy from: https://github.com/uupaa/Hash.js/blob/master/lib/Hash.js
type HexString = string; // "004153434949ff"
type BinaryString = string;
type UINT32 = number;

export class SHA1 {
  constructor() {
  }
  public static hash(source:Uint8Array):Uint8Array {
		const buffer:Uint8Array = createBufferWith64BytePadding(source);
		const e:number = source.length * 8;

		buffer[buffer.length - 1] = e        & 0xff;
		buffer[buffer.length - 2] = e >>>  8 & 0xff;
		buffer[buffer.length - 3] = e >>> 16 & 0xff;
		buffer[buffer.length - 4] = e >>> 24 & 0xff;

		const hash:Array<number> = SHA1.encode(buffer); // [a, b, c, d, e]
		const result = new Uint8Array(20);

		for (let ri = 0, hi = 0; hi < 5; ri += 4, ++hi) {
      result[ri    ] = hash[hi] >>> 24 & 0xff;
      result[ri + 1] = hash[hi] >>> 16 & 0xff;
      result[ri + 2] = hash[hi] >>>  8 & 0xff;
      result[ri + 3] = hash[hi]        & 0xff;
		}
		return result;
  }

 	private static encode(source:Uint8Array):Array<number> { // result = [a, b, c, d, e]
		// setup default values
		let a:number = 0x67452301;
		let b:number = 0xefcdab89;
		let c:number = 0x98badcfe;
		let d:number = 0x10325476;
		let e:number = 0xc3d2e1f0;

		// working and temporary
		const words = [];

		for (let i = 0, iz = source.length; i < iz; i += 64) {
			let aa:number = a;
			let bb:number = b;
			let cc:number = c;
			let dd:number = d;
			let ee:number = e;
			let n:number = 0;

			for (let j = i, jz = i + 64; j < jz; j += 4, ++n) {
				words[n] = (source[j]     << 24) | (source[j + 1] << 16) |
									(source[j + 2] <<  8) |  source[j + 3];
			}
			for (let j = 16; j < 80; ++j) {
				n = words[j - 3] ^ words[j - 8] ^ words[j - 14] ^ words[j - 16];
				words[j] = (n << 1) | (n >>> 31);
			}
			for (let j = 0; j < 80; ++j) {
				n = j < 20 ? ((b & c) ^ (~b & d))           + 0x5a827999
					: j < 40 ?  (b ^ c ^ d)                   + 0x6ed9eba1
					: j < 60 ? ((b & c) ^  (b & d) ^ (c & d)) + 0x8f1bbcdc
									:  (b ^ c ^ d)                   + 0xca62c1d6;
				n += ((a << 5) | (a >>> 27)) + words[j] + e;

				e = d;
				d = c;
				c = (b << 30) | (b >>> 2);
				b = a;
				a = n;
			}
			a += aa;
			b += bb;
			c += cc;
			d += dd;
			e += ee;
		}
		return [a, b, c, d, e];
	}
}

export const toUint8Array = (source:BinaryString|Uint8Array):Uint8Array => {
	if (source instanceof Uint8Array) { return source; }

	const result = new Uint8Array(source.length);

	for (var i = 0, iz = source.length; i < iz; ++i) {
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
