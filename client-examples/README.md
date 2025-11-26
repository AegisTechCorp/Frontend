# Exemples Client - Architecture Zero-Knowledge

Ce répertoire contient des exemples d'implémentation côté client pour l'architecture Zero-Knowledge.

## Installation

Copiez les fichiers dans votre projet frontend React et installez les dépendances nécessaires:

```bash
npm install --save tweetnacl tweetnacl-util
```

## Fichiers

### `crypto.utils.ts`
Contient toutes les fonctions cryptographiques nécessaires:
- Dérivation de clés (masterKey, authKey)
- Hashing de l'authKey
- Chiffrement/Déchiffrement AES-GCM
- Génération de clé de récupération

### `auth.example.ts`
Contient des exemples d'utilisation pour:
- Inscription d'un utilisateur
- Connexion d'un utilisateur
- Déconnexion
- Rafraîchissement des tokens
- Envoi/Récupération de données chiffrées
- Hook React personnalisé

## Architecture Zero-Knowledge - Principe

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                       │
│                                                               │
│  Password ──┐                                                 │
│             ├──> PBKDF2 ──> MasterKey (stockée en session)   │
│  Email ─────┤                    │                            │
│             │                    └──> Chiffrement des données │
│             │                                                 │
│             └──> PBKDF2 ──> AuthKey                           │
│                               │                               │
│                               └──> SHA-256 ──> AuthHash       │
│                                                  │            │
└──────────────────────────────────────────────────┼────────────┘
                                                   │
                                    Envoi au serveur (HTTPS)
                                                   │
                                                   ▼
┌─────────────────────────────────────────────────────────────┐
│                     SERVEUR (NestJS)                         │
│                                                               │
│  AuthHash ──> Argon2id ──> FinalHash (stocké en BDD)         │
│                                                               │
│  ⚠️  Le serveur ne voit JAMAIS:                              │
│     - Le mot de passe                                         │
│     - La masterKey                                            │
│     - L'authKey                                               │
│     - Les données déchiffrées                                 │
└─────────────────────────────────────────────────────────────┘
```

## Flux d'inscription

1. **Client**: L'utilisateur saisit son email et password
2. **Client**: Dérivation de `masterKey` depuis `password + email`
3. **Client**: Dérivation de `authKey` depuis `password + email`
4. **Client**: Hashing de `authKey` avec SHA-256 → `authHash`
5. **Client**: Envoi de `email + authHash` au serveur
6. **Serveur**: Hashing de `authHash` avec Argon2id → `finalHash`
7. **Serveur**: Stockage de `email + finalHash` en base de données
8. **Serveur**: Génération et envoi des JWT tokens
9. **Client**: Stockage de `masterKey` en sessionStorage

## Flux de connexion

1. **Client**: L'utilisateur saisit son email et password
2. **Client**: Re-dérivation de `masterKey` et `authKey`
3. **Client**: Hashing de `authKey` → `authHash`
4. **Client**: Envoi de `email + authHash` au serveur
5. **Serveur**: Vérification de `authHash` avec Argon2
6. **Serveur**: Génération et envoi des JWT tokens
7. **Client**: Stockage de `masterKey` en sessionStorage

## Utilisation dans React

### 1. Copier les fichiers

```
src/
  utils/
    crypto.utils.ts    <- Copier depuis client-examples/
  hooks/
    useAuth.ts         <- Adapter depuis auth.example.ts
```

### 2. Exemple d'utilisation dans un composant

```tsx
import { useZeroKnowledgeAuth } from './hooks/useAuth';

function LoginPage() {
  const { login, isAuthenticated } = useZeroKnowledgeAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Redirection après connexion réussie
    } catch (error) {
      console.error('Erreur de connexion:', error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mot de passe"
      />
      <button type="submit">Se connecter</button>
    </form>
  );
}
```

### 3. Exemple de chiffrement de données

```tsx
import { encryptData, decryptData } from './utils/crypto.utils';

function SecureDataComponent() {
  const { masterKey } = useZeroKnowledgeAuth();

  const saveSecureData = async (data: object) => {
    if (!masterKey) {
      throw new Error('Vous devez être connecté');
    }

    // Chiffrer les données
    const encrypted = await encryptData(data, masterKey);

    // Envoyer au serveur
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ encryptedData: encrypted }),
    });
  };

  const loadSecureData = async (dataId: string) => {
    if (!masterKey) {
      throw new Error('Vous devez être connecté');
    }

    // Récupérer depuis le serveur
    const response = await fetch(`/api/data/${dataId}`);
    const { encryptedData } = await response.json();

    // Déchiffrer les données
    const decrypted = await decryptData(encryptedData, masterKey);
    return JSON.parse(decrypted);
  };

  return (
    // Votre composant
  );
}
```

## Points de sécurité importants

### ✅ À FAIRE:
- Stocker la masterKey en `sessionStorage` (ou en mémoire via React state)
- Toujours utiliser HTTPS pour les communications
- Valider les entrées utilisateur côté client ET serveur
- Implémenter un timeout de session
- Demander à l'utilisateur de sauvegarder une clé de récupération

### ❌ À NE JAMAIS FAIRE:
- Stocker la masterKey dans `localStorage`
- Envoyer le password ou la masterKey au serveur
- Logger la masterKey ou les données non chiffrées
- Stocker des données sensibles non chiffrées
- Utiliser HTTP au lieu de HTTPS

## Mot de passe oublié

⚠️ **IMPORTANT**: Avec l'architecture Zero-Knowledge, si l'utilisateur oublie son mot de passe, il perd l'accès à ses données chiffrées.

Solutions possibles:
1. **Clé de récupération**: Générer une clé lors de l'inscription que l'utilisateur doit sauvegarder
2. **Questions de sécurité**: Utiliser des réponses hashées pour dériver une clé de secours
3. **Avertir l'utilisateur**: Expliquer clairement les conséquences lors de l'inscription

## Tests

Vous pouvez tester les fonctions cryptographiques dans la console du navigateur:

```javascript
import { deriveMasterKey, deriveAuthKey, hashAuthKey } from './utils/crypto.utils';

// Test de dérivation
const masterKey = await deriveMasterKey('myPassword123', 'user@example.com');
console.log('MasterKey:', masterKey);

const authKey = await deriveAuthKey('myPassword123', 'user@example.com');
const authHash = await hashAuthKey(authKey);
console.log('AuthHash:', authHash);
```

## Performances

Les opérations de dérivation de clés (PBKDF2 avec 100k itérations) prennent environ:
- **Desktop**: ~100-200ms
- **Mobile**: ~300-500ms

Vous pouvez ajuster le nombre d'itérations dans `crypto.utils.ts` selon vos besoins:
- Plus d'itérations = Plus sécurisé mais plus lent
- Moins d'itérations = Plus rapide mais moins sécurisé

Recommandation: 100 000 itérations est un bon compromis en 2024.

## Support

Pour toute question ou problème:
1. Vérifiez que vous avez bien installé les dépendances
2. Vérifiez que vous utilisez HTTPS (obligatoire pour crypto.subtle)
3. Vérifiez que votre navigateur supporte l'API Web Crypto (tous les navigateurs modernes)

## Licence

Ces exemples sont fournis à titre d'illustration. Adaptez-les selon vos besoins spécifiques.
