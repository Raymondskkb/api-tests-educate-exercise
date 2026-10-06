# Youth Attendance API Test Suite

This project contains a Playwright-based API test suite for validating the youth attendance submission contract using mocked HTTP responses via `page.route()`.

## Overview
The tests simulate a `POST` request to `https://testApi.com/api/v1/attendance` and assert the expected API behavior without needing a live backend.

The suite is implemented in TypeScript and uses:
- Playwright test runner
- `page.route()` to intercept and mock network responses
- shared payload fixtures in `utils/testdata.ts`
- a reusable request helper in `utils/utils.ts`

## Implemented Scenarios
1. Happy path: valid payload returns `201 Created` with a success response.
2. Invalid status: a participant with status `LATE` returns `400 Bad Request`.
3. Missing required field: missing `mentor_id` returns `400 Bad Request`.
4. Empty participants list: `participants: []` returns `400 Bad Request`.
5. Duplicate participant IDs: duplicate `participant_id` values in the same batch return `400 Bad Request`.

## Project Structure
- `tests/attendance.spec.ts` — API test cases and assertions
- `utils/testdata.ts` — valid/invalid payload fixtures and mock endpoint URL
- `utils/utils.ts` — helper that sends the POST request from the page context

## How to Run
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the test suite:
   ```bash
   npx playwright test
   ```
3. Open the HTML report:
   ```bash
   npx playwright show-report
   ```

## Notes
- This repository is intentionally mock-driven; it validates response contracts and validation behavior rather than hitting a real API service.
- The suite currently includes 5 passing tests covering both success and failure scenarios.
- If Playwright browsers are not installed yet, run:
  ```bash
  npx playwright install
  ```