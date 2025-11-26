import React from "react"
import "./globals.css"

export const metadata = {
  title: "Aegis - Votre Dossier Médical Sécurisé",
  description: "Stockez et gérez votre dossier médical complet en toute sécurité avec un chiffrement de bout en bout",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
