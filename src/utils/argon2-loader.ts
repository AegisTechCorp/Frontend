import { argon2id } from 'hash-wasm';

export enum ArgonType {
  Argon2d = 0,
  Argon2i = 1,
  Argon2id = 2
}

export interface HashOptions {
  pass: string;
  salt: string;
  type: ArgonType;
  hashLen: number;
  mem: number;
  time: number;
  parallelism: number;
}

export interface HashResult {
  hash: Uint8Array;
  hashHex: string;
  encoded: string;
}

/**
 * Wrapper pour hash-wasm qui simule l'API d'argon2-browser
 */
export async function hash(options: HashOptions): Promise<HashResult> {
  const hashHex = await argon2id({
    password: options.pass,
    salt: options.salt,
    parallelism: options.parallelism,
    iterations: options.time,
    memorySize: options.mem / 1024, // hash-wasm attend des KB, pas des bytes
    hashLength: options.hashLen,
    outputType: 'hex'
  });
  
  const hash = new Uint8Array(
    hashHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
  );
  
  return {
    hash,
    hashHex,
    encoded: hashHex
  };
}
