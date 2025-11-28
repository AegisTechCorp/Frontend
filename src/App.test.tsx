import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(document.body).toBeTruthy()
  })

  it('renders landing page with navigation', () => {
    render(<App />)

    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('renders Aegis branding', () => {
    render(<App />)
    expect(screen.getAllByText(/Aegis/i).length).toBeGreaterThan(0)
  })
})
