/**
 * Exemples d'utilisation des fonctions crypto pour l'authentification Zero-Knowledge
 *
 * Ce fichier montre comment intégrer l'architecture Zero-Knowledge dans votre frontend React
 */

import React from 'react';
import {
  deriveMasterKey,
  deriveAuthKey,
  hashAuthKey,
  encryptData,
  decryptData,
} from './crypto.utils';

// Configuration de l'API
const API_URL = 'http://localhost:3000'; // URL de votre backend

/**
 * EXEMPLE 1: Inscription d'un nouvel utilisateur
 */
export async function registerUser(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string,
  dateOfBirth?: string,
) {
  try {
    // 1. Dériver la masterKey (pour chiffrement des données)
    const masterKey = await deriveMasterKey(password, email);

    // 2. Dériver l'authKey (pour authentification)
    const authKey = await deriveAuthKey(password, email);

    // 3. Hasher l'authKey pour créer l'authHash
    const authHash = await hashAuthKey(authKey);

    // 4. Envoyer la requête d'inscription au serveur
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important pour les cookies
      body: JSON.stringify({
        email,
        authHash, // On envoie l'authHash, JAMAIS le password
        firstName,
        lastName,
        dateOfBirth,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de l\'inscription');
    }

    const data = await response.json();

    // 5. Stocker la masterKey en session (mémoire ou sessionStorage)
    // ATTENTION: JAMAIS dans localStorage (persiste après fermeture)
    sessionStorage.setItem('masterKey', masterKey);
    sessionStorage.setItem('accessToken', data.accessToken);

    return {
      user: data.user,
      accessToken: data.accessToken,
      masterKey, // À conserver en mémoire pour chiffrer/déchiffrer les données
    };
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    throw error;
  }
}

/**
 * EXEMPLE 2: Connexion d'un utilisateur
 */
export async function loginUser(email: string, password: string) {
  try {
    // 1. Re-dériver la masterKey depuis le password
    const masterKey = await deriveMasterKey(password, email);

    // 2. Re-dériver l'authKey
    const authKey = await deriveAuthKey(password, email);

    // 3. Hasher l'authKey pour créer l'authHash
    const authHash = await hashAuthKey(authKey);

    // 4. Envoyer la requête de connexion au serveur
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important pour les cookies
      body: JSON.stringify({
        email,
        authHash, // On envoie l'authHash, JAMAIS le password
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la connexion');
    }

    const data = await response.json();

    // 5. Stocker la masterKey en session
    sessionStorage.setItem('masterKey', masterKey);
    sessionStorage.setItem('accessToken', data.accessToken);

    return {
      user: data.user,
      accessToken: data.accessToken,
      masterKey,
    };
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    throw error;
  }
}

/**
 * EXEMPLE 3: Déconnexion
 */
export async function logoutUser() {
  try {
    const refreshToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('refreshToken='))
      ?.split('=')[1];

    if (refreshToken) {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ refreshToken }),
      });
    }

    // Nettoyer le sessionStorage
    sessionStorage.removeItem('masterKey');
    sessionStorage.removeItem('accessToken');
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  }
}

/**
 * EXEMPLE 4: Rafraîchir l'access token
 */
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('refreshToken='))
      ?.split('=')[1];

    if (!refreshToken) {
      throw new Error('Pas de refresh token disponible');
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    sessionStorage.setItem('accessToken', data.accessToken);

    return data.accessToken;
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token:', error);
    return null;
  }
}

/**
 * EXEMPLE 5: Envoyer des données sensibles chiffrées au serveur
 */
export async function saveEncryptedData(dataToEncrypt: object) {
  try {
    // 1. Récupérer la masterKey depuis le sessionStorage
    const masterKey = sessionStorage.getItem('masterKey');
    if (!masterKey) {
      throw new Error('MasterKey non disponible. Veuillez vous reconnecter.');
    }

    // 2. Chiffrer les données avec la masterKey
    const encryptedData = await encryptData(dataToEncrypt, masterKey);

    // 3. Envoyer les données chiffrées au serveur
    const accessToken = sessionStorage.getItem('accessToken');
    const response = await fetch(`${API_URL}/api/sensitive-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
      body: JSON.stringify({ encryptedData }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'enregistrement des données');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors du chiffrement/envoi:', error);
    throw error;
  }
}

/**
 * EXEMPLE 6: Récupérer et déchiffrer des données depuis le serveur
 */
export async function fetchEncryptedData(dataId: string) {
  try {
    // 1. Récupérer les données chiffrées depuis le serveur
    const accessToken = sessionStorage.getItem('accessToken');
    const response = await fetch(`${API_URL}/api/sensitive-data/${dataId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des données');
    }

    const { encryptedData } = await response.json();

    // 2. Récupérer la masterKey
    const masterKey = sessionStorage.getItem('masterKey');
    if (!masterKey) {
      throw new Error('MasterKey non disponible. Veuillez vous reconnecter.');
    }

    // 3. Déchiffrer les données
    const decryptedString = await decryptData(encryptedData, masterKey);
    if (!decryptedString) {
      throw new Error('Erreur lors du déchiffrement des données');
    }

    // 4. Parser les données déchiffrées
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Erreur lors de la récupération/déchiffrement:', error);
    throw error;
  }
}

/**
 * EXEMPLE 7: Hook React pour l'authentification Zero-Knowledge
 */
export function useZeroKnowledgeAuth() {
  // État local pour gérer l'utilisateur et la masterKey
  const [user, setUser] = React.useState(null);
  const [masterKey, setMasterKey] = React.useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  // Fonction d'inscription
  const register = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ) => {
    const result = await registerUser(email, password, firstName, lastName);
    setUser(result.user);
    setMasterKey(result.masterKey);
    setIsAuthenticated(true);
    return result;
  };

  // Fonction de connexion
  const login = async (email: string, password: string) => {
    const result = await loginUser(email, password);
    setUser(result.user);
    setMasterKey(result.masterKey);
    setIsAuthenticated(true);
    return result;
  };

  // Fonction de déconnexion
  const logout = async () => {
    await logoutUser();
    setUser(null);
    setMasterKey(null);
    setIsAuthenticated(false);
  };

  // Vérifier si l'utilisateur est connecté au chargement
  React.useEffect(() => {
    const storedMasterKey = sessionStorage.getItem('masterKey');
    const storedAccessToken = sessionStorage.getItem('accessToken');

    if (storedMasterKey && storedAccessToken) {
      setMasterKey(storedMasterKey);
      setIsAuthenticated(true);
      // TODO: Récupérer les infos de l'utilisateur depuis le token ou l'API
    }
  }, []);

  return {
    user,
    masterKey,
    isAuthenticated,
    register,
    login,
    logout,
  };
}

// Note: Ajoutez "import React from 'react';" en haut du fichier si vous utilisez le hook React
