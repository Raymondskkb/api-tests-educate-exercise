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

        expect(response.status).toBe(201);
        expect(response.body.status).toBe("success");
        expect(response.body.message).toBe("Youth attendance recorded successfully");
        expect(response.body.data.total_recorded).toBe(2);
        expect(response.body.data.mentor_id).toBe("MNT-1042");
    });

    /* -------------------------------------------------------------------------- */
    /*                      2. VALIDATION FAILURE TESTS                           */
    /* -------------------------------------------------------------------------- */
    test('2.Invalid status (e.g. "LATE") returns HTTP 400 Bad Request', async ({ page }) => {
        // Playwright Mock: Intercept and mock 400 Bad Request for unapproved status
        await page.route(ROUTE, async (route) => {
            const data = route.request().postDataJSON();
            console.log("payload Body:", data); // Debugging line
            const hasInvalidStatus = data.participants?.some(
                (p: { status: string }) => !["PRESENT", "ABSENT"].includes(p.status)
            
            );
            console.log("validity status:", hasInvalidStatus); // Debugging line

            if (hasInvalidStatus) {
                return route.fulfill(mocks.invalidStatus);
            }

            return route.fulfill(mocks.validationPassed);
        });

        const response = await sendAttendanceRequest(page, payloads.invalidStatusPayload, ENDPOINT);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe("error");
        expect(response.body.message).toContain("status must be either 'PRESENT' or 'ABSENT'");
    });

    test("2b.Missing mentor_id returns HTTP 400 Bad Request", async ({ page }) => {
        // Playwright Mock: Intercept and return 400 Bad Request for missing required field
        await page.route(ROUTE, async (route) => {
            await route.fulfill(mocks.missingMentorId);
        });

        const response = await sendAttendanceRequest( page, payloads.missingMentorId, ENDPOINT );

        expect(response.status).toBe(400);
        expect(response.body.status).toBe("error");
        expect(response.body.message).toBe("mentor_id is required");
    });

    /* -------------------------------------------------------------------------- */
    /*                            3. EDGE CASE TESTS                              */
    /* -------------------------------------------------------------------------- */
    test("3. Empty participants array returns HTTP 400 Bad Request", async ({ page }) => {
        // Playwright Mock: Inspect payload and return 400 Bad Request if empty array
        await page.route(ROUTE, async (route) => {
            const data = route.request().postDataJSON();

            if (!data.participants || data.participants.length === 0) {
                return route.fulfill(mocks.emptyParticipants);
            }
            return route.fulfill(mocks.validationPassed);
        });

        const response = await sendAttendanceRequest(
            page,
            payloads.missingParticipantsPayload,
            ENDPOINT
        );

        expect(response.status).toBe(400);
        expect(response.body.status).toBe("error");
        expect(response.body.message).toContain("participants array cannot be empty");
    });

    test("3b. Duplicate participant_ids in same request returns HTTP 400 Bad Request", async ({ page }) => {
        // Playwright Mock: Detect duplicate IDs and mock HTTP 400 Bad Request
        await page.route(ROUTE, async (route) => {
            const data = route.request().postDataJSON();
            const ids = data.participants?.map(
                (p: { participant_id: string }) => p.participant_id,
            ) || [];
            const hasDuplicates = new Set(ids).size !== ids.length;

            if (hasDuplicates) {
                return route.fulfill(mocks.duplicateParticipant);
            }

            return route.fulfill(mocks.validationPassed);
        });

        const response = await sendAttendanceRequest( page, payloads.duplicateParticipantPayload, ENDPOINT );

        expect(response.status).toBe(400);
        expect(response.body.status).toBe("error");
        expect(response.body.message).toContain("Duplicate participant_id detected");
    });
});
