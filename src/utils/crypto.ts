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
  vaultSalt: string,
): Promise<string> {
  const result = await hash({
    pass: password,
    salt: vaultSalt,
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
  vaultSalt?: string,
): Promise<string> {
  if (!vaultSalt) {
    throw new Error('vaultSalt is required for secure key derivation');
  }
  return deriveMasterKeyArgon2(password, vaultSalt);
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
