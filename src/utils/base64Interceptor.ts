/**
 * Intercepteur global pour atob/btoa
 * Ce module intercepte tous les appels à atob() pour fournir de meilleurs messages d'erreur
 */

import { safeBase64Decode, safeBase64Encode } from './safeBase64';

const nativeAtob = window.atob;
const nativeBtoa = window.btoa;

let interceptorEnabled = false;

/**
 * Active l'intercepteur global atob/btoa
 */
export function enableBase64Interceptor() {
  if (interceptorEnabled) {
    return;
  }

  interceptorEnabled = true;

  window.atob = function(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }
    
    try {
      return nativeAtob(input);
    } catch (error) {
      try {
        return safeBase64Decode(input);
      } catch (safeError) {
        throw error;
      }
    }
  };

  window.btoa = function (input: string): string {
    try {
      return nativeBtoa(input);
    } catch (error) {
      try {
        return safeBase64Encode(input);
      } catch {
        throw error;
      }
    }
  };

  interceptorEnabled = true;
}

/**
 * Désactive l'intercepteur et restaure les fonctions natives
 */
export function disableBase64Interceptor() {
  if (!interceptorEnabled) {
    return;
  }

  window.atob = nativeAtob;
  window.btoa = nativeBtoa;
  interceptorEnabled = false;
  
  console.log('🔧 Global base64 interceptor disabled');
}

/**
 * Vérifie si l'intercepteur est actif
 */
export function isInterceptorEnabled(): boolean {
  return interceptorEnabled;
}
