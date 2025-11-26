# 📡 API Documentation - Architecture Hybride (Auth + Vault)

## ⚠️ Changements Majeurs

L'API d'authentification a migré vers une **architecture hybride** :
- ✅ **Authentification classique** : envoi du password en clair via HTTPS
- ✅ **Vault Zero-Knowledge** : dérivation client-side de la masterKey avec Argon2id

### Ce qui a changé :

- ❌ Plus de `authHash` envoyé par le client
- ✅ Envoi du `password` en clair (chiffré par HTTPS)
- ✅ Réception du `vaultSalt` pour dériver la masterKey

---

## 🔐 Endpoints d'Authentification

### 1️⃣ POST /api/v1/auth/register

**Requête :**
```json
{
  "email": "user@example.com",
  "password": "MySecurePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-15"
}
```

**Réponse (200) :**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-15",
    "vaultSalt": "A9eZh68osLgxvGnf4dDfuJMO/wFQ8X/w6n/71ZSralg=",
    "isActive": true,
    "createdAt": "2025-11-26T14:00:00.000Z",
    "updatedAt": "2025-11-26T14:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "vaultSalt": "A9eZh68osLgxvGnf4dDfuJMO/wFQ8X/w6n/71ZSralg="
}
```

⭐ **Important :**
- Le `vaultSalt` est retourné à deux endroits : dans `user.vaultSalt` ET en top-level
- Utilisez le `vaultSalt` top-level pour dériver la masterKey
- Le `refreshToken` est envoyé dans un cookie HttpOnly

---

### 2️⃣ POST /api/v1/auth/login

**Requête :**
```json
{
  "email": "user@example.com",
  "password": "MySecurePassword123"
}
```

**Réponse (200) :**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "vaultSalt": "A9eZh68osLgxvGnf4dDfuJMO/wFQ8X/w6n/71ZSralg=",
    ...
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "vaultSalt": "A9eZh68osLgxvGnf4dDfuJMO/wFQ8X/w6n/71ZSralg="
}
```

---

## 🔑 Dérivation de la MasterKey (Frontend)

### Installation de argon2-browser

```bash
npm install argon2-browser
npm install --save-dev vite-plugin-wasm vite-plugin-top-level-await
```

### Configuration Vite (vite.config.js)

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait()
  ],
  optimizeDeps: {
    exclude: ['argon2-browser'],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  build: {
    target: 'esnext'
  }
})
```

### Code de dérivation (crypto.utils.ts)

```typescript
import { hash as argon2Hash } from 'argon2-browser';

export async function deriveMasterKey(
  password: string,
  vaultSalt: string,
): Promise<string> {
  // Décoder le salt depuis base64
  const saltArray = Uint8Array.from(atob(vaultSalt), (c) => c.charCodeAt(0));

  // Dériver la clé avec Argon2id
  const result = await argon2Hash({
    pass: password,
    salt: saltArray,
    type: 2, // Argon2id
    mem: 65536, // 64 MB
    time: 3, // 3 itérations
    parallelism: 4, // 4 threads
    hashLen: 32, // 256 bits = 32 bytes
  });

  // Retourner le hash encodé en base64
  return btoa(String.fromCharCode(...result.hash));
}
```

### ⚠️ PARAMÈTRES ARGON2 CRITIQUES

**IMPORTANT : Utilisez EXACTEMENT ces paramètres !**

```javascript
{
  type: 2,          // Argon2id (NE PAS CHANGER)
  mem: 65536,       // 64 MB (NE PAS CHANGER)
  time: 3,          // 3 itérations (NE PAS CHANGER)
  parallelism: 4,   // 4 threads (NE PAS CHANGER)
  hashLen: 32,      // 32 bytes (NE PAS CHANGER)
}
```

❗ **Si vous changez ces paramètres, la masterKey sera différente !**

---

## 🔄 Flux Complet (Register)

```typescript
// 1. L'utilisateur remplit le formulaire
const userData = {
  email: "user@example.com",
  password: "MySecurePassword123",
  firstName: "John",
  lastName: "Doe",
  dateOfBirth: "1990-01-15"
};

// 2. Envoyer la requête au backend
const response = await fetch('/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Pour les cookies HttpOnly
  body: JSON.stringify(userData)
});

const result = await response.json();

// 3. Dériver la masterKey avec le vaultSalt reçu
const masterKey = await deriveMasterKey(
  userData.password,
  result.vaultSalt
);

// 4. Stocker la masterKey en sessionStorage (volatile)
sessionStorage.setItem('masterKey', masterKey);

// 5. Stocker l'accessToken
localStorage.setItem('accessToken', result.accessToken);

// 6. Stocker les infos utilisateur
localStorage.setItem('user', JSON.stringify(result.user));
```

---

## 🔄 Flux Complet (Login)

```typescript
// 1. L'utilisateur se connecte
const credentials = {
  email: "user@example.com",
  password: "MySecurePassword123"
};

// 2. Envoyer la requête au backend
const response = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify(credentials)
});

const result = await response.json();

// 3. Dériver la masterKey
const masterKey = await deriveMasterKey(
  credentials.password,
  result.vaultSalt
);

// 4. Stocker en sessionStorage
sessionStorage.setItem('masterKey', masterKey);
localStorage.setItem('accessToken', result.accessToken);
localStorage.setItem('user', JSON.stringify(result.user));
```

---

## 🗃️ Stockage des Données

| Donnée       | Stockage                       | Raison                                                   |
|--------------|--------------------------------|----------------------------------------------------------|
| masterKey    | sessionStorage                 | Volatile, disparaît à la fermeture du navigateur ✅      |
| accessToken  | localStorage OU sessionStorage | Selon votre choix (courte durée = 15min)                |
| user         | localStorage                   | Infos non sensibles                                      |
| refreshToken | Cookie HttpOnly                | Géré automatiquement par le backend ✅                   |

---

## 🛡️ Sécurité

### ✅ À FAIRE :

- Utiliser HTTPS en production (obligatoire !)
- Stocker la masterKey en sessionStorage uniquement
- Effacer la masterKey à la déconnexion
- Ne JAMAIS envoyer la masterKey au serveur

### ❌ À NE PAS FAIRE :

- Stocker la masterKey en localStorage
- Stocker la masterKey dans un cookie
- Logger la masterKey en console (en production)
- Hasher le password côté client avant envoi

---

## 📦 Type Definitions (TypeScript)

```typescript
// types/auth.ts

export interface RegisterDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string; // Format: YYYY-MM-DD
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  vaultSalt: string; // Base64 encoded
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  vaultSalt: string; // Base64 encoded - USE THIS for masterKey derivation
}
```

---

## 🧪 Test de l'API

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

---

## ❓ FAQ

**Q : Pourquoi envoyer le password en clair ?**
A : HTTPS chiffre tout le trafic. C'est la pratique standard de tous les sites web.

**Q : Le vaultSalt est-il secret ?**
A : Non, le vaultSalt est PUBLIC. C'est normal, il est stocké en base de données.

**Q : Pourquoi argon2-browser et pas crypto.subtle ?**
A : Argon2 est spécialement conçu pour dériver des clés depuis des mots de passe. PBKDF2 (crypto.subtle) est moins sécurisé.

**Q : Que faire si l'utilisateur perd sa masterKey ?**
A : La masterKey ne peut pas être récupérée. Prévoyez un système de récupération (clé de récupération, etc.).

---

## 🔄 Migration depuis l'ancienne architecture

### Avant (Zero-Knowledge pur) :
```typescript
// ❌ ANCIEN CODE
const authKey = await deriveAuthKey(password, email);
const authHash = await hashAuthKey(authKey);
// Envoi de authHash au serveur
```

### Après (Hybride) :
```typescript
// ✅ NOUVEAU CODE
// 1. Envoyer password en clair
const response = await fetch('/auth/register', {
  body: JSON.stringify({ email, password })
});

const { vaultSalt } = await response.json();

// 2. Dériver masterKey avec le vaultSalt reçu
const masterKey = await deriveMasterKey(password, vaultSalt);
```

---

## 📚 Références

- [Argon2 Specification](https://github.com/P-H-C/phc-winner-argon2)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
