import { useState } from 'react';
import { useZeroKnowledgeAuth } from '../hooks/useZeroKnowledgeAuth';
import { encryptData, decryptData } from '../utils/crypto.utils';

export default function ZeroKnowledgeTest() {
  const { user, masterKey, isLoading, error, register, login, logout } = useZeroKnowledgeAuth();

  // États pour les formulaires
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('MySecurePassword123!');
  const [firstName, setFirstName] = useState('John');
  const [lastName, setLastName] = useState('Doe');

  // États pour le test de chiffrement
  const [textToEncrypt, setTextToEncrypt] = useState('Secret message!');
  const [encryptedText, setEncryptedText] = useState('');
  const [decryptedText, setDecryptedText] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, password, firstName, lastName);
      alert('Inscription réussie! ✅');
    } catch (err) {
      alert('Erreur: ' + (err as Error).message);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      alert('Connexion réussie! ✅');
    } catch (err) {
      alert('Erreur: ' + (err as Error).message);
    }
  };

  const handleEncrypt = async () => {
    if (!masterKey) {
      alert('Vous devez être connecté pour chiffrer!');
      return;
    }

    try {
      const encrypted = await encryptData(textToEncrypt, masterKey);
      setEncryptedText(encrypted);
      alert('Texte chiffré! ✅');
    } catch (err) {
      alert('Erreur de chiffrement: ' + (err as Error).message);
    }
  };

  const handleDecrypt = async () => {
    if (!masterKey) {
      alert('Vous devez être connecté pour déchiffrer!');
      return;
    }

    try {
      const decrypted = await decryptData(encryptedText, masterKey);
      setDecryptedText(decrypted || 'Erreur de déchiffrement');
      alert('Texte déchiffré! ✅');
    } catch (err) {
      alert('Erreur de déchiffrement: ' + (err as Error).message);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>🔐 Test Zero-Knowledge Authentication</h1>

      {error && (
        <div style={{ padding: '10px', background: '#ffebee', color: '#c62828', marginBottom: '20px', borderRadius: '4px' }}>
          ❌ {error}
        </div>
      )}

      {/* État de connexion */}
      <div style={{ padding: '20px', background: '#f5f5f5', marginBottom: '20px', borderRadius: '8px' }}>
        <h3>État de connexion</h3>
        {user ? (
          <div>
            <p>✅ <strong>Connecté</strong></p>
            <p>Email: {user.email}</p>
            <p>Nom: {user.firstName} {user.lastName}</p>
            <p>MasterKey: {masterKey?.substring(0, 20)}...</p>
            <button onClick={logout} style={{ marginTop: '10px' }}>
              Se déconnecter
            </button>
          </div>
        ) : (
          <p>❌ Non connecté</p>
        )}
      </div>

      {/* Formulaires d'inscription et connexion */}
      {!user && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          {/* Inscription */}
          <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>📝 Inscription</h3>
            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: '10px' }}>
                <label>Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Mot de passe:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Prénom:</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Nom:</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '10px' }}>
                {isLoading ? 'Inscription...' : "S'inscrire"}
              </button>
            </form>
          </div>

          {/* Connexion */}
          <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>🔑 Connexion</h3>
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '10px' }}>
                <label>Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Mot de passe:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                  required
                />
              </div>
              <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '10px', marginTop: '76px' }}>
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Test de chiffrement */}
      {user && masterKey && (
        <div style={{ padding: '20px', border: '2px solid #4caf50', borderRadius: '8px' }}>
          <h3>🔒 Test de chiffrement Zero-Knowledge</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Le texte est chiffré avec votre masterKey (que seul vous possédez). Le serveur ne peut pas le déchiffrer!
          </p>

          <div style={{ marginBottom: '15px' }}>
            <label>Texte à chiffrer:</label>
            <input
              type="text"
              value={textToEncrypt}
              onChange={(e) => setTextToEncrypt(e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
            <button onClick={handleEncrypt} style={{ marginTop: '10px', padding: '10px' }}>
              🔒 Chiffrer
            </button>
          </div>

          {encryptedText && (
            <div style={{ marginBottom: '15px' }}>
              <label>Texte chiffré:</label>
              <textarea
                value={encryptedText}
                readOnly
                style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '80px', fontFamily: 'monospace', fontSize: '12px' }}
              />
              <button onClick={handleDecrypt} style={{ marginTop: '10px', padding: '10px' }}>
                🔓 Déchiffrer
              </button>
            </div>
          )}

          {decryptedText && (
            <div>
              <label>Texte déchiffré:</label>
              <div style={{ padding: '10px', background: '#e8f5e9', marginTop: '5px', borderRadius: '4px' }}>
                {decryptedText}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Explications */}
      <div style={{ marginTop: '30px', padding: '20px', background: '#e3f2fd', borderRadius: '8px' }}>
        <h3>ℹ️ Comment ça marche ?</h3>
        <ol style={{ lineHeight: '1.8' }}>
          <li><strong>Inscription/Connexion</strong>: Votre mot de passe est utilisé pour dériver 2 clés:
            <ul>
              <li><code>masterKey</code>: Pour chiffrer vos données (reste sur votre appareil)</li>
              <li><code>authHash</code>: Pour prouver votre identité au serveur</li>
            </ul>
          </li>
          <li><strong>Le serveur ne voit JAMAIS</strong>: Votre mot de passe ou votre masterKey</li>
          <li><strong>Chiffrement</strong>: Vos données sont chiffrées avec votre masterKey avant d'être envoyées</li>
          <li><strong>Sécurité</strong>: Même si le serveur est compromis, vos données restent protégées</li>
        </ol>

        <div style={{ marginTop: '15px', padding: '10px', background: 'white', borderRadius: '4px' }}>
          <strong>🔍 Ouvrez la console du navigateur (F12)</strong> pour voir les étapes détaillées!
        </div>
      </div>
    </div>
  );
}
