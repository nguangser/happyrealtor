export function extractBusinessName(fullName: string): string {
    const match = fullName.match(/\(([^)]+)\)/);
    return match?.[1]?.trim() || fullName.trim();
  }
  
  export function getDefaultRealtorTagline(): string {
    return "Happy Realtor. Happy Clients";
  }