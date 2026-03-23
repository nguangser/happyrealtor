export function isValidSingaporeMobile(mobile?: string): boolean {
    if (!mobile) return true;
    return /^[89]\d{7}$/.test(mobile);
  }
  
  export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }