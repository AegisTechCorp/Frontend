/**
 * Type definitions pour argon2-browser
 */

declare module 'argon2-browser' {
  export interface Argon2Options {
    pass: string;
    salt: Uint8Array;
    type: 0 | 1 | 2; // 0 = Argon2d, 1 = Argon2i, 2 = Argon2id
    mem: number; // Mémoire en KB
    time: number; // Nombre d'itérations
    parallelism: number; // Nombre de threads
    hashLen: number; // Longueur du hash en bytes
  }

  export interface Argon2Result {
    hash: Uint8Array;
    hashHex: string;
    encoded: string;
  }

  export function hash(options: Argon2Options): Promise<Argon2Result>;
}
