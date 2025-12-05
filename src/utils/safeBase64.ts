/**
 * Module de décodage base64 sécurisé et robuste
 * Remplace atob/btoa avec des versions qui gèrent tous les cas edge
 */

/**
 * Normalise une chaîne base64 pour la rendre décodable
 */
export function normalizeBase64(input: string): string {
  if (!input || typeof input !== 'string') {
    throw new Error('Base64 input must be a non-empty string');
  }

  let normalized = input.trim().replace(/\s+/g, '');

  normalized = normalized.replace(/-/g, '+').replace(/_/g, '/');

  const paddingNeeded = (4 - (normalized.length % 4)) % 4;
  normalized += '='.repeat(paddingNeeded);

  return normalized;
}

/**
 * Valide qu'une chaîne est du base64 valide
 */
export function isValidBase64(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  try {
    const normalized = normalizeBase64(input);
    
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(normalized)) {
      return false;
    }

    atob(normalized);
    return true;
  } catch {
    return false;
  }
}

/**
 * Analyse détaillée d'une chaîne base64
 */
export function analyzeBase64(input: string): {
  isValid: boolean;
  originalLength: number;
  normalizedLength: number;
  hasWhitespace: boolean;
  isUrlSafe: boolean;
  hasInvalidChars: boolean;
  invalidChars: string[];
  paddingNeeded: number;
  error?: string;
} {
  const result = {
    isValid: false,
    originalLength: input?.length || 0,
    normalizedLength: 0,
    hasWhitespace: false,
    isUrlSafe: false,
    hasInvalidChars: false,
    invalidChars: [] as string[],
    paddingNeeded: 0,
    error: undefined as string | undefined
  };

  if (!input || typeof input !== 'string') {
    result.error = 'Input is not a string';
    return result;
  }

  result.hasWhitespace = /\s/.test(input);

  result.isUrlSafe = /-|_/.test(input);

  try {
    const normalized = normalizeBase64(input);
    result.normalizedLength = normalized.length;
    result.paddingNeeded = (4 - (input.trim().replace(/\s+/g, '').length % 4)) % 4;

    const invalidMatches = normalized.match(/[^A-Za-z0-9+/=]/g);
    if (invalidMatches) {
      result.hasInvalidChars = true;
      result.invalidChars = [...new Set(invalidMatches)];
      result.error = `Invalid characters: ${result.invalidChars.join(', ')}`;
      return result;
    }

    atob(normalized);
    result.isValid = true;
  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown decode error';
  }

  return result;
}

/**
 * Version sécurisée de atob qui gère tous les cas edge
 */
export function safeBase64Decode(input: string): string {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input: must be a non-empty string');
  }

  try {
    const normalized = normalizeBase64(input);
    return atob(normalized);
  } catch (error) {
    const analysis = analyzeBase64(input);
    throw new Error(`Failed to decode base64: ${analysis.error || 'unknown error'}`);
  }
}

/**
 * Version sécurisée de btoa
 */
export function safeBase64Encode(input: string): string {
  if (typeof input !== 'string') {
    throw new Error('Invalid input: must be a string');
  }

  try {
    return btoa(input);
  } catch (error) {
    throw new Error(`Failed to encode base64: ${error instanceof Error ? error.message : 'unknown error'}`);
  }
}

/**
 * Encode des données binaires (Uint8Array) en base64
 */
export function encodeBytes(bytes: Uint8Array): string {
  let binaryString = '';
  
  for (let i = 0; i < bytes.length; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  
  return safeBase64Encode(binaryString);
}

/**
 * Décode du base64 en données binaires (Uint8Array)
 */
export function decodeBytes(base64: string): Uint8Array {
  const binaryString = safeBase64Decode(base64);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return bytes;
}
