/**
 * Contact Validation Utilities
 * Provides comprehensive validation for contact information including
 * phone numbers, email addresses, and international format support
 */

export interface PhoneValidationResult {
  isValid: boolean;
  formatted?: string;
  countryCode?: string;
  areaCode?: string;
  number?: string;
  extension?: string;
  errors?: string[];
}

export interface EmailValidationResult {
  isValid: boolean;
  formatted?: string;
  errors?: string[];
}

export interface ContactValidationResult {
  isValid: boolean;
  name?: string;
  phone?: PhoneValidationResult;
  email?: EmailValidationResult;
  errors?: string[];
}

/**
 * Validates and formats phone numbers supporting multiple international formats
 */
export function validatePhoneNumber(phone: string): PhoneValidationResult {
  if (!phone || typeof phone !== 'string') {
    return {
      isValid: false,
      errors: ['Phone number is required'],
    };
  }

  const originalPhone = phone.trim();
  const errors: string[] = [];

  // Emergency numbers
  if (originalPhone === '911' || originalPhone === '999' || originalPhone === '112') {
    return {
      isValid: true,
      formatted: originalPhone,
      number: originalPhone,
    };
  }

  // Extract extension if present
  const extMatch = originalPhone.match(/(?:ext\.?|extension|x)\s*(\d+)/i);
  const extension = extMatch ? extMatch[1] : undefined;
  const phoneWithoutExt = extMatch ? originalPhone.replace(extMatch[0], '').trim() : originalPhone;

  // North American format (10 digits) - more flexible matching
  const naMatch = phoneWithoutExt.match(
    /(?:\+?1[-.\s]?)?[({]?(\d{3})[)}]?[-.\s]?(\d{3})[-.\s]?(\d{4})/,
  );
  if (naMatch) {
    const [, areaCode, exchange, number] = naMatch;

    // Validate area code (cannot start with 0 or 1 in real North American system)
    if (areaCode.startsWith('0') || areaCode.startsWith('1')) {
      errors.push('Invalid area code');
    }

    // Validate exchange (cannot start with 0 or 1 in real North American system)
    if (exchange.startsWith('0') || exchange.startsWith('1')) {
      errors.push('Invalid exchange code');
    }

    if (errors.length === 0) {
      return {
        isValid: true,
        formatted: `${areaCode}-${exchange}-${number}`,
        countryCode: '1',
        areaCode,
        number: `${exchange}${number}`,
        extension,
      };
    } 
      return {
        isValid: false,
        errors,
      };
    
  }

  // International format (country code + number)
  const intMatch = phoneWithoutExt.match(/^\+(\d{1,3})[-.\s]?(.+)/);
  if (intMatch) {
    const [, countryCode, restOfNumber] = intMatch;
    const digits = restOfNumber.replace(/[^\d]/g, '');

    if (digits.length >= 7 && digits.length <= 15) {
      return {
        isValid: true,
        formatted: `+${countryCode} ${formatInternationalNumber(digits)}`,
        countryCode,
        number: digits,
        extension,
      };
    } 
      errors.push('International number must be 7-15 digits');
      return {
        isValid: false,
        errors,
      };
    
  }

  // Simple validation for other formats
  const digitsOnly = phoneWithoutExt.replace(/[^\d]/g, '');
  if (digitsOnly.length < 7) {
    errors.push('Phone number too short');
    return {
      isValid: false,
      errors,
    };
  } else if (digitsOnly.length > 15) {
    errors.push('Phone number too long');
    return {
      isValid: false,
      errors,
    };
  } else if (digitsOnly.length >= 7 && digitsOnly.length <= 11) {
    // Accept as valid but basic format
    return {
      isValid: true,
      formatted: formatBasicNumber(digitsOnly),
      number: digitsOnly,
      extension,
    };
  }

  return {
    isValid: false,
    errors: errors.length > 0 ? errors : ['Invalid phone number format'],
  };
}

/**
 * Validates email addresses
 */
export function validateEmail(email: string): EmailValidationResult {
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      errors: ['Email is required'],
    };
  }

  const trimmed = email.trim().toLowerCase();

  // Additional validation first
  const errors: string[] = [];

  if (trimmed.length > 254) {
    errors.push('Email address too long');
    return {
      isValid: false,
      errors,
    };
  }

  const [localPart, domain] = trimmed.split('@');

  if (localPart && localPart.length > 64) {
    errors.push('Email local part too long');
    return {
      isValid: false,
      errors,
    };
  }

  if (domain && domain.includes('..')) {
    errors.push('Invalid domain format');
    return {
      isValid: false,
      errors,
    };
  }

  // Basic email regex with limited international character support
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9À-ÿ](?:[a-zA-Z0-9À-ÿ-]{0,61}[a-zA-Z0-9À-ÿ])?(?:\.[a-zA-Z0-9À-ÿ](?:[a-zA-Z0-9À-ÿ-]{0,61}[a-zA-Z0-9À-ÿ])?)*$/;

  if (!emailRegex.test(trimmed)) {
    return {
      isValid: false,
      errors: ['Invalid email format'],
    };
  }

  return {
    isValid: true,
    formatted: trimmed,
  };
}

/**
 * Validates complete contact information
 */
export function validateContact(contact: {
  name?: string;
  phone?: string;
  email?: string;
  role?: string;
}): ContactValidationResult {
  const errors: string[] = [];
  let phoneResult: PhoneValidationResult | undefined;
  let emailResult: EmailValidationResult | undefined;

  // Validate name
  if (!contact.name || typeof contact.name !== 'string' || contact.name.trim().length === 0) {
    errors.push('Name is required');
  } else if (contact.name.trim().length > 200) {
    errors.push('Name too long');
  }

  // Validate phone if provided
  if (contact.phone) {
    phoneResult = validatePhoneNumber(contact.phone);
    if (!phoneResult.isValid && phoneResult.errors) {
      errors.push(...phoneResult.errors.map((e) => `Phone: ${e}`));
    }
  }

  // Validate email if provided
  if (contact.email) {
    emailResult = validateEmail(contact.email);
    if (!emailResult.isValid && emailResult.errors) {
      errors.push(...emailResult.errors.map((e) => `Email: ${e}`));
    }
  }

  // At least phone or email is required
  if (!contact.phone && !contact.email) {
    errors.push('Either phone number or email is required');
  }

  return {
    isValid: errors.length === 0,
    name: contact.name?.trim(),
    phone: phoneResult,
    email: emailResult,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Parses contact string in various formats
 */
export function parseContactString(contactString: string): ContactValidationResult {
  if (!contactString || typeof contactString !== 'string' || contactString.trim() === '') {
    return {
      isValid: false,
      errors: ['Contact string is required'],
    };
  }

  const trimmed = contactString.trim();

  // Try to extract name, phone, and email
  // Handle emergency numbers (911, 999, 112) and regular phones separately
  const emergencyMatch = trimmed.match(/\b(911|999|112)\b/);
  // More comprehensive phone regex that includes the surrounding parentheses or separators
  const regularPhoneMatch = trimmed.match(
    /(\(?\+?(?:\d[\d\-.\s()]*){6,}(?:\s*(?:ext\.?|extension|x)\s*\d+)?)\)?(?:\s|$)/,
  );
  const phoneMatch = emergencyMatch || regularPhoneMatch;
  const emailMatch = trimmed.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);

  let name = trimmed;
  let phone: string | undefined;
  let email: string | undefined;

  if (phoneMatch) {
    phone = phoneMatch[1].trim();
    name = name.replace(phoneMatch[0], '').trim();
  }

  if (emailMatch) {
    email = emailMatch[1].trim();
    name = name.replace(emailMatch[0], '').trim();
  }

  // Clean up name (remove extra separators and common delimiters)
  name = name.replace(/^[-\s,:;|/]+|[-\s,:;|/]+$/g, '').trim();

  return validateContact({ name, phone, email });
}

/**
 * Formats international phone numbers with spaces
 */
function formatInternationalNumber(digits: string): string {
  if (digits.length <= 4) {
return digits;
}
  if (digits.length <= 7) {
return `${digits.slice(0, 3)} ${digits.slice(3)}`;
}
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

/**
 * Formats basic phone numbers
 */
function formatBasicNumber(digits: string): string {
  if (digits.length === 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `1-${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return digits;
}

/**
 * Extracts extension from phone number string
 */
export function extractExtension(phone: string): { phone: string; extension?: string } {
  const extMatch = phone.match(/(.+?)(?:\s*(?:ext\.?|extension|x)\s*(\d+))/i);

  if (extMatch) {
    return {
      phone: extMatch[1].trim(),
      extension: extMatch[2],
    };
  }

  return { phone };
}

/**
 * Validates and formats emergency contact information
 */
export function validateEmergencyContact(contact: {
  name: string;
  relationship?: string;
  phone: string;
  email?: string;
  availability?: string;
}): ContactValidationResult & { relationship?: string; availability?: string } {
  const baseValidation = validateContact(contact);

  const errors = baseValidation.errors ? [...baseValidation.errors] : [];

  // Additional validation for emergency contacts
  if (contact.relationship && contact.relationship.trim().length > 100) {
    errors.push('Relationship description too long');
  }

  if (contact.availability && contact.availability.trim().length > 200) {
    errors.push('Availability description too long');
  }

  return {
    ...baseValidation,
    isValid: errors.length === 0,
    relationship: contact.relationship?.trim(),
    availability: contact.availability?.trim(),
    errors: errors.length > 0 ? errors : undefined,
  };
}
