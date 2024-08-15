// Copy from: https://github.com/uupaa/Hash.js/blob/master/lib/Hash.js
import { MD5, addUint8Array } from "./MD5";
import { SHA1 } from "./SHA1";

type HMAC_METHODS = "MD5" | "SHA1";

export class HMAC {
  constructor() {
  }
  static MD5(key:Uint8Array, message:Uint8Array):Uint8Array {
    return HMAC.encode("MD5", key, message);
  }
  static SHA1(key:Uint8Array, message:Uint8Array):Uint8Array {
    return HMAC.encode("SHA1", key, message);
  }

  static encode(method:HMAC_METHODS, key:Uint8Array, message:Uint8Array):Uint8Array {
    const _encode = (method:HMAC_METHODS, value:Uint8Array):Uint8Array => {
      switch (method) {
        case "MD5":  return MD5.hash(value);
        case "SHA1": return SHA1.hash(value);
        default: throw new TypeError(`${method} not impl.`);
      }
    }

    const blockSize:number = 64; // magic word(MD5.blockSize = 64, SHA1.blockSize = 64)

    if (key.length > blockSize) {
      key = _encode(method, key)
    }

    const padSize:number = Math.max(key.length, blockSize);
    const opad = new Uint8Array(padSize);
    const ipad = new Uint8Array(padSize);

    opad.set(key);
    ipad.set(key);

    for (var i = 0; i < blockSize; ++i) {
      opad[i] ^= 0x5C; // xor
      ipad[i] ^= 0x36; // xor
    }
    const hash:Uint8Array = _encode(method, addUint8Array(ipad, message) );
    const result:Uint8Array = _encode(method, addUint8Array(opad, hash) );
    return result;
  }
}
