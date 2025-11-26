import { useState } from 'react';
import { deriveMasterKey } from '../utils/crypto.utils';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/v1';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export function useZeroKnowledgeAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [masterKey, setMasterKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Inscription avec architecture Hybride
   * (Authentification Classique + Vault Zero-Knowledge)
   */
  const register = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('📤 Envoi des identifiants au serveur...');

      // 1. Envoyer le password en clair au serveur (via HTTPS)
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password, // ⬅️ Password en clair (auth classique)
          firstName,
          lastName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'inscription');
      }

      const data = await response.json();
      console.log('✅ Inscription réussie');

      // 2. Dériver la masterKey avec le vaultSalt reçu
      console.log('🔐 Dérivation de la masterKey...');
      const mk = await deriveMasterKey(password, data.vaultSalt);
      console.log('✅ MasterKey dérivée');

      // 3. Stocker la masterKey et les tokens en sessionStorage (volatile)
      sessionStorage.setItem('masterKey', mk);
      sessionStorage.setItem('accessToken', data.accessToken);

      setMasterKey(mk);
      setUser(data.user);

      return data;
    } catch (err: any) {
      console.error('❌ Erreur:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Connexion avec architecture Hybride
   * (Authentification Classique + Vault Zero-Knowledge)
   */
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('📤 Envoi des identifiants au serveur...');

      // 1. Envoyer le password en clair au serveur (via HTTPS)
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password, // ⬅️ Password en clair (auth classique)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Identifiants invalides');
      }

      const data = await response.json();
      console.log('✅ Connexion réussie');

      // 2. Dériver la masterKey avec le vaultSalt reçu
      console.log('🔐 Dérivation de la masterKey...');
      const mk = await deriveMasterKey(password, data.vaultSalt);
      console.log('✅ MasterKey dérivée');

      // 3. Stocker la masterKey et les tokens en sessionStorage (volatile)
      sessionStorage.setItem('masterKey', mk);
      sessionStorage.setItem('accessToken', data.accessToken);

      setMasterKey(mk);
      setUser(data.user);

      return data;
    } catch (err: any) {
      console.error('❌ Erreur:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Déconnexion
   */
  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    } finally {
      // Nettoyer les données locales
      sessionStorage.clear();
      setMasterKey(null);
      setUser(null);
    }
  };

  return {
    user,
    masterKey,
    isLoading,
    error,
    register,
    login,
    logout,
  };
}
