import { test, expect, Page } from '@playwright/test';
import { sendAttendanceRequest } from '../utils/utils';
import { base_url, validPayload, missingMentorId, missingParticipantsPayload, invalidStatusPayload, duplicateParticipantPayload } from '../utils/testdata';

test.describe('Youth Attendance API - Playwright Mock Suite', () => {
    /* -------------------------------------------------------------------------- */
    /*                            1. HAPPY PATH TEST                              */
    /* -------------------------------------------------------------------------- */
    test('1.Valid payload returns HTTP 201 and success response', async ({ page }) => {

        // Playwright Mock: Intercept dummy endpoint and mock HTTP 201 Created
        await page.route(base_url, async (route) => {
            await route.fulfill({
                status: 201,
                contentType: 'application/json',
                json: {
                    status: 'success',
                    message: 'Youth attendance recorded successfully',
                        data: {
                            attendance_record_id: 'REC-2026-001',
                            mentor_id: 'MNT-1042',
                            bootcamp_id: 'KMP-2026-09',
                            session_date: '2026-09-11',
                            total_recorded: 2,
                            present_count: 1,
                            absent_count: 1,
                        },
                },
            });
        });

        const response = await sendAttendanceRequest(page, validPayload);

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
        expect(response.body.message).toBe('Youth attendance recorded successfully');
        expect(response.body.data.total_recorded).toBe(2);
        expect(response.body.data.mentor_id).toBe('MNT-1042');
    });

    /* -------------------------------------------------------------------------- */
    /*                      2. VALIDATION FAILURE TESTS                           */
    /* -------------------------------------------------------------------------- */
    test('2.Invalid status (e.g. "LATE") returns HTTP 400 Bad Request', async ({ page }) => {

        // Playwright Mock: Intercept and mock 400 Bad Request for unapproved status
        await page.route(base_url, async (route) => {
            const data = route.request().postDataJSON();
            const hasInvalidStatus = data.participants?.some(
                (p: { status: string }) => !['PRESENT', 'ABSENT'].includes(p.status)
            );

            if (hasInvalidStatus) {
                return route.fulfill({
                    status: 400,
                    contentType: 'application/json',
                    json: {
                        status: 'error',
                        error_code: 'INVALID_STATUS',
                        message: "Validation Error: status must be either 'PRESENT' or 'ABSENT'. Received 'LATE'",
                    },
                });
            }

            return route.fulfill({ status: 201, json: { status: 'success' } });
        });

        const response = await sendAttendanceRequest(page, invalidStatusPayload);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toContain("status must be either 'PRESENT' or 'ABSENT'");
    });

    test('2b.Missing mentor_id returns HTTP 400 Bad Request', async ({ page }) => {

        // Playwright Mock: Intercept and return 400 Bad Request for missing required field
        await page.route(base_url, async (route) => {
            await route.fulfill({
                status: 400,
                contentType: 'application/json',
                json: {
                    status: 'error',
                    error_code: 'MISSING_FIELD',
                    message: 'mentor_id is required',
                },
            });
        });

        const response = await sendAttendanceRequest(page, missingMentorId);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toBe('mentor_id is required');
    });

    /* -------------------------------------------------------------------------- */
    /*                            3. EDGE CASE TESTS                              */
    /* -------------------------------------------------------------------------- */
    test('3. Empty participants array returns HTTP 400 Bad Request', async ({ page }) => {

        // Playwright Mock: Inspect payload and return 400 Bad Request if empty array
        await page.route(base_url, async (route) => {
            const data = route.request().postDataJSON();

            if (!data.participants || data.participants.length === 0) {
                return route.fulfill({
                    status: 400,
                    contentType: 'application/json',
                    json: {
                        status: 'error',
                        error_code: 'EMPTY_PARTICIPANTS',
                        message: 'participants array cannot be empty. At least one participant is required.',
                    },
                });
            }

            return route.fulfill({ status: 201, json: { status: 'success' } });
        });

        const response = await sendAttendanceRequest(page, missingParticipantsPayload);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toContain('participants array cannot be empty');
    });

    test('3b. Duplicate participant_ids in same request returns HTTP 400 Bad Request', async ({ page }) => {

        // Playwright Mock: Detect duplicate IDs and mock HTTP 400 Bad Request
        await page.route(base_url, async (route) => {
            const data = route.request().postDataJSON();
            const ids = data.participants?.map((p: { participant_id: string }) => p.participant_id) || [];
            const hasDuplicates = new Set(ids).size !== ids.length;

            if (hasDuplicates) {
                return route.fulfill({
                    status: 400,
                    contentType: 'application/json',
                    json: {
                        status: 'error',
                        error_code: 'DUPLICATE_PARTICIPANT_ID',
                        message: 'Duplicate participant_id detected within the same request batch: YTH-8821',
                    },
                });
            }

            return route.fulfill({ status: 201, json: { status: 'success' } });
        });

        const response = await sendAttendanceRequest(page, duplicateParticipantPayload);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toContain('Duplicate participant_id detected');
    });
});