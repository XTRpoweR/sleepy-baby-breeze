
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Remove potential XSS characters and limit length
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/[<>]/g, '')
      .trim()
      .slice(0, 2000);
  }
  
  if (typeof input === 'object' && input !== null && !Array.isArray(input)) {
    const sanitized: any = {};
    const allowedKeys = ['name', 'email', 'subject', 'message'];
    
    for (const key of Object.keys(input)) {
      if (allowedKeys.includes(key) && typeof key === 'string') {
        sanitized[key] = sanitizeInput(input[key]);
      }
    }
    return sanitized;
  }
  
  return input;
}

export function validateContactForm(data: any): ValidationResult {
  const errors: string[] = [];

  // Check required fields
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Name is required');
  } else if (data.name.trim().length > 100) {
    errors.push('Name must be less than 100 characters');
  }

  if (!data.email || typeof data.email !== 'string' || data.email.trim().length === 0) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.push('Invalid email format');
    } else if (data.email.trim().length > 254) {
      errors.push('Email must be less than 254 characters');
    }
  }

  if (!data.subject || typeof data.subject !== 'string' || data.subject.trim().length === 0) {
    errors.push('Subject is required');
  } else if (data.subject.trim().length > 200) {
    errors.push('Subject must be less than 200 characters');
  }

  if (!data.message || typeof data.message !== 'string' || data.message.trim().length === 0) {
    errors.push('Message is required');
  } else if (data.message.trim().length < 10) {
    errors.push('Message must be at least 10 characters long');
  } else if (data.message.trim().length > 2000) {
    errors.push('Message must be less than 2000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
