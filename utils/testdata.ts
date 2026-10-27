import dotenv from "dotenv";
dotenv.config({ quiet: true });

export const ENDPOINT = "/api/v1/attendance";
export const ROUTE = "**/api/v1/attendance";
export const BASE_URL = process.env.BASEURL;
const json = "application/json";

export const payloads = {
  validPayload: {
    mentor_id: "MNT-1042",
    bootcamp_id: "KMP-2026-09",
    session_date: "2026-09-11",
    participants: [
      {
        participant_id: "YTH-8821",
        status: "PRESENT",
      },
      {
        participant_id: "YTH-8822",
        status: "ABSENT",
      },
    ],
  },
  missingMentorId: {
    bootcamp_id: "KMP-2026-09",
    session_date: "2026-09-11",
    participants: [
      {
        participant_id: "YTH-8821",
        status: "PRESENT",
      },
      {
        participant_id: "YTH-8822",
        status: "ABSENT",
      },
    ],
  },
  missingParticipantsPayload: {
    mentor_id: "MNT-1042",
    bootcamp_id: "KMP-2026-09",
    session_date: "2026-09-11",
    participants: [],
  },
  invalidStatusPayload: {
    mentor_id: "MNT-1042",
    bootcamp_id: "KMP-2026-09",
    session_date: "2026-09-11",
    participants: [
      {
        participant_id: "YTH-8821",
        status: "LATE",
      },
    ],
  },
  duplicateParticipantPayload: {
    mentor_id: "MNT-1042",
    bootcamp_id: "KMP-2026-09",
    session_date: "2026-09-11",
    participants: [
      { participant_id: "YTH-8821", status: "PRESENT" },
      { participant_id: "YTH-8821", status: "ABSENT" }, // Duplicate ID
    ],
  },
};

export const mocks = {
  created: {
    status: 201,
    contentType: "application/json",
    json: {
      status: "success",
      message: "Youth attendance recorded successfully",
      data: {
        attendance_record_id: "REC-2026-001",
        mentor_id: "MNT-1042",
        bootcamp_id: "KMP-2026-09",
        session_date: "2026-09-11",
        total_recorded: 2,
        present_count: 1,
        absent_count: 1,
      },
    },
  },
  validationPassed: {
    status: 201,
    contentType: json,
    json: { status: "success" },
  },
  invalidStatus: {
    status: 400,
    contentType: json,
    json: {
      status: "error",
      error_code: "INVALID_STATUS",
      message:
        "Validation Error: status must be either 'PRESENT' or 'ABSENT'. Received 'LATE'",
    },
  },
  missingMentorId: {
    status: 400,
    contentType: json,
    json: {
      status: "error",
      error_code: "MISSING_FIELD",
      message: "mentor_id is required",
    },
  },
  emptyParticipants: {
    status: 400,
    contentType: json,
    json: {
      status: "error",
      error_code: "EMPTY_PARTICIPANTS",
      message:
        "participants array cannot be empty. At least one participant is required.",
    },
  },
  duplicateParticipant: {
    status: 400,
    contentType: json,
    json: {
      status: "error",
      error_code: "DUPLICATE_PARTICIPANT_ID",
      message:
        "Duplicate participant_id detected within the same request batch: YTH-8821",
    },
  },
};
