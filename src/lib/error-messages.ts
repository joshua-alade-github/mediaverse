export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You must be logged in to perform this action',
  NOT_FOUND: 'The requested resource was not found',
  FORBIDDEN: 'You do not have permission to perform this action',
  VALIDATION: 'Please check your input and try again',
  DEFAULT: 'An unexpected error occurred',
  NETWORK: 'Network error. Please check your connection',
  RATE_LIMIT: 'Too many requests. Please try again later',
} as const;