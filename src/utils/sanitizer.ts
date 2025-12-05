import DOMPurify from 'dompurify';

/**
 * Configuration stricte de DOMPurify pour prévenir les attaques XSS
 * Supprime tous les scripts, événements et contenus dangereux
 */
const PURIFY_CONFIG = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'p', 'br', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['class', 'style'],
  ALLOW_DATA_ATTR: false,
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false,
};

/**
 * Sanitize HTML content to prevent XSS attacks
 * Utiliser cette fonction AVANT d'insérer du contenu HTML dans le DOM
 * 
 * @param dirty - Le contenu HTML non sécurisé
 * @param strict - Mode strict (désactive tous les tags HTML, texte seulement)
 * @returns HTML sécurisé
 * 
 * @example
 * ```tsx
 * const userInput = '<img src=x onerror=alert(1)>Bonjour';
 * const safe = sanitizeHtml(userInput); // "Bonjour"
 * ```
 */
export function sanitizeHtml(dirty: string, strict: boolean = false): string {
  if (!dirty) return '';
  
  if (strict) {
    return DOMPurify.sanitize(dirty, { 
      ALLOWED_TAGS: [],
      KEEP_CONTENT: true 
    });
  }
  
  return DOMPurify.sanitize(dirty, PURIFY_CONFIG);
}

/**
 * Sanitize text to plain text only (strip all HTML)
 * Recommandé pour les champs de saisie sensibles (nom, email, etc.)
 */
export function sanitizeText(text: string): string {
  return sanitizeHtml(text, true);
}

/**
 * Hook pour sanitizer des props React
 * Usage: const SafeComponent = useSanitizedProps(Component);
 */
export function sanitizeProps<T extends Record<string, any>>(props: T): T {
  const sanitized = { ...props };
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeText(sanitized[key]) as any;
    }
  }
  
  return sanitized;
}
