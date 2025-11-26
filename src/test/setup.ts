import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

// Nettoie après chaque test pour éviter les fuites mémoire
afterEach(() => {
  cleanup()
})
