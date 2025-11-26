import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

// Mock argon2-browser pour les tests (car il utilise WebAssembly)
vi.mock('argon2-browser', () => ({
  default: {
    hash: vi.fn(async ({ pass, salt }) => {
      // Simuler un hash Argon2 pour les tests
      // En production, argon2-browser fait un vrai calcul cryptographique
      const encoder = new TextEncoder()
      const data = encoder.encode(pass + salt.toString())
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      return {
        hash: new Uint8Array(hashBuffer),
        hashHex: Array.from(new Uint8Array(hashBuffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join(''),
      }
    }),
  },
}))

// Nettoie après chaque test pour éviter les fuites mémoire
afterEach(() => {
  cleanup()
})
