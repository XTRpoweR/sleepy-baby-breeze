
import { validateInput, RateLimiter } from '@/utils/validation';

// Enhanced security utilities for the application
export const securityUtils = {
  // Content Security Policy helpers
  sanitizeUserContent: (content: string): string => {
    return validateInput.sanitizeHtml(content)
      .trim()
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '');
  },

  // Email validation with additional security checks
  validateSecureEmail: (email: string): { isValid: boolean; error?: string } => {
    const normalizedEmail = email.toLowerCase().trim();
    
    if (!validateInput.isValidEmail(normalizedEmail)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }
    
    // Additional security checks
    if (normalizedEmail.includes('..')) {
      return { isValid: false, error: 'Email contains invalid characters' };
    }
    
    if (normalizedEmail.length > 254) {
      return { isValid: false, error: 'Email address is too long' };
    }
    
    return { isValid: true };
  },

  // Validate baby names with security considerations
  validateBabyName: (name: string): { isValid: boolean; error?: string } => {
    const sanitized = validateInput.sanitizeHtml(name).trim();
    
    if (!sanitized || sanitized.length === 0) {
      return { isValid: false, error: 'Baby name is required' };
    }
    
    if (sanitized.length > 50) {
      return { isValid: false, error: 'Baby name must be less than 50 characters' };
    }
    
    // Check for suspicious patterns
    if (/[<>{}[\]\\]/.test(sanitized)) {
      return { isValid: false, error: 'Baby name contains invalid characters' };
    }
    
    return { isValid: true };
  },

  // Role validation
  validateRole: (role: string): boolean => {
    return ['caregiver', 'viewer'].includes(role);
  },

  // Activity notes validation
  validateActivityNotes: (notes: string): { isValid: boolean; sanitized: string; error?: string } => {
    const sanitized = validateInput.sanitizeHtml(notes).trim();
    
    if (sanitized.length > 1000) {
      return { 
        isValid: false, 
        sanitized: sanitized.substring(0, 1000),
        error: 'Notes cannot exceed 1000 characters' 
      };
    }
    
    return { isValid: true, sanitized };
  },

  // Memory title and description validation
  validateMemoryContent: (content: string, type: 'title' | 'description'): { isValid: boolean; sanitized: string; error?: string } => {
    const sanitized = validateInput.sanitizeHtml(content).trim();
    const maxLength = type === 'title' ? 200 : 1000;
    
    if (sanitized.length > maxLength) {
      return {
        isValid: false,
        sanitized: sanitized.substring(0, maxLength),
        error: `${type} cannot exceed ${maxLength} characters`
      };
    }
    
    return { isValid: true, sanitized };
  }
};

// Create rate limiters for different actions
export const rateLimiters = {
  invitation: new RateLimiter(5, 60000), // 5 invitations per minute
  activitySubmission: new RateLimiter(30, 60000), // 30 activities per minute
  memoryUpload: new RateLimiter(10, 60000), // 10 memory uploads per minute
  profileUpdate: new RateLimiter(10, 300000) // 10 profile updates per 5 minutes
};
