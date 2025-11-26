import { useState } from 'react';
import { deriveMasterKey, deriveAuthKey, hashAuthKey } from '../utils/crypto';

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

  //Inscription avec Zero-Knowledge
  const register = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
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

      // 2. Envoyer au serveur
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          authHash: ah,
          firstName,
          lastName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'inscription');
      }

      const data = await response.json();
      console.log('✅ Inscription réussie', data);

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

  //Connexion avec Zero-Knowledge
   
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔐 Dérivation des clés...');

      // 1. Dériver masterKey et authKey
      const mk = await deriveMasterKey(password, email);
      const ak = await deriveAuthKey(password, email);
      const ah = await hashAuthKey(ak);

      console.log('✅ Clés dérivées');
      console.log('📤 Envoi au serveur...');

      // 2. Envoyer au serveur
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          authHash: ah,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Identifiants invalides');
      }

      const data = await response.json();
      console.log('✅ Connexion réussie', data);

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

