import { test, expect } from "@playwright/test";
import { sendAttendanceRequest } from "../utils/utils";
import { payloads, mocks, ENDPOINT, ROUTE } from "../utils/testdata";

test.describe("Youth Attendance API", () => {
    /* -------------------------------------------------------------------------- */
    /*                            1. HAPPY PATH TEST                              */
    /* -------------------------------------------------------------------------- */
    test("1.Valid payload returns HTTP 201 and success response", async ({ page }) => {
        // Playwright Mock: Intercept dummy endpoint and mock HTTP 201 Created
        await page.route(ROUTE, async (route) => {
            await route.fulfill(mocks.created);
        });

        const response = await sendAttendanceRequest( page, payloads.validPayload, ENDPOINT );

        expect(response.status).toBe(mocks.created.status);
        expect(response.body).toEqual(mocks.created.json);
        expect(response.body.data.mentor_id).not.toBeNull();
    });

    /* -------------------------------------------------------------------------- */
    /*                      2. VALIDATION FAILURE TESTS                           */
    /* -------------------------------------------------------------------------- */
    test('2.Invalid status (e.g. "LATE") returns HTTP 400 Bad Request', async ({ page }) => {
        // Playwright Mock: Intercept and mock 400 Bad Request for unapproved status
        await page.route(ROUTE, async (route) => {
            await route.fulfill( mocks.invalidStatus);
        });

        const response = await sendAttendanceRequest(page, payloads.invalidStatusPayload, ENDPOINT);
        
        expect(response.status).toBe(mocks.invalidStatus.status);
        expect(response.body).toEqual(mocks.invalidStatus.json);
    });

    test("2b.Missing mentor_id returns HTTP 400 Bad Request", async ({ page }) => {
        // Mock 400 Bad Request for missing required field
        await page.route(ROUTE, async (route) => 
            await route.fulfill(mocks.missingMentorId));
      
        const response = await sendAttendanceRequest( page, payloads.missingMentorId, ENDPOINT );

        expect(response.status).toBe(mocks.missingMentorId.status);
        expect(response.body).toEqual(mocks.missingMentorId.json);
    });

    /* -------------------------------------------------------------------------- */
    /*                            3. EDGE CASE TESTS                              */
    /* -------------------------------------------------------------------------- */
    test("3. Empty participants array returns HTTP 400 Bad Request", async ({ page }) => {
        // Mock 400 Bad Request if empty array
        await page.route(ROUTE, async (route) => {
            return route.fulfill( mocks.emptyParticipants);
        });

        const response = await sendAttendanceRequest( page, payloads.missingParticipantsPayload, ENDPOINT );

        expect(response.status).toBe(mocks.emptyParticipants.status);
        expect(response.body).toEqual(mocks.emptyParticipants.json);
        expect(response.body.message).toContain("participants array cannot be empty");
    });

    test("3b. Duplicate participant_ids in same request returns HTTP 400 Bad Request", async ({ page }) => {
        //mock HTTP 400 Bad Request
        await page.route(ROUTE, async (route) => {
            return route.fulfill(mocks.duplicateParticipant);
        });

        const response = await sendAttendanceRequest( page, payloads.duplicateParticipantPayload, ENDPOINT );

        expect(response.status).toBe(mocks.duplicateParticipant.status);
        expect(response.body).toEqual(mocks.duplicateParticipant.json);
        expect(response.body.message).toContain("Duplicate participant_id detected");
    });
});
