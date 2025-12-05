import zxcvbn from 'zxcvbn';

export interface PasswordStrength {
  score: number; // 0-4 (0=très faible, 4=très fort)
  feedback: {
    warning: string;
    suggestions: string[];
  };
  crackTimesDisplay: {
    offlineSlowHashing1e4PerSecond: string | number;
    onlineNoThrottling10PerSecond: string | number;
  };
  isStrong: boolean;
  color: 'red' | 'orange' | 'yellow' | 'lightgreen' | 'green';
  label: string;
}

/**
 * Évalue la force d'un mot de passe en utilisant zxcvbn
 * Encourage l'utilisation de passphrases longues
 * 
 * @param password - Le mot de passe à évaluer
 * @param userInputs - Inputs spécifiques à l'utilisateur (email, nom) pour détecter les mots communs
 * @returns Analyse détaillée de la force du mot de passe
 * 
 * @example
 * ```tsx
 * const strength = evaluatePasswordStrength('MonMotDePasseTresFaible123');
 * if (!strength.isStrong) {
 *   console.warn(strength.feedback.suggestions);
 * }
 * ```
 */
export function evaluatePasswordStrength(
  password: string,
  userInputs: string[] = []
): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      feedback: {
        warning: 'Le mot de passe est requis',
        suggestions: ['Veuillez entrer un mot de passe']
      },
      crackTimesDisplay: {
        offlineSlowHashing1e4PerSecond: 'instantané',
        onlineNoThrottling10PerSecond: 'instantané'
      },
      isStrong: false,
      color: 'red',
      label: 'Très faible'
    };
  }

  const result = zxcvbn(password, userInputs);

  const colors: Array<'red' | 'orange' | 'yellow' | 'lightgreen' | 'green'> = [
    'red',
    'orange', 
    'yellow',
    'lightgreen',
    'green'
  ];

  const labels = [
    'Très faible',
    'Faible',
    'Moyen',
    'Fort',
    'Très fort'
  ];

  const isStrong = result.score >= 3;

  const suggestions = result.feedback.suggestions.length > 0
    ? result.feedback.suggestions
    : isStrong 
      ? ['Excellent mot de passe !']
      : ['Utilisez une phrase longue avec des mots aléatoires', 'Évitez les mots communs et les dates'];

  const warning = result.feedback.warning || '';

  return {
    score: result.score,
    feedback: {
      warning,
      suggestions
    },
    crackTimesDisplay: {
      offlineSlowHashing1e4PerSecond: result.crack_times_display.offline_slow_hashing_1e4_per_second,
      onlineNoThrottling10PerSecond: result.crack_times_display.online_no_throttling_10_per_second
    },
    isStrong,
    color: colors[result.score],
    label: labels[result.score]
  };
}

/**
 * Minimum requis pour un système zero-knowledge
 * Selon les recommandations NIST et OWASP 2024
 */
export const PASSWORD_REQUIREMENTS = {
  minLength: 12, // Minimum 12 caractères pour résister aux attaques par force brute
  minScore: 3,   // Score zxcvbn minimal (0-4)
  recommendedLength: 16,
  message: 'Utilisez au minimum 12 caractères. Une longue phrase de passe est recommandée.'
};

/**
 * Valide si un mot de passe respecte les exigences minimales
 */
export function validatePassword(password: string, userInputs: string[] = []): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Le mot de passe doit contenir au moins ${PASSWORD_REQUIREMENTS.minLength} caractères`);
  }

  const strength = evaluatePasswordStrength(password, userInputs);
  
  if (strength.score < PASSWORD_REQUIREMENTS.minScore) {
    errors.push('Le mot de passe est trop faible. ' + strength.feedback.suggestions[0]);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
