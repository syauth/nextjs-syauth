/**
 * Error Message Sanitization Utility
 *
 * This utility provides client-side error message mapping to ensure
 * no sensitive backend information is displayed to users, even if
 * backend errors slip through.
 */

/**
 * Sanitize error messages from backend to prevent information disclosure
 */
export function sanitizeErrorMessage(error: any): string {
  // Handle different error formats
  let errorMessage = '';

  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error?.message) {
    errorMessage = error.message;
  } else if (error?.error) {
    errorMessage = typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
  } else if (error?.detail) {
    errorMessage = error.detail;
  } else if (typeof error === 'object' && error !== null) {
    // Handle Django REST Framework field errors format: {"field": ["error1", "error2"]}
    const fieldErrors: string[] = [];
    for (const [field, messages] of Object.entries(error)) {
      if (Array.isArray(messages)) {
        messages.forEach(msg => {
          // Sanitize each message
          const sanitized = sanitizeMessage(String(msg));
          // Add field name for clarity (capitalize first letter)
          const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ');
          fieldErrors.push(`${fieldName}: ${sanitized}`);
        });
      } else {
        const sanitized = sanitizeMessage(String(messages));
        const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ');
        fieldErrors.push(`${fieldName}: ${sanitized}`);
      }
    }
    if (fieldErrors.length > 0) {
      return fieldErrors.join('\n');
    }
    errorMessage = JSON.stringify(error);
  } else {
    errorMessage = JSON.stringify(error);
  }

  return sanitizeMessage(errorMessage);
}

/**
 * Sanitize a single error message string
 */
function sanitizeMessage(message: string): string {
  // Normalize to lowercase for case-insensitive matching
  const lowerMessage = message.toLowerCase();

  // Email enumeration patterns
  if (lowerMessage.includes('user with this email') ||
      lowerMessage.includes('email already exists') ||
      lowerMessage.includes('external user object') ||
      lowerMessage.includes('existe déjà') ||
      lowerMessage.includes('already exists')) {
    return 'Please use a different email address.';
  }

  // Database/model exposure patterns
  if (lowerMessage.includes('object with this') ||
      lowerMessage.includes('objet') && lowerMessage.includes('avec ce champ')) {
    return 'This value is already in use.';
  }

  // Password validation exposure (keep helpful ones, sanitize exposing ones)
  if (lowerMessage.includes('password') &&
      (lowerMessage.includes('common') ||
       lowerMessage.includes('similar to your') ||
       lowerMessage.includes('entirely numeric'))) {
    return 'Password does not meet security requirements. Please use a stronger password.';
  }

  // API/System architecture exposure
  if ((lowerMessage.includes('api key') && lowerMessage.includes('invalid')) ||
      (lowerMessage.includes('oauth client') && lowerMessage.includes('does not exist')) ||
      lowerMessage.includes('service type')) {
    return 'Authentication failed. Please try again.';
  }

  // Developer/internal error patterns
  if (lowerMessage.includes('developer') && lowerMessage.includes('user id') ||
      lowerMessage.includes('unable to determine')) {
    return 'An authentication error occurred. Please try again.';
  }

  // Feature limits exposure
  if (lowerMessage.includes('feature') && lowerMessage.includes('limit') ||
      lowerMessage.includes('limit') && lowerMessage.includes('exceeded')) {
    return 'You have reached the limit for this feature. Please upgrade your plan.';
  }

  // Generic backend errors
  if (lowerMessage.includes('internal server error') ||
      lowerMessage.includes('500') ||
      lowerMessage.includes('server error')) {
    return 'An error occurred. Please try again later.';
  }

  // If the error already looks safe and helpful, return it as-is
  const safePatterns = [
    'invalid credentials',
    'please check your',
    'authentication failed',
    'please try again',
    'invalid email or password',
    'please verify your information',
    'this field is required',
    'enter a valid',
    'ensure this field',
    'may not be blank',
    'must contain only',
    'at least',
    'no more than'
  ];

  if (safePatterns.some(pattern => lowerMessage.includes(pattern))) {
    return message;
  }

  // Default: return message as-is if it doesn't match any dangerous pattern
  // This allows helpful validation messages through
  return message;
}

/**
 * Map specific error codes to user-friendly messages
 */
export function getErrorMessageByCode(statusCode: number): string {
  const errorMap: Record<number, string> = {
    400: 'Invalid request. Please check your input.',
    401: 'Authentication required. Please sign in.',
    403: 'Access denied. You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'A conflict occurred. This data may already exist.',
    422: 'The data you provided could not be processed.',
    429: 'Too many requests. Please try again later.',
    500: 'A server error occurred. Please try again later.',
    502: 'Service temporarily unavailable. Please try again later.',
    503: 'Service temporarily unavailable. Please try again later.',
  };

  return errorMap[statusCode] || 'An unexpected error occurred.';
}

/**
 * Combine error message sanitization with status code mapping
 */
export function getDisplayError(error: any, statusCode?: number): string {
  // First try to sanitize the error message
  const sanitized = sanitizeErrorMessage(error);

  // If status code is provided and the sanitized message is generic,
  // try to provide more specific guidance based on status code
  if (statusCode && sanitized === 'An error occurred. Please try again.') {
    return getErrorMessageByCode(statusCode);
  }

  return sanitized;
}

/**
 * Extract error from various API response formats
 */
export function extractErrorFromResponse(response: any): string {
  if (!response) {
    return 'An error occurred. Please try again.';
  }

  // Try different response formats
  if (response.data) {
    return sanitizeErrorMessage(response.data);
  }

  if (response.error) {
    return sanitizeErrorMessage(response.error);
  }

  if (response.message) {
    return sanitizeErrorMessage(response.message);
  }

  return sanitizeErrorMessage(response);
}
