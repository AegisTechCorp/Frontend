import nacl from 'tweetnacl';
import { decodeUTF8, encodeUTF8, encodeBase64, decodeBase64 } from 'tweetnacl-util';

/**
 * Dérive la Master Key depuis le mot de passe et l'email
 * Cette clé reste sur le client et sert à chiffrer/déchiffrer les données
 */
export async function deriveMasterKey(password: string, email: string): Promise<string> {
  const salt = `${email}_master`;
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  const saltData = encoder.encode(salt);

  // Utilisation de Web Crypto API pour PBKDF2
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltData,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256 // 256 bits = 32 bytes
  );

  return encodeBase64(new Uint8Array(derivedBits));
}

/**
 * Dérive l'Auth Key depuis le mot de passe et l'email
 * Cette clé est hashée et envoyée au serveur pour authentification
 */
export async function deriveAuthKey(password: string, email: string): Promise<string> {
  const salt = `${email}_auth`;
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  const saltData = encoder.encode(salt);

  // Utilisation de Web Crypto API pour PBKDF2
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltData,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256 // 256 bits = 32 bytes
  );

  return encodeBase64(new Uint8Array(derivedBits));
}

/**
 * Hash l'Auth Key avant de l'envoyer au serveur (protection supplémentaire)
 */
export async function hashAuthKey(authKey: string): Promise<string> {
  const authKeyData = decodeBase64(authKey);
  
  // Hash SHA-256 de l'authKey
  // Créer un nouveau Uint8Array pour éviter les problèmes de type
  const dataArray = new Uint8Array(authKeyData);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataArray);
  
  return encodeBase64(new Uint8Array(hashBuffer));
}

/**
 * Chiffre des données avec la Master Key en utilisant tweetnacl secretbox
 */
export function encrypt(data: string, masterKey: string): string {
  try {
    const key = decodeBase64(masterKey).slice(0, 32); // S'assurer que la clé fait 32 bytes
    const nonce = nacl.randomBytes(24); // Nonce de 24 bytes pour secretbox
    const messageUint8 = decodeUTF8(data);
    
    const encrypted = nacl.secretbox(messageUint8, nonce, key);
    
    if (!encrypted) {
      throw new Error('Échec du chiffrement');
    }

    // Concaténer nonce + données chiffrées
    const fullMessage = new Uint8Array(nonce.length + encrypted.length);
    fullMessage.set(nonce);
    fullMessage.set(encrypted, nonce.length);

    return encodeBase64(fullMessage);
  } catch (error) {
    throw new Error(`Erreur lors du chiffrement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

/**
 * Déchiffre des données avec la Master Key en utilisant tweetnacl secretbox
 */
export function decrypt(encryptedData: string, masterKey: string): string | null {
  try {
    const key = decodeBase64(masterKey).slice(0, 32); // S'assurer que la clé fait 32 bytes
    const messageWithNonce = decodeBase64(encryptedData);
    
    if (messageWithNonce.length < 24) {
      return null; // Message trop court pour contenir le nonce
    }

    const nonce = messageWithNonce.slice(0, 24);
    const message = messageWithNonce.slice(24);

    const decrypted = nacl.secretbox.open(message, nonce, key);
    
    if (!decrypted) {
      return null; // Échec du déchiffrement (mauvaise clé ou données corrompues)
    }

    return encodeUTF8(decrypted);
  } catch (error) {
    return null;
  }
}

/**
 * Stocke la Master Key en sessionStorage (se supprime à la fermeture du navigateur)
 */
export function storeMasterKey(masterKey: string): void {
  sessionStorage.setItem('aegis_master_key', masterKey);
}

/**
 * Récupère la Master Key depuis sessionStorage
 */
export function getMasterKey(): string | null {
  return sessionStorage.getItem('aegis_master_key');
}

/**
 * Supprime la Master Key de sessionStorage
 */
export function clearMasterKey(): void {
  sessionStorage.removeItem('aegis_master_key');
}

