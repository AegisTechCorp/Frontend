# Guide d'Implémentation Zero-Knowledge - Backend

Ce guide détaille toutes les modifications nécessaires côté backend pour implémenter l'authentification zero-knowledge.

## 🔐 Principe

Le frontend envoie maintenant un **hash SHA-256 de l'authKey** (dérivée via PBKDF2) au lieu du mot de passe original. Le backend doit :

1. **Accepter ce hash comme "password"** dans les DTOs
2. **Hasher ce hash avec Argon2** avant de le stocker en base
3. **Comparer les hashs** lors de la connexion
4. **Ne jamais avoir accès** au mot de passe original ou à la masterKey

---

## 📝 Modifications Requises

### 1. Modifier le DTO d'Inscription (RegisterDto)

**Avant :**
```typescript
export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])/)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsDateString()
  dateOfBirth: string;
}
```

**Après :**
```typescript
export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(12)  // Le hash base64 fait 44 caractères, donc OK
  @MaxLength(128)
  // ⚠️ IMPORTANT: Ne plus valider le format du password
  // Car c'est maintenant un hash, pas un mot de passe
  password: string;  // Reçoit le hash de l'authKey depuis le frontend

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsDateString()
  dateOfBirth: string;
}
```

**Points clés :**
- ✅ Garder `password` comme nom de champ (pour compatibilité)
- ✅ Supprimer la validation `@Matches()` (le hash n'a pas de format de mot de passe)
- ✅ Garder `@MinLength(12)` et `@MaxLength(128)` (le hash base64 fait 44 caractères)

---

### 2. Modifier le DTO de Connexion (LoginDto)

**Avant :**
```typescript
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
```

**Après :**
```typescript
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password: string;  // Reçoit le hash de l'authKey depuis le frontend
}
```

---

### 3. Modifier l'Entité User

**Avant :**
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;  // Hash bcrypt du mot de passe

  // ... autres champs
}
```

**Après :**
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ length: 255 })
  password: string;  // Hash Argon2 du hash SHA-256 de l'authKey

  // ... autres champs
}
```

**Points clés :**
- ✅ Le champ s'appelle toujours `password` (pas besoin de migration)
- ✅ Stocke le hash Argon2 du hash SHA-256 reçu du frontend
- ✅ Le backend ne stocke JAMAIS le mot de passe original

---

### 4. Modifier le Service d'Inscription

**Avant :**
```typescript
async register(registerDto: RegisterDto): Promise<AuthResponse> {
  // Vérifier si l'email existe déjà
  const existingUser = await this.userRepository.findOne({
    where: { email: registerDto.email }
  });
  
  if (existingUser) {
    throw new ConflictException('Email déjà utilisé');
  }

  // Hasher le mot de passe avec bcrypt
  const hashedPassword = await bcrypt.hash(registerDto.password, 10);

  // Créer l'utilisateur
  const user = this.userRepository.create({
    email: registerDto.email,
    password: hashedPassword,
    firstName: registerDto.firstName,
    lastName: registerDto.lastName,
    dateOfBirth: registerDto.dateOfBirth,
  });

  await this.userRepository.save(user);

  // Générer le token
  const token = this.jwtService.sign({ userId: user.id, email: user.email });

  return {
    accessToken: token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      birthDate: user.dateOfBirth,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
}
```

**Après :**
```typescript
import * as argon2 from 'argon2';

async register(registerDto: RegisterDto): Promise<AuthResponse> {
  // Vérifier si l'email existe déjà
  const existingUser = await this.userRepository.findOne({
    where: { email: registerDto.email }
  });
  
  if (existingUser) {
    throw new ConflictException('Email déjà utilisé');
  }

  // ⚠️ IMPORTANT: Le "password" reçu est déjà un hash SHA-256 de l'authKey
  // On le hash à nouveau avec Argon2 pour le stockage
  // Le backend ne voit JAMAIS le mot de passe original
  const hashedPassword = await argon2.hash(registerDto.password, {
    type: argon2.argon2id,
    memoryCost: 65536,  // 64 MB
    timeCost: 3,       // 3 itérations
    parallelism: 4,
  });

  // Créer l'utilisateur
  const user = this.userRepository.create({
    email: registerDto.email,
    password: hashedPassword,  // Hash Argon2 du hash SHA-256
    firstName: registerDto.firstName,
    lastName: registerDto.lastName,
    dateOfBirth: registerDto.dateOfBirth,
  });

  await this.userRepository.save(user);

  // Générer le token
  const token = this.jwtService.sign({ userId: user.id, email: user.email });

  return {
    accessToken: token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      birthDate: user.dateOfBirth,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
}
```

**Points clés :**
- ✅ Utiliser **Argon2** au lieu de bcrypt (plus sécurisé pour les hashs)
- ✅ Le `registerDto.password` est déjà un hash SHA-256, on le hash à nouveau
- ✅ Le backend ne voit jamais le mot de passe original

---

### 5. Modifier le Service de Connexion

**Avant :**
```typescript
async login(loginDto: LoginDto): Promise<AuthResponse> {
  // Trouver l'utilisateur
  const user = await this.userRepository.findOne({
    where: { email: loginDto.email }
  });

  if (!user) {
    throw new UnauthorizedException('Email ou mot de passe incorrect');
  }

  // Vérifier le mot de passe avec bcrypt
  const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedException('Email ou mot de passe incorrect');
  }

  // Générer le token
  const token = this.jwtService.sign({ userId: user.id, email: user.email });

  return {
    accessToken: token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      birthDate: user.dateOfBirth,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
}
```

**Après :**
```typescript
import * as argon2 from 'argon2';

async login(loginDto: LoginDto): Promise<AuthResponse> {
  // Trouver l'utilisateur
  const user = await this.userRepository.findOne({
    where: { email: loginDto.email }
  });

  if (!user) {
    throw new UnauthorizedException('Email ou mot de passe incorrect');
  }

  // ⚠️ IMPORTANT: Le "password" reçu est un hash SHA-256 de l'authKey
  // On le compare avec le hash Argon2 stocké en base
  const isPasswordValid = await argon2.verify(user.password, loginDto.password);

  if (!isPasswordValid) {
    throw new UnauthorizedException('Email ou mot de passe incorrect');
  }

  // Générer le token
  const token = this.jwtService.sign({ userId: user.id, email: user.email });

  return {
    accessToken: token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      birthDate: user.dateOfBirth,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
}
```

**Points clés :**
- ✅ Utiliser `argon2.verify()` au lieu de `bcrypt.compare()`
- ✅ Le `loginDto.password` est le hash SHA-256 envoyé par le frontend
- ✅ On compare ce hash avec le hash Argon2 stocké en base

---

### 6. Installer Argon2

```bash
npm install argon2
npm install --save-dev @types/argon2
```

---

### 7. Modifier les Endpoints de Changement de Mot de Passe

**⚠️ IMPORTANT :** Les endpoints suivants doivent aussi être modifiés pour accepter le hash :

- `POST /auth/change-password` : Accepter `currentPassword` et `newPassword` comme hashs
- `POST /auth/reset-password` : Accepter `password` comme hash
- `DELETE /auth/delete-account` : Accepter `password` comme hash
- `POST /auth/2fa/disable` : Accepter `password` comme hash

**Exemple pour change-password :**
```typescript
async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
  const user = await this.userRepository.findOne({ where: { id: userId } });

  // Vérifier le mot de passe actuel (hash SHA-256)
  const isCurrentPasswordValid = await argon2.verify(
    user.password,
    changePasswordDto.currentPassword  // Hash SHA-256
  );

  if (!isCurrentPasswordValid) {
    throw new UnauthorizedException('Mot de passe actuel incorrect');
  }

  // Hasher le nouveau mot de passe (hash SHA-256)
  const hashedNewPassword = await argon2.hash(changePasswordDto.newPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  user.password = hashedNewPassword;
  await this.userRepository.save(user);

  return { message: 'Mot de passe changé avec succès' };
}
```

---

## 🔒 Sécurité

### Ce que le backend NE DOIT JAMAIS faire :

1. ❌ **Ne jamais stocker** le mot de passe original
2. ❌ **Ne jamais stocker** la masterKey
3. ❌ **Ne jamais logger** le password reçu (même si c'est un hash)
4. ❌ **Ne jamais envoyer** le password en clair dans les réponses

### Ce que le backend DOIT faire :

1. ✅ **Toujours hasher** le hash reçu avec Argon2 avant stockage
2. ✅ **Toujours utiliser** Argon2 pour la vérification
3. ✅ **Toujours valider** que le hash fait entre 12 et 128 caractères
4. ✅ **Toujours utiliser HTTPS** en production

---

## 📊 Flux Complet

### Inscription

```
Frontend:
1. Utilisateur saisit password: "MonSuperMotDePasse123!"
2. Dérive masterKey (reste côté client)
3. Dérive authKey
4. Hash authKey → authHash (SHA-256, base64)
5. Envoie authHash au backend comme "password"

Backend:
1. Reçoit authHash (44 caractères base64)
2. Hash authHash avec Argon2 → finalHash
3. Stocke finalHash en base de données
4. Retourne token JWT
```

### Connexion

```
Frontend:
1. Utilisateur saisit password: "MonSuperMotDePasse123!"
2. Dérive masterKey (reste côté client)
3. Dérive authKey
4. Hash authKey → authHash (SHA-256, base64)
5. Envoie authHash au backend comme "password"

Backend:
1. Reçoit authHash
2. Récupère finalHash depuis la base
3. Compare authHash avec finalHash via argon2.verify()
4. Si OK, retourne token JWT
```

---

## 🧪 Tests

### Test d'inscription
```typescript
const registerDto = {
  email: 'test@example.com',
  password: 'aBc123!@#',  // ⚠️ En production, ce sera un hash base64
  firstName: 'Test',
  lastName: 'User',
  dateOfBirth: '1990-01-01',
};

// Le backend doit accepter ce "password" et le hasher avec Argon2
```

### Test de connexion
```typescript
const loginDto = {
  email: 'test@example.com',
  password: 'aBc123!@#',  // ⚠️ En production, ce sera un hash base64
};

// Le backend doit comparer ce hash avec le hash Argon2 stocké
```

---

## ⚠️ Migration des Utilisateurs Existants

Si vous avez déjà des utilisateurs avec des mots de passe hashés en bcrypt :

1. **Option 1 : Migration progressive**
   - Détecter si le hash est bcrypt ou Argon2
   - Si bcrypt, vérifier avec bcrypt
   - Si Argon2, vérifier avec Argon2
   - Lors du prochain changement de mot de passe, migrer vers Argon2

2. **Option 2 : Forcer la réinitialisation**
   - Demander à tous les utilisateurs de réinitialiser leur mot de passe
   - Les nouveaux hashs seront en Argon2

---

## 📝 Résumé des Modifications

| Fichier | Modification |
|---------|-------------|
| `RegisterDto` | Supprimer validation `@Matches()`, garder `@MinLength(12)` et `@MaxLength(128)` |
| `LoginDto` | Ajouter `@MinLength(12)` et `@MaxLength(128)` |
| `User Entity` | Aucun changement (le champ `password` reste) |
| `AuthService.register()` | Remplacer `bcrypt.hash()` par `argon2.hash()` |
| `AuthService.login()` | Remplacer `bcrypt.compare()` par `argon2.verify()` |
| `ChangePasswordDto` | Supprimer validation `@Matches()` |
| Tous les endpoints utilisant password | Utiliser Argon2 au lieu de bcrypt |

---

## ✅ Checklist

- [ ] Installer `argon2` et `@types/argon2`
- [ ] Modifier `RegisterDto` (supprimer `@Matches()`)
- [ ] Modifier `LoginDto` (ajouter validations de longueur)
- [ ] Modifier `AuthService.register()` (utiliser Argon2)
- [ ] Modifier `AuthService.login()` (utiliser Argon2)
- [ ] Modifier `changePassword()` (utiliser Argon2)
- [ ] Modifier `resetPassword()` (utiliser Argon2)
- [ ] Modifier `deleteAccount()` (utiliser Argon2)
- [ ] Modifier `disable2FA()` (utiliser Argon2)
- [ ] Tester l'inscription avec un hash base64
- [ ] Tester la connexion avec un hash base64
- [ ] Vérifier que les anciens utilisateurs peuvent toujours se connecter (si migration progressive)

---

## 🎯 Résultat Final

Une fois ces modifications appliquées :

✅ Le backend ne voit **jamais** le mot de passe original  
✅ Le backend stocke un **double hash** (SHA-256 + Argon2)  
✅ La **masterKey** reste exclusivement côté client  
✅ Le système est **zero-knowledge** : le serveur ne peut pas déchiffrer les données utilisateur

