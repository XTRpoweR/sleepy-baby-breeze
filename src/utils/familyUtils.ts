
export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const validateRole = (role: string) =>
  ['caregiver', 'viewer'].includes(role) ? role : 'viewer';
