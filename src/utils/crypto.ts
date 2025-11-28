import argon2 from 'argon2-browser';

export async function deriveMasterKeyArgon2(
  password: string,
  vaultSalt: string,
): Promise<string> {
  const result = await argon2.hash({
    pass: password,
    salt: vaultSalt,
    type: argon2.ArgonType.Argon2id,
    hashLen: 32,
    mem: 65536,
    time: 3,
    parallelism: 4,
  });
  
  return btoa(String.fromCharCode(...result.hash));
}

export async function deriveMasterKey(
  password: string,
  email: string,
  vaultSalt?: string,
): Promise<string> {
  if (vaultSalt) {
    return deriveMasterKeyArgon2(password, vaultSalt);
  }
  
  const encoder = new TextEncoder();
  const salt = encoder.encode(`${email}_master_v1`);
  const passwordData = encoder.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  );

  const keyArray = new Uint8Array(derivedBits);
  return btoa(String.fromCharCode(...keyArray));
}


export async function deriveAuthKeyArgon2(
  password: string,
  authSalt: string,
): Promise<string> {
  const result = await argon2.hash({
    pass: password,
    salt: authSalt,
    type: argon2.ArgonType.Argon2id,
    hashLen: 32,
    mem: 65536,
    time: 3,
    parallelism: 4,
  });
  
  return btoa(String.fromCharCode(...result.hash));
}

export async function deriveAuthKey(
  password: string,
  email: string,
  authSalt?: string,
): Promise<string> {
  if (authSalt) {
    return deriveAuthKeyArgon2(password, authSalt);
  }
  
  const encoder = new TextEncoder();
  const salt = encoder.encode(`${email}_auth_v1`);
  const passwordData = encoder.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  );

  const keyArray = new Uint8Array(derivedBits);
  return btoa(String.fromCharCode(...keyArray));
}


export async function hashAuthKey(authKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const authKeyData = encoder.encode(authKey);

  const hashBuffer = await crypto.subtle.digest('SHA-256', authKeyData);

  const hashArray = new Uint8Array(hashBuffer);
  return btoa(String.fromCharCode(...hashArray));
}


export async function encryptData(
  data: string | object,
  masterKey: string,
): Promise<string> {

  const dataString = typeof data === 'string' ? data : JSON.stringify(data);

  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(dataString);

  const keyData = Uint8Array.from(atob(masterKey), (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    'AES-GCM',
    false,
    ['encrypt'],
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    dataBuffer,
  );

  const encryptedArray = new Uint8Array(encryptedBuffer);
  const combined = new Uint8Array(iv.length + encryptedArray.length);
  combined.set(iv, 0);
  combined.set(encryptedArray, iv.length);

  const CHUNK_SIZE = 8192;
  let base64 = '';
  for (let i = 0; i < combined.length; i += CHUNK_SIZE) {
    const chunk = combined.slice(i, i + CHUNK_SIZE);
    base64 += String.fromCharCode(...chunk);
  }
  return btoa(base64);
}


export async function decryptData(
  encryptedData: string,
  masterKey: string,
): Promise<string | null> {
  try {

    const combined = Uint8Array.from(atob(encryptedData), (c) =>
      c.charCodeAt(0),
    );

    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const keyData = Uint8Array.from(atob(masterKey), (c) => c.charCodeAt(0));

    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      'AES-GCM',
      false,
      ['decrypt'],
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encrypted,
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('Erreur lors du déchiffrement:', error);
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
