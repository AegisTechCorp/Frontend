let masterKeyInMemory: string | null = null;
let keyTimeout: number | null = null;

const KEY_LIFETIME_MS = 15 * 60 * 1000;

export const KeyManager = {
  setMasterKey(key: string): void {
    masterKeyInMemory = key;
    
    if (keyTimeout) {
      clearTimeout(keyTimeout);
    }
    
    keyTimeout = setTimeout(() => {
      KeyManager.clearMasterKey();
    }, KEY_LIFETIME_MS);
  },

  getMasterKey(): string | null {
    return masterKeyInMemory;
  },

  clearMasterKey(): void {
    if (masterKeyInMemory) {
      masterKeyInMemory = null;
    }
    
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
