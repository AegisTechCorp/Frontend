/**
 * Utilitaires cryptographiques côté client pour l'architecture Zero-Knowledge
 *
 * IMPORTANT:
 * - La masterKey ne doit JAMAIS quitter le client
 * - Seul l'authHash est envoyé au serveur
 * - La masterKey sert à chiffrer/déchiffrer les données sensibles
 */

/**
 * Dérive la masterKey depuis le mot de passe de l'utilisateur
 * Cette clé est utilisée pour chiffrer/déchiffrer les données sensibles
 * ATTENTION: Cette clé ne doit JAMAIS être envoyée au serveur
 *
 * @param password - Mot de passe de l'utilisateur
 * @param email - Email de l'utilisateur (utilisé comme sel)
 * @returns La masterKey encodée en base64
 */
export async function deriveMasterKey(
  password: string,
  email: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const salt = encoder.encode(`${email}_master_v1`);
  const passwordData = encoder.encode(password);

  // Importer le mot de passe comme clé
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  // Dériver la masterKey avec PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000, // 100k itérations (ajustable selon les besoins de sécurité)
      hash: 'SHA-256',
    },
    keyMaterial,
    256, // 256 bits = 32 bytes
  );

  // Convertir en base64
  const keyArray = new Uint8Array(derivedBits);
  return btoa(String.fromCharCode(...keyArray));
}

/**
 * Dérive l'authKey depuis le mot de passe de l'utilisateur
 * Cette clé est hashée avec SHA-256 avant d'être envoyée au serveur
 *
 * @param password - Mot de passe de l'utilisateur
 * @param email - Email de l'utilisateur (utilisé comme sel)
 * @returns L'authKey encodée en base64
 */
export async function deriveAuthKey(
  password: string,
  email: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const salt = encoder.encode(`${email}_auth_v1`);
  const passwordData = encoder.encode(password);

  // Importer le mot de passe comme clé
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  // Dériver l'authKey avec PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000, // 100k itérations
      hash: 'SHA-256',
    },
    keyMaterial,
    256, // 256 bits = 32 bytes
  );

  // Convertir en base64
  const keyArray = new Uint8Array(derivedBits);
  return btoa(String.fromCharCode(...keyArray));
}

/**
 * Hashe l'authKey avec SHA-256 pour créer l'authHash
 * C'est cet authHash qui est envoyé au serveur (jamais l'authKey brute)
 *
 * @param authKey - L'authKey dérivée du mot de passe
 * @returns L'authHash encodé en base64 (44 caractères)
 */
export async function hashAuthKey(authKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const authKeyData = encoder.encode(authKey);

  // Hasher avec SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', authKeyData);

  // Convertir en base64
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
