const Helpers = require('../../../../utilities/helpers');

// Mock logger to capture warnings
jest.mock('../../../../lib/logger', () => ({
  warn: jest.fn(),
}));

const logger = require('../../../../lib/logger');

describe.only('Helpers.getEnvBoolean', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns boolean value if input is boolean', () => {
    expect(Helpers.getEnvBoolean(true)).toBe(true);
    expect(Helpers.getEnvBoolean(false)).toBe(false);
  });

  it('returns fallback if input is null or undefined', () => {
    expect(Helpers.getEnvBoolean(null)).toBe(false);
    expect(Helpers.getEnvBoolean(undefined)).toBe(false);
  });

  it('returns true for string "true" (case-insensitive)', () => {
    expect(Helpers.getEnvBoolean('true')).toBe(true);
    expect(Helpers.getEnvBoolean(' TRUE ')).toBe(true);
  });

  it('returns false for string "false" (case-insensitive)', () => {
    expect(Helpers.getEnvBoolean('false')).toBe(false);
    expect(Helpers.getEnvBoolean(' FALSE ')).toBe(false);
  });

  it('returns fallback and logs warning for invalid string', () => {
    expect(Helpers.getEnvBoolean('enabled', true, 'SERVE_STATIC_FILES')).toBe(true);
    expect(logger.warn).toHaveBeenCalledWith(
      'Invalid environment variable SERVE_STATIC_FILES value "enabled" – must be "true" or "false"; defaulting to true'
    );
  });

  it('returns fallback and logs warning for invalid type', () => {
    expect(Helpers.getEnvBoolean(123, false, 'SERVICE_UNAVAILABLE')).toBe(false);
    expect(logger.warn).toHaveBeenCalledWith(
      'Invalid environment variable SERVICE_UNAVAILABLE type (number); defaulting to false'
    );
  });
});
