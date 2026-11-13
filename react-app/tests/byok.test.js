// Automated Unit & Integration Tests for BYOK and Screenshot Parser Services
import { parseCleanJSON, reconcileExtractedData, buildFinalMergePayload } from '../src/services/screenshotParser.js';
import { PROVIDERS, GOOGLE_MODELS, GROQ_TEXT_MODELS, GROQ_VISION_MODELS, generateBYOKCompletion, analyzeBYOKVision } from '../src/services/byokService.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('--- Testing BYOK Models & Metadata ---');
assert(PROVIDERS.GOOGLE === 'google', 'Google provider key matches');
assert(PROVIDERS.GROQ === 'groq', 'Groq provider key matches');
assert(GOOGLE_MODELS.some(m => m.id === 'gemini-2.5-flash'), 'Gemini 2.5 Flash is listed');
assert(GROQ_TEXT_MODELS.some(m => m.id === 'llama-3.3-70b-versatile'), 'Groq Llama 3.3 70B is listed');
assert(GROQ_VISION_MODELS.some(m => m.id === 'llama-3.2-11b-vision-preview'), 'Groq Llama 3.2 11B Vision is listed');

console.log('\n--- Testing JSON Sanitizer & Parser (parseCleanJSON) ---');
// 1. Standard JSON
const test1 = parseCleanJSON('{"name": "Database Systems", "attended": 10, "total": 12}');
assert(test1.name === 'Database Systems' && test1.attended === 10, 'Parses standard clean JSON');

// 2. Wrapped in Markdown Fences
const test2 = parseCleanJSON('```json\n{"status": "ok", "count": 5}\n```');
assert(test2.status === 'ok' && test2.count === 5, 'Strips ```json ... ``` fences');

// 3. Conversational wrapper text
const test3 = parseCleanJSON('Here is the extracted information you requested:\n```\n{"detectedType": "both"}\n```\nHope this helps!');
assert(test3.detectedType === 'both', 'Extracts JSON from conversational text');

// 4. Trailing commas & curly quotes
const test4 = parseCleanJSON('{\n  "title": “Test Course”,\n  "count": 4,\n}');
assert(test4.title === 'Test Course' && test4.count === 4, 'Cleans trailing commas and curly quotes');

console.log('\n--- Testing Reconcile Extracted Data ---');
const currentSubjects = ['Operating Systems', 'Database Management', 'Computer Networks'];
const currentAttendance = {
  0: { attended: 15, total: 20 },
  1: { attended: 18, total: 22 },
  2: { attended: 10, total: 14 }
};

const extractedSubjects = [
  { name: 'database management', code: 'CS302', attended: 20, total: 24, percentage: 83.3 },
  { name: 'Computer Networks Lab', code: 'CS305', attended: 12, total: 12, percentage: 100 },
  { name: 'Compiler Design', code: 'CS304', attended: 8, total: 10, percentage: 80 }
];

const reconciled = reconcileExtractedData({
  extractedSubjects,
  extractedTimetable: {},
  currentSubjects,
  currentAttendance
});

assert(reconciled.subjectMappings.length === 3, 'Maps all 3 extracted subjects');
assert(reconciled.subjectMappings[0].isExisting === true, 'Matches "database management" to existing');
assert(reconciled.subjectMappings[0].matchedIndex === 1, 'Matched index is 1 for Database Management');
assert(reconciled.subjectMappings[2].isExisting === false, 'Recognizes Compiler Design as new');

console.log('\n--- Testing Merge & Payload Builder (buildFinalMergePayload) ---');
const extractedTimetable = {
  monday: { '1': 'Database Management', '2': 'Free', '3': 'Compiler Design', '4': 'Lunch' }
};

const payload = buildFinalMergePayload({
  subjectMappings: reconciled.subjectMappings,
  extractedTimetable,
  extractedTimings: { '1': '09:00', '2': '10:00' },
  currentSubjects,
  currentAttendanceData: currentAttendance,
  currentTimetable: {},
  currentTimings: {},
  options: {
    updateAttendance: true,
    updateTimetable: true,
    updateTimings: true,
    mergeMode: 'merge'
  }
});

assert(payload.subjects.includes('Compiler Design'), 'Compiler Design added to final subjects');
assert(payload.subjects.includes('Computer Networks Lab'), 'Computer Networks Lab added to final subjects');
assert(payload.timetable.monday[1] === 1, 'Monday P1 mapped to subject index 1 (Database Management)');
assert(payload.timetable.monday[2] === -1, 'Monday P2 mapped to -1 for Free');
assert(payload.timetable.monday[4] === -1, 'Monday P4 mapped to -1 for Lunch');
assert(payload.classTimings['1'] === '09:00', 'Timings P1 mapped to 09:00');
assert(payload.attendanceData[1].attended === 20, 'Database Management attended count updated to 20');
assert(payload.attendanceData[1].total === 24, 'Database Management total count updated to 24');

console.log('\n--- Testing BYOK Key Validation & Error Handling ---');
// Test 1: Google Gemini key missing
try {
  await generateBYOKCompletion({
    messages: [{ role: 'user', content: 'hello' }],
    overrideProvider: PROVIDERS.GOOGLE
  });
  assert(false, 'Should have thrown error when Google key is missing');
} catch (err) {
  assert(
    err.message.includes('API key not entered') || err.message.includes('key not entered'),
    `Google throws "API key not entered" error: "${err.message}"`
  );
}

// Test 2: Groq key missing
try {
  await generateBYOKCompletion({
    messages: [{ role: 'user', content: 'hello' }],
    overrideProvider: PROVIDERS.GROQ
  });
  assert(false, 'Should have thrown error when Groq key is missing');
} catch (err) {
  assert(
    err.message.includes('API key not entered') || err.message.includes('key not entered'),
    `Groq throws "API key not entered" error: "${err.message}"`
  );
}

// Test 3: Vision key missing
try {
  await analyzeBYOKVision({
    imageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    prompt: 'test'
  });
  assert(false, 'Should have thrown error when Vision key is missing');
} catch (err) {
  assert(
    err.message.includes('API key not entered') || err.message.includes('key not entered'),
    `Vision throws "API key not entered" error: "${err.message}"`
  );
}

console.log(`\n========================================`);
console.log(`Tests Completed: ${passed} Passed, ${failed} Failed`);
console.log(`========================================`);

if (failed > 0) {
  process.exit(1);
}
