// Générateur de mots de passe sécurisés (V2)

export interface PasswordOptions {
  length?: number;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
}

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

export function generatePassword(options?: PasswordOptions): string {
  const opts = {
    length: options?.length || 16,
    includeUppercase: options?.includeUppercase ?? true,
    includeLowercase: options?.includeLowercase ?? true,
    includeNumbers: options?.includeNumbers ?? true,
    includeSymbols: options?.includeSymbols ?? false,
  };

  let chars = '';
  if (opts.includeLowercase) chars += LOWERCASE;
  if (opts.includeUppercase) chars += UPPERCASE;
  if (opts.includeNumbers) chars += NUMBERS;
  if (opts.includeSymbols) chars += SYMBOLS;

  if (chars.length === 0) chars = LOWERCASE;

  let password = '';
  for (let i = 0; i < opts.length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return password;
}
