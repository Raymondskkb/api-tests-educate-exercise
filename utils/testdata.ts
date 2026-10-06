export const validPayload = {
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
};

export const missingMentorId = {
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
};

export const missingParticipantsPayload = {
    mentor_id: "MNT-1042",
    bootcamp_id: "KMP-2026-09",
    session_date: "2026-09-11",
    participants: [],
};

export const invalidStatusPayload = {
    mentor_id: "MNT-1042",
    bootcamp_id: "KMP-2026-09",
    session_date: "2026-09-11",
    participants: [
        {
            participant_id: "YTH-8821",
            status: "LATE",
        },
    ],
};

export const duplicateParticipantPayload = {
    mentor_id: 'MNT-1042',
    bootcamp_id: 'KMP-2026-09',
    session_date: '2026-09-11',
    participants: [
        { participant_id: 'YTH-8821', status: 'PRESENT' },
        { participant_id: 'YTH-8821', status: 'ABSENT' }, // Duplicate ID
    ],
};

export const base_url = "https://testApi.com/api/v1/attendance";
