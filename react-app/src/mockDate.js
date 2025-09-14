const MOCK_MONDAY_DATE = new Date('2025-09-15T09:00:00'); // Monday date for testing

const OriginalDate = Date;

class MockDate extends OriginalDate {
  constructor(...args) {
    if (args.length === 0) {
      return new OriginalDate(MOCK_MONDAY_DATE);
    }
    return new OriginalDate(...args);
  }

  static now() {
    return MOCK_MONDAY_DATE.getTime();
  }
}

// Assign the mocked Date to global scope in browser or node safely
if (typeof globalThis !== 'undefined') {
  globalThis.Date = MockDate;
} else if (typeof window !== 'undefined') {
  window.Date = MockDate;
} else if (typeof global !== 'undefined') {
  global.Date = MockDate;
}
