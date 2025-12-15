import { hash, ArgonType } from './argon2-loader';
import { safeBase64Decode } from './safeBase64';

export interface EncryptedDataStructure {
  version: number;
  kdf: {
    alg: string;
    params: {
      m: number;
      t: number;
      p: number;
    };
  };
  encryption: {
    alg: string;
  };
  data_b64: string;
}

export function createEncryptedStructure(
  encryptedData: string,
  kdfParams: { m: number; t: number; p: number } = { m: 65536, t: 3, p: 4 }
): EncryptedDataStructure {
  return {
    version: 1,
    kdf: {
      alg: 'argon2id',
      params: kdfParams
    },
    encryption: {
      alg: 'aes-256-gcm'
    },
    data_b64: encryptedData
  };
}

export function parseEncryptedStructure(structure: EncryptedDataStructure): string {
  if (structure.version !== 1) {
    throw new Error(`Unsupported encryption version: ${structure.version}`);
  }
  if (structure.encryption.alg !== 'aes-256-gcm') {
    throw new Error(`Unsupported encryption algorithm: ${structure.encryption.alg}`);
  }
  return structure.data_b64;
}

export async function deriveSubKey(
  masterKey: string,
  info: string,
  length: number = 32
): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const infoData = encoder.encode(info);
  const keyData = Uint8Array.from(safeBase64Decode(masterKey), (c) => c.charCodeAt(0));

  const baseKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    'HKDF',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(0),
      info: infoData
    },
    baseKey,
    length * 8
  );

  return derivedBits;
}

export async function deriveMasterKeyArgon2(
  password: string,
  authSalt: string,
): Promise<string> {
  const result = await hash({
    pass: password,
    salt: authSalt,
    type: ArgonType.Argon2id,
    hashLen: 32,
    mem: 65536,
    time: 3,
    parallelism: 4
  });

  const hashArray = result.hash;
  let binary = '';
  const len = hashArray.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(hashArray[i]);
  }
  return btoa(binary);
}

export async function deriveMasterKey(
  password: string,
  _email: string,
  authSalt?: string,
): Promise<string> {
  if (!authSalt) {
    throw new Error('authSalt is required for secure key derivation');
  }
  return deriveMasterKeyArgon2(password, authSalt);
}


export async function deriveAuthKeyArgon2(
  password: string,
  authSalt: string,
): Promise<string> {
  const result = await hash({
    pass: password,
    salt: authSalt,
    type: ArgonType.Argon2id,
    hashLen: 32,
    mem: 65536,
    time: 3,
    parallelism: 4
  });
  
  const hashArray = result.hash;
  let binary = '';
  const len = hashArray.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(hashArray[i]);
  }
  return btoa(binary);
}

export async function deriveAuthKey(
  password: string,
  _email: string,
  authSalt?: string,
): Promise<string> {
  if (!authSalt) {
    throw new Error('authSalt is required for secure key derivation');
  }
  return deriveAuthKeyArgon2(password, authSalt);
}


export async function hashAuthKey(authKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const authKeyData = encoder.encode(authKey);

  const hashBuffer = await crypto.subtle.digest('SHA-256', authKeyData);

  const hashArray = new Uint8Array(hashBuffer);
  let binary = '';
  const len = hashArray.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(hashArray[i]);
  }
  return btoa(binary);
}


export async function encryptData(
  data: string | object,
  masterKey: string,
  context?: { userId?: string; recordId?: string; type?: string }
): Promise<string> {

  const dataString = typeof data === 'string' ? data : JSON.stringify(data);

  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(dataString);

  const subKey = await deriveSubKey(masterKey, 'file_encryption_v1', 32);

  const key = await crypto.subtle.importKey(
    'raw',
    subKey,
    'AES-GCM',
    false,
    ['encrypt'],
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));

  let additionalData: Uint8Array | undefined;
  if (context) {
    const aadString = `v1:${context.userId || ''}:${context.recordId || ''}:${context.type || ''}`;
    additionalData = encoder.encode(aadString);
  }

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      ...(additionalData && { additionalData })
    },
    key,
    dataBuffer,
  );

  const encryptedArray = new Uint8Array(encryptedBuffer);
  const combined = new Uint8Array(iv.length + encryptedArray.length);
  combined.set(iv, 0);
  combined.set(encryptedArray, iv.length);

  let binaryString = '';
  for (let i = 0; i < combined.length; i++) {
    binaryString += String.fromCharCode(combined[i]);
  }
  return btoa(binaryString);
}


export async function decryptData(
  encryptedData: string,
  masterKey: string,
  context?: { userId?: string; recordId?: string; type?: string }
): Promise<string | null> {
  try {
    if (!encryptedData || typeof encryptedData !== 'string') {
      return null;
    }
    
    let decodedData: string;
    try {
      decodedData = safeBase64Decode(encryptedData);
    } catch (firstError) {
      try {
        const firstDecode = safeBase64Decode(encryptedData);
        const secondDecode = safeBase64Decode(firstDecode);
        decodedData = secondDecode;
      } catch (secondError) {
        throw firstError;
      }
    }

    const combined = Uint8Array.from(decodedData, (c) =>
      c.charCodeAt(0),
    );

    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const subKey = await deriveSubKey(masterKey, 'file_encryption_v1', 32);

    const key = await crypto.subtle.importKey(
      'raw',
      subKey,
      'AES-GCM',
      false,
      ['decrypt'],
    );

    const encoder = new TextEncoder();
    let additionalData: Uint8Array | undefined;
    if (context) {
      const aadString = `v1:${context.userId || ''}:${context.recordId || ''}:${context.type || ''}`;
      additionalData = encoder.encode(aadString);
    }

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        ...(additionalData && { additionalData })
      },
      key,
      encrypted,
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    return null;
  }
}


export function generateRecoveryKey(): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}


export function isValidAuthHashFormat(authHash: string): boolean {
  const base64Regex = /^[A-Za-z0-9+/]+=*$/;
  return (
    typeof authHash === 'string' &&
    authHash.length === 44 &&
    base64Regex.test(authHash)
  );
}

/**
 * Vérifie si une chaîne est un base64 valide
 */
export function isValidBase64(str: string): boolean {
  if (!str || typeof str !== 'string') {
    return false;
  }

  try {
    safeBase64Decode(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Génère un salt aléatoire pour le chiffrement de fichier
 * @returns Salt encodé en base64 (32 bytes)
 */
export function generateFileSalt(): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = '';
  for (let i = 0; i < randomBytes.length; i++) {
    binary += String.fromCharCode(randomBytes[i]);
  }
  return btoa(binary);
}

/**
 * Chiffre un fichier avec un mot de passe unique et un salt
 * @param file Le fichier à chiffrer
 * @param password Le mot de passe unique pour ce fichier
 * @param salt Le salt (généré avec generateFileSalt)
 * @returns Le blob chiffré
 */
export async function encryptFileWithPassword(
  file: File,
  password: string,
  salt: string
): Promise<Blob> {
  // 1. Dériver une clé de chiffrement depuis le password + salt avec Argon2
  const derivedKey = await hash({
    pass: password,
    salt: salt,
    type: ArgonType.Argon2id,
    hashLen: 32,
    mem: 65536,
    time: 3,
    parallelism: 4
  });

  // 2. Lire le fichier en ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  // 3. Convertir en base64
  let base64 = '';
  const chunkSize = 8192;
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, i + chunkSize);
    base64 += String.fromCharCode(...chunk);
  }
  base64 = btoa(base64);

  // 4. Chiffrer avec AES-GCM
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(base64);

  // Convertir le hash Argon2 en clé AES
  const aesKey = await crypto.subtle.importKey(
    'raw',
    derivedKey.hash,
    'AES-GCM',
    false,
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    aesKey,
    dataBuffer
  );

  // 5. Combiner IV + données chiffrées
  const encryptedArray = new Uint8Array(encryptedBuffer);
  const combined = new Uint8Array(iv.length + encryptedArray.length);
  combined.set(iv, 0);
  combined.set(encryptedArray, iv.length);

  // 6. Convertir en base64 pour le transport
  let binaryString = '';
  for (let i = 0; i < combined.length; i++) {
    binaryString += String.fromCharCode(combined[i]);
  }
  const encryptedBase64 = btoa(binaryString);

  return new Blob([encryptedBase64], { type: 'application/octet-stream' });
}

/**
 * Déchiffre un fichier avec un mot de passe unique et un salt
 * @param encryptedBlob Le blob chiffré
 * @param password Le mot de passe unique du fichier
 * @param salt Le salt du fichier
 * @param originalMimeType Le type MIME original du fichier
 * @returns Le blob déchiffré
 */
export async function decryptFileWithPassword(
  encryptedBlob: Blob,
  password: string,
  salt: string,
  originalMimeType: string
): Promise<Blob> {
  // 1. Dériver la clé de chiffrement depuis le password + salt avec Argon2
  const derivedKey = await hash({
    pass: password,
    salt: salt,
    type: ArgonType.Argon2id,
    hashLen: 32,
    mem: 65536,
    time: 3,
    parallelism: 4
  });

  // 2. Lire le blob chiffré
  const encryptedText = await encryptedBlob.text();

  // 3. Décoder le base64
  const decoded = safeBase64Decode(encryptedText);
  const combined = Uint8Array.from(decoded, (c) => c.charCodeAt(0));

  // 4. Extraire IV et données chiffrées
  const iv = combined.slice(0, 12);
  const encrypted = combined.slice(12);

  // 5. Convertir le hash Argon2 en clé AES
  const aesKey = await crypto.subtle.importKey(
    'raw',
    derivedKey.hash,
    'AES-GCM',
    false,
    ['decrypt']
  );

  // 6. Déchiffrer avec AES-GCM
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    aesKey,
    encrypted
  );

  // 7. Décoder le contenu
  const decoder = new TextDecoder();
  const decryptedBase64 = decoder.decode(decryptedBuffer);

  // 8. Décoder le base64 du fichier original
  const cleaned = decryptedBase64.trim().replace(/\s/g, '');
  const binaryString = safeBase64Decode(cleaned);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new Blob([bytes], { type: originalMimeType });
}

/**
 * Wipe (efface) une variable contenant des données sensibles de la mémoire
 * Remplace le contenu par des zéros avant de le laisser être garbage collected
 * @param sensitiveData La donnée sensible à effacer (string, Uint8Array, etc.)
 */
export function wipeMemory(sensitiveData: string | Uint8Array | ArrayBuffer): void {
  try {
    if (typeof sensitiveData === 'string') {
      // Pour une string, on ne peut pas vraiment la modifier en place en JS
      // Mais on peut créer un array et le remplir de zéros
      const length = sensitiveData.length;
      const zeros = new Array(length).fill('\0').join('');
      // Force le remplacement (même si pas garanti par le GC)
      sensitiveData = zeros;
    } else if (sensitiveData instanceof Uint8Array) {
      // Pour un Uint8Array, on peut le remplir de zéros
      sensitiveData.fill(0);
    } else if (sensitiveData instanceof ArrayBuffer) {
      // Pour un ArrayBuffer, créer une vue et remplir de zéros
      const view = new Uint8Array(sensitiveData);
      view.fill(0);
    }
  } catch (error) {
    console.warn('Erreur lors du wipe de la mémoire:', error);
  }
}

/**
 * Wipe un objet contenant plusieurs données sensibles
 * @param obj L'objet à wiper
 * @param keys Les clés des propriétés sensibles à wiper
 */
export function wipeObject(obj: Record<string, unknown>, keys: string[]): void {
  for (const key of keys) {
    if (obj[key]) {
      const value = obj[key];
      if (typeof value === 'string' || value instanceof Uint8Array || value instanceof ArrayBuffer) {
        wipeMemory(value as string | Uint8Array | ArrayBuffer);
      }
      // Supprimer la propriété
      delete obj[key];
    }
  }
}
