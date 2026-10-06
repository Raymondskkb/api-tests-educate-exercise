import { Page } from "@playwright/test";
import { base_url } from "./testdata";

/** * Reusable helper utility to dispatch POST request from the page context * so Playwright's page.route() mock function intercepts it seamlessly. */ export const sendAttendanceRequest =
  (page: Page, payload: Record<string, unknown>) => {
    return page.evaluate(
      async ({ url, payload }) => {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        return { status: response.status, body: await response.json() };
      },
      { url: base_url, payload },
    );
  };
