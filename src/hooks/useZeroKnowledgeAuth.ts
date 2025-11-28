import { useState } from 'react';
import { deriveMasterKey } from '../utils/crypto';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/v1';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  vaultSalt: string;
  isActive: boolean;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  vaultSalt: string;
}

export function useZeroKnowledgeAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [masterKey, setMasterKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Inscription avec l'architecture hybride
   */
  const register = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    dateOfBirth?: string,
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(' Dérivation des clés...');

      // 1. Dériver masterKey et authKey
      const mk = await deriveMasterKey(password, email);
      const ak = await deriveAuthKey(password, email);
      const ah = await hashAuthKey(ak);

      console.log('✅ Clés dérivées');
      console.log('📤 Envoi au serveur...');

      // 1. Envoyer le password en clair au serveur (chiffré par HTTPS)
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password, // ✅ Password envoyé en clair
          firstName,
          lastName,
          dateOfBirth,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'inscription');
      }

      const data: AuthResponse = await response.json();
      console.log('✅ [REGISTER] Inscription réussie, vaultSalt reçu');

      // 2. Dériver la masterKey avec le vaultSalt reçu du serveur
      console.log('🔑 [REGISTER] Dérivation de la masterKey avec Argon2id...');
      const mk = await deriveMasterKey(password, data.vaultSalt);
      console.log('✅ [REGISTER] MasterKey dérivée');

      // 3. Stocker la masterKey et les tokens
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
   * Connexion avec l'architecture hybride
   */
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔐 [LOGIN] Envoi au serveur...');

      // 1. Envoyer le password en clair au serveur (chiffré par HTTPS)
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password, // ✅ Password envoyé en clair
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Identifiants invalides');
      }

      const data: AuthResponse = await response.json();
      console.log('✅ [LOGIN] Connexion réussie, vaultSalt reçu');

      // 2. Dériver la masterKey avec le vaultSalt reçu du serveur
      console.log('🔑 [LOGIN] Dérivation de la masterKey avec Argon2id...');
      const mk = await deriveMasterKey(password, data.vaultSalt);
      console.log('✅ [LOGIN] MasterKey dérivée');

      // 3. Stocker la masterKey et les tokens
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

  // Déconnexion
   
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

