# Documentation des Endpoints API - Authentification

## Base URL
```
http://localhost:3000/api
```

---

## 🔐 Endpoints d'Authentification

### 1. Inscription
**POST** `/auth/signup`

**Body:**
```json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean.dupont@email.fr",
  "birthDate": "1990-01-01",
  "password": "SecurePass123!"
}
```

**Réponse (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-123",
    "email": "jean.dupont@email.fr",
    "firstName": "Jean",
    "lastName": "Dupont",
    "birthDate": "1990-01-01",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Erreurs:**
- `400` - Données invalides ou email déjà utilisé
- `500` - Erreur serveur

---

### 2. Connexion
**POST** `/auth/login`

**Body:**
```json
{
  "email": "jean.dupont@email.fr",
  "password": "SecurePass123!"
}
```

**Réponse (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-123",
    "email": "jean.dupont@email.fr",
    "firstName": "Jean",
    "lastName": "Dupont",
    "birthDate": "1990-01-01",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Erreurs:**
- `401` - Email ou mot de passe incorrect
- `404` - Utilisateur non trouvé

---

### 3. Vérifier le Token
**GET** `/auth/verify`

**Headers:**
```
Authorization: Bearer {token}
```

**Réponse (200):**
```json
{
  "valid": true,
  "user": {
    "id": "uuid-123",
    "email": "jean.dupont@email.fr"
  }
}
```

**Erreurs:**
- `401` - Token invalide ou expiré

---

### 4. Rafraîchir le Token
**POST** `/auth/refresh`

**Headers:**
```
Authorization: Bearer {token}
```

**Réponse (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 5. Vérifier la Disponibilité de l'Email
**POST** `/auth/check-email`

**Body:**
```json
{
  "email": "jean.dupont@email.fr"
}
```

**Réponse (200):**
```json
{
  "exists": true
}
```

---

## 🔑 Gestion du Mot de Passe

### 6. Demander une Réinitialisation
**POST** `/auth/forgot-password`

**Body:**
```json
{
  "email": "jean.dupont@email.fr"
}
```

**Réponse (200):**
```json
{
  "message": "Email de réinitialisation envoyé"
}
```

---

### 7. Réinitialiser le Mot de Passe
**POST** `/auth/reset-password`

**Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "NewSecurePass123!"
}
```

**Réponse (200):**
```json
{
  "message": "Mot de passe réinitialisé avec succès"
}
```

---

### 8. Changer le Mot de Passe (Connecté)
**POST** `/auth/change-password`

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePass123!"
}
```

**Réponse (200):**
```json
{
  "message": "Mot de passe changé avec succès"
}
```

---

## 👤 Gestion du Profil

### 9. Mettre à Jour le Profil
**PUT** `/auth/profile`

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "birthDate": "1990-01-01"
}
```

**Réponse (200):**
```json
{
  "user": {
    "id": "uuid-123",
    "email": "jean.dupont@email.fr",
    "firstName": "Jean",
    "lastName": "Dupont",
    "birthDate": "1990-01-01",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 10. Supprimer le Compte
**DELETE** `/auth/delete-account`

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "password": "SecurePass123!"
}
```

**Réponse (200):**
```json
{
  "message": "Compte supprimé avec succès"
}
```

---

## 🔐 Authentification à Deux Facteurs (2FA)

### 11. Activer 2FA
**POST** `/auth/2fa/enable`

**Headers:**
```
Authorization: Bearer {token}
```

**Réponse (200):**
```json
{
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "secret": "JBSWY3DPEHPK3PXP"
}
```

---

### 12. Vérifier le Code 2FA
**POST** `/auth/2fa/verify`

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "code": "123456"
}
```

**Réponse (200):**
```json
{
  "message": "Code 2FA vérifié",
  "enabled": true
}
```

---

### 13. Désactiver 2FA
**POST** `/auth/2fa/disable`

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "password": "SecurePass123!"
}
```

**Réponse (200):**
```json
{
  "message": "2FA désactivé avec succès"
}
```

---

## 📋 Codes d'Erreur Communs

| Code | Description |
|------|-------------|
| 200  | Succès |
| 201  | Créé avec succès |
| 400  | Requête invalide |
| 401  | Non authentifié |
| 403  | Accès refusé |
| 404  | Ressource non trouvée |
| 409  | Conflit (ex: email déjà utilisé) |
| 500  | Erreur serveur |

---

## 🔒 Sécurité

- Tous les mots de passe doivent être hashés avec **bcrypt** (salt rounds: 10)
- Les tokens JWT doivent expirer après **24 heures**
- Les refresh tokens expirent après **7 jours**
- Les tokens de réinitialisation expirent après **1 heure**
- Implémenter un **rate limiting** sur les endpoints d'authentification
- Utiliser **HTTPS** en production
- Valider toutes les entrées côté serveur
- Implémenter une protection **CSRF**

---

## 📂 Endpoints Dashboard & Documents

### 14. Récupérer les Statistiques du Dashboard
**GET** `/dashboard/stats`

**Headers:**
```
Authorization: Bearer {token}
```

**Réponse (200):**
```json
{
  "totalDocuments": 25,
  "totalFolders": 3,
  "totalPrescriptions": 12,
  "totalExams": 8
}
```

---

### 15. Récupérer Tous les Dossiers Sécurisés
**GET** `/folders`

**Headers:**
```
Authorization: Bearer {token}
```

**Réponse (200):**
```json
{
  "folders": [
    {
      "id": "uuid-123",
      "name": "Analyses médicales",
      "icon": "Stethoscope",
      "color": "from-blue-500 to-cyan-500",
      "documentCount": 8,
      "isLocked": true,
      "unlockMethod": "pin",
      "userId": "uuid-user",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 16. Créer un Dossier Sécurisé
**POST** `/folders`

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "name": "Ordonnances",
  "icon": "Pill",
  "color": "from-green-500 to-emerald-500",
  "unlockMethod": "pin",
  "pin": "1234"
}
```

**Réponse (201):**
```json
{
  "folder": {
    "id": "uuid-456",
    "name": "Ordonnances",
    "documentCount": 0
  }
}
```

---

### 17. Mettre à Jour un Dossier
**PUT** `/folders/:folderId`

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "name": "Nouvelles analyses",
  "color": "from-purple-500 to-pink-500"
}
```

---

### 18. Supprimer un Dossier
**DELETE** `/folders/:folderId`

**Headers:**
```
Authorization: Bearer {token}
```

**Réponse (200):**
```json
{
  "message": "Dossier supprimé avec succès"
}
```

---

### 19. Déverrouiller un Dossier avec PIN
**POST** `/folders/:folderId/unlock`

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "pin": "1234"
}
```

**Réponse (200):**
```json
{
  "unlockToken": "temp-token-xyz",
  "expiresIn": 3600
}
```

---

### 20. Déverrouiller avec Biométrie
**POST** `/folders/:folderId/unlock-biometric`

**Headers:**
```
Authorization: Bearer {token}
```

**Réponse (200):**
```json
{
  "unlockToken": "temp-token-xyz",
  "expiresIn": 3600
}
```

---

### 21. Récupérer les Documents
**GET** `/documents?folderId={optional}`

**Headers:**
```
Authorization: Bearer {token}
```

**Réponse (200):**
```json
{
  "documents": [
    {
      "id": "uuid-doc-1",
      "title": "Analyses sanguines",
      "type": "exam",
      "date": "2024-01-15",
      "doctor": "Dr. Martin",
      "size": "2.3 MB",
      "folderId": "uuid-folder",
      "filePath": "/uploads/xxx.pdf",
      "createdAt": "2024-01-15T00:00:00.000Z",
      "updatedAt": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

---

### 22. Rechercher des Documents
**GET** `/documents/search?q={query}&type={type}`

**Headers:**
```
Authorization: Bearer {token}
```

**Query params:**
- `q`: Terme de recherche
- `type`: exam | prescription | imaging | allergy

**Réponse (200):**
```json
{
  "documents": [...]
}
```

---

### 23. Upload un Document
**POST** `/documents`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Body (FormData):**
```
title: "Analyses sanguines"
type: "exam"
doctor: "Dr. Martin"
folderId: "uuid-folder" (optional)
file: <File>
```

**Réponse (201):**
```json
{
  "document": {
    "id": "uuid-new-doc",
    "title": "Analyses sanguines",
    "filePath": "/uploads/xxx.pdf"
  }
}
```

---

### 24. Télécharger un Document
**GET** `/documents/:documentId/download`

**Headers:**
```
Authorization: Bearer {token}
```

**Réponse (200):**
- Content-Type: application/pdf (ou autre)
- Content-Disposition: attachment; filename="document.pdf"
- Body: fichier binaire

---

### 25. Supprimer un Document
**DELETE** `/documents/:documentId`

**Headers:**
```
Authorization: Bearer {token}
```

---

### 26. Mettre à Jour un Document
**PUT** `/documents/:documentId`

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "title": "Nouveau titre",
  "doctor": "Dr. Nouveau"
}
```

---

### 27. Déplacer un Document
**POST** `/documents/:documentId/move`

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "folderId": "uuid-target-folder"
}
```

---

### 28. Récupérer les Notifications
**GET** `/notifications`

**Headers:**
```
Authorization: Bearer {token}
```

**Réponse (200):**
```json
{
  "notifications": [
    {
      "id": "uuid-notif",
      "type": "document_added",
      "message": "Nouveau document ajouté",
      "read": false,
      "createdAt": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

---

### 29. Marquer une Notification comme Lue
**POST** `/notifications/:notificationId/read`

**Headers:**
```
Authorization: Bearer {token}
```

---

## 📝 Validation des Données

### Mot de passe
- Minimum 8 caractères
- Au moins 1 majuscule
- Au moins 1 chiffre
- Au moins 1 caractère spécial

### Email
- Format email valide (RFC 5322)

### Date de naissance
- Format ISO 8601 (YYYY-MM-DD)
- Utilisateur doit avoir au moins 18 ans

### Documents
- Formats acceptés: PDF, JPG, JPEG, PNG
- Taille maximale: 50 MB
- Le nom du fichier doit être sécurisé (pas de caractères spéciaux)
