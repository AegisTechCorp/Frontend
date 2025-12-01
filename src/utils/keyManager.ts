let masterKeyInMemory: string | null = null;
let keyTimeout: number | null = null;

const KEY_LIFETIME_MS = 15 * 60 * 1000;

export const KeyManager = {
  setMasterKey(key: string): void {
    masterKeyInMemory = key;
    sessionStorage.setItem('aegis_master_key', key);
    
    if (keyTimeout) {
      clearTimeout(keyTimeout);
    }
    
    keyTimeout = setTimeout(() => {
      KeyManager.clearMasterKey();
    }, KEY_LIFETIME_MS);
  },

  getMasterKey(): string | null {
    // Prioriser la mémoire, puis sessionStorage
    if (masterKeyInMemory) {
      return masterKeyInMemory;
    }
    return sessionStorage.getItem('aegis_master_key');
  },

  clearMasterKey(): void {
    if (masterKeyInMemory) {
      masterKeyInMemory = null;
    }
    sessionStorage.removeItem('aegis_master_key');
    
    if (keyTimeout) {
      clearTimeout(keyTimeout);
      keyTimeout = null;
    }
  },

  hasMasterKey(): boolean {
    return masterKeyInMemory !== null;
  },

  extendKeyLifetime(): void {
    if (masterKeyInMemory && keyTimeout) {
      clearTimeout(keyTimeout);
      keyTimeout = setTimeout(() => {
        KeyManager.clearMasterKey();
      }, KEY_LIFETIME_MS);
    }
  }
};

window.addEventListener('beforeunload', () => {
  KeyManager.clearMasterKey();
});
