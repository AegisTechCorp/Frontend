/**
 * Utilitaires cryptographiques côté client pour l'architecture Hybride
 * (Authentification Classique + Vault Zero-Knowledge)
 *
 * ARCHITECTURE:
 * 1. Password envoyé en clair au serveur (HTTPS) pour authentification
 * 2. Serveur retourne vaultSalt (aléatoire, stocké en BDD)
 * 3. Client dérive masterKey = Argon2(password, vaultSalt)
 * 4. masterKey chiffre/déchiffre les données sensibles (AES-GCM)
 *
 * IMPORTANT:
 * - La masterKey ne doit JAMAIS quitter le client
 * - La masterKey ne doit exister qu'en MÉMOIRE (sessionStorage, jamais localStorage)
 * - Le vaultSalt est PUBLIC (non secret), stocké côté serveur
 */

// Déclarer argon2 comme variable globale (chargé via script dans index.html)
declare global {
  interface Window {
    argon2: any;
  }
}

// Fonction pour attendre que argon2 soit chargé
async function waitForArgon2() {
  return new Promise((resolve) => {
    if (window.argon2) {
      resolve(window.argon2);
      return;
    }

    // Attendre que le script soit chargé
    const checkInterval = setInterval(() => {
      if (window.argon2) {
        clearInterval(checkInterval);
        resolve(window.argon2);
      }
    }, 50);
  });
}

/**
 * Dérive la masterKey du vault depuis le mot de passe et le vaultSalt
 *
 * UTILISATION:
 * - Après register/login, le serveur retourne le vaultSalt
 * - On appelle cette fonction pour dériver la masterKey
 * - La masterKey est stockée en sessionStorage (volatile)
 *
 * @param password - Mot de passe de l'utilisateur (en clair)
 * @param vaultSalt - Sel aléatoire généré par le serveur (encodé en base64)
 * @returns masterKey encodée en base64 (32 bytes)
 */
export async function deriveMasterKey(
  password: string,
  vaultSalt: string,
): Promise<string> {
  try {
    console.log('🔍 DEBUG - vaultSalt reçu:', vaultSalt);
    console.log('🔍 DEBUG - type de vaultSalt:', typeof vaultSalt);
    console.log('🔍 DEBUG - vaultSalt est undefined?', vaultSalt === undefined);
    console.log('🔍 DEBUG - vaultSalt est null?', vaultSalt === null);

    if (!vaultSalt) {
      throw new Error('vaultSalt est manquant ou vide');
    }

    // Attendre que argon2-browser soit chargé depuis le script global
    console.log('🔍 DEBUG - Attente de argon2-browser...');
    const argon2 = await waitForArgon2();
    console.log('🔍 DEBUG - argon2 disponible:', argon2);
    console.log('🔍 DEBUG - argon2.hash:', typeof argon2.hash);

    // Décoder le salt depuis base64
    console.log('🔍 DEBUG - Tentative de décodage base64...');
    const saltArray = Uint8Array.from(atob(vaultSalt), (c) => c.charCodeAt(0));
    console.log('🔍 DEBUG - Salt décodé, longueur:', saltArray.length);

    // Dériver la clé avec Argon2id (mêmes paramètres que le cours)
    console.log('🔍 DEBUG - Appel argon2.hash...');
    const result = await argon2.hash({
      pass: password,
      salt: saltArray,
      type: 2, // Argon2id
      mem: 65536, // 64 MB (memoryCost)
      time: 3, // 3 itérations (timeCost)
      parallelism: 4, // 4 threads
      hashLen: 32, // 256 bits = 32 bytes
    });
    console.log('✅ DEBUG - argon2.hash terminé');

    // Retourner le hash encodé en base64
    const masterKey = btoa(String.fromCharCode(...result.hash));
    console.log('✅ DEBUG - masterKey générée, longueur:', masterKey.length);
    return masterKey;
  } catch (error) {
    console.error('❌ Erreur lors de la dérivation de la masterKey:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'N/A');
    throw new Error('Impossible de dériver la masterKey');
  }
}

/**
 * Chiffre des données avec la masterKey (AES-GCM)
 *
 * SÉCURITÉ:
 * - AES-256-GCM (authentified encryption)
 * - Nonce aléatoire de 12 bytes (96 bits) par chiffrement
 * - Le nonce est stocké avec le ciphertext (pas secret)
 *
 * @param data - Données à chiffrer (string ou objet)
 * @param masterKey - masterKey encodée en base64
 * @returns Données chiffrées encodées en base64 (nonce + ciphertext + tag)
 */
export async function encryptData(
  data: string | object,
  masterKey: string,
): Promise<string> {
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

  // Générer un nonce aléatoire de 12 bytes (CRUCIAL : unique par chiffrement)
  const nonce = crypto.getRandomValues(new Uint8Array(12));

  // Chiffrer avec AES-GCM
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: nonce,
      tagLength: 128, // 128 bits pour le tag d'authentification
    },
    key,
    dataBuffer,
  );

  // Combiner nonce + ciphertext (le tag est inclus dans encryptedBuffer)
  const encryptedArray = new Uint8Array(encryptedBuffer);
  const combined = new Uint8Array(nonce.length + encryptedArray.length);
  combined.set(nonce, 0);
  combined.set(encryptedArray, nonce.length);

  // Retourner en base64
  return btoa(String.fromCharCode(...combined));
}

/**
 * Déchiffre des données avec la masterKey
 *
 * @param encryptedData - Données chiffrées encodées en base64 (nonce + ciphertext + tag)
 * @param masterKey - masterKey encodée en base64
 * @returns Données déchiffrées (string) ou null si échec
 */
export async function decryptData(
  encryptedData: string,
  masterKey: string,
): Promise<string | null> {
  try {
    // Décoder depuis base64
    const combined = Uint8Array.from(atob(encryptedData), (c) =>
      c.charCodeAt(0),
    );

    // Extraire le nonce (12 premiers bytes) et le ciphertext (reste)
    const nonce = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    // Décoder la masterKey
    const keyData = Uint8Array.from(atob(masterKey), (c) => c.charCodeAt(0));

    // Importer la clé pour AES-GCM
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      'AES-GCM',
      false,
      ['decrypt'],
    );

    // Déchiffrer
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: nonce,
        tagLength: 128,
      },
      key,
      encrypted,
    );

    // Convertir en string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('❌ Erreur lors du déchiffrement:', error);
    return null;
  }
}
