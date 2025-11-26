/**
 * Utilitaires cryptographiques côté client pour l'architecture Hybride
 *
 * ARCHITECTURE HYBRIDE:
 * - Authentification classique : envoi du password en clair via HTTPS
 * - Vault Zero-Knowledge : dérivation client-side de la masterKey avec Argon2id
 *
 * IMPORTANT:
 * - La masterKey ne doit JAMAIS quitter le client
 * - Le password est envoyé en clair (chiffré par HTTPS)
 * - Le vaultSalt est reçu du serveur pour dériver la masterKey
 * - La masterKey sert à chiffrer/déchiffrer les données sensibles
 */

import * as argon2 from 'argon2-browser';

/**
 * Dérive la masterKey depuis le mot de passe de l'utilisateur avec Argon2id
 * Cette clé est utilisée pour chiffrer/déchiffrer les données sensibles
 * ATTENTION: Cette clé ne doit JAMAIS être envoyée au serveur
 *
 * ⚠️ PARAMÈTRES ARGON2 CRITIQUES - NE PAS MODIFIER !
 * Ces paramètres doivent correspondre EXACTEMENT à ceux du backend
 *
 * @param password - Mot de passe de l'utilisateur
 * @param vaultSalt - Le vaultSalt reçu du serveur (base64)
 * @returns La masterKey encodée en base64
 */
export async function deriveMasterKey(
  password: string,
  vaultSalt: string,
): Promise<string> {
  try {
    // Décoder le salt depuis base64
    const saltArray = Uint8Array.from(atob(vaultSalt), (c) => c.charCodeAt(0));

    // Dériver la clé avec Argon2id
    // ⚠️ PARAMÈTRES CRITIQUES - NE PAS CHANGER !
    const result = await argon2.hash({
      pass: password,
      salt: saltArray,
      type: 2, // Argon2id (NE PAS CHANGER)
      mem: 65536, // 64 MB (NE PAS CHANGER)
      time: 3, // 3 itérations (NE PAS CHANGER)
      parallelism: 4, // 4 threads (NE PAS CHANGER)
      hashLen: 32, // 256 bits = 32 bytes (NE PAS CHANGER)
    });

    // Retourner le hash encodé en base64
    return btoa(String.fromCharCode(...result.hash));
  } catch (error) {
    console.error('❌ Erreur lors de la dérivation de la masterKey:', error);
    throw new Error('Impossible de dériver la masterKey');
  }
}

/**
 * @deprecated Cette fonction n'est plus utilisée dans l'architecture hybride
 * Le password est maintenant envoyé en clair au serveur (chiffré par HTTPS)
 */
export async function deriveAuthKey(
  password: string,
  email: string,
): Promise<string> {
  console.warn('⚠️ deriveAuthKey est dépréciée - utilisez directement le password');
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

/**
 * @deprecated Cette fonction n'est plus utilisée dans l'architecture hybride
 */
export async function hashAuthKey(authKey: string): Promise<string> {
  console.warn('⚠️ hashAuthKey est dépréciée - le password est envoyé directement');
  const encoder = new TextEncoder();
  const authKeyData = encoder.encode(authKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', authKeyData);
  const hashArray = new Uint8Array(hashBuffer);
  return btoa(String.fromCharCode(...hashArray));
}

/**
 * Chiffre des données avec la masterKey
 * Utilise AES-GCM pour le chiffrement authentifié
 *
 * @param data - Données à chiffrer (string ou object)
 * @param masterKey - La masterKey en base64
 * @returns Données chiffrées encodées en base64
 */
export async function encryptData(
  data: string | object,
  masterKey: string,
): Promise<string> {
  // Convertir les données en string si c'est un objet
  const dataString = typeof data === 'string' ? data : JSON.stringify(data);

  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(dataString);

  // Décoder la masterKey depuis base64
  const keyData = Uint8Array.from(atob(masterKey), (c) => c.charCodeAt(0));

  // Importer la clé pour AES-GCM
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    'AES-GCM',
    false,
    ['encrypt'],
  );

  // Générer un IV aléatoire (12 bytes pour AES-GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Chiffrer les données
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    dataBuffer,
  );

  // Combiner IV + données chiffrées
  const encryptedArray = new Uint8Array(encryptedBuffer);
  const combined = new Uint8Array(iv.length + encryptedArray.length);
  combined.set(iv, 0);
  combined.set(encryptedArray, iv.length);

  // Encoder en base64
  return btoa(String.fromCharCode(...combined));
}

/**
 * Déchiffre des données avec la masterKey
 * Utilise AES-GCM pour le déchiffrement authentifié
 *
 * @param encryptedData - Données chiffrées en base64
 * @param masterKey - La masterKey en base64
 * @returns Données déchiffrées (string)
 */
export async function decryptData(
  encryptedData: string,
  masterKey: string,
): Promise<string | null> {
  try {
    // Décoder les données chiffrées depuis base64
    const combined = Uint8Array.from(atob(encryptedData), (c) =>
      c.charCodeAt(0),
    );

    // Séparer IV et données chiffrées
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    // Décoder la masterKey depuis base64
    const keyData = Uint8Array.from(atob(masterKey), (c) => c.charCodeAt(0));

    // Importer la clé pour AES-GCM
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      'AES-GCM',
      false,
      ['decrypt'],
    );

    // Déchiffrer les données
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encrypted,
    );

    // Convertir en string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('Erreur lors du déchiffrement:', error);
    return null;
  }
}

/**
 * Génère une clé de récupération pour l'utilisateur
 * Cette clé doit être sauvegardée par l'utilisateur en lieu sûr
 *
 * @returns Clé de récupération au format hexadécimal
 */
export function generateRecoveryKey(): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Validation du format d'un authHash
 * Vérifie que l'authHash est bien une chaîne base64 de 44 caractères
 *
 * @param authHash - authHash à valider
 * @returns true si le format est valide
 */
export function isValidAuthHashFormat(authHash: string): boolean {
  const base64Regex = /^[A-Za-z0-9+/]+=*$/;
  return (
    typeof authHash === 'string' &&
    authHash.length === 44 &&
    base64Regex.test(authHash)
  );
}
