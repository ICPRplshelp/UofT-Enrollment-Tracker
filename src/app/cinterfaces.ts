export interface Course {
    code: string,
    timeIntervals: number[],
    meetings: Meeting[],
    currentEnrollment: number,
    finalEnrollment: number,
    drops: number,
    lwds: number,
    cap: number
}

export interface Meeting{
    meetingNumber: string,
    instructor: string,
    isSpecial: string
    enrollmentLogs: number[],
    enrollmentCap: number
}

export interface ImportantTimestamps {
    start: number;
    fourth: number;
    third: number;
    second: number;
    first: number;
    general: number;
    utmutsc: number;
    feeDeadline: number;
    fallFirstDay: number;
    fallWaitlistClosed: number;
    fallEnrollmentEnd: number;
    fallDrop: number;
    fallLWD: number;
    winterStart: number;
    winterWaitlistClosed: number;
    winterEnrollmentEnd: number;
    yearDrop: number;
    winterDrop: number;
    winterLWD: number;
    endOfYear: number;
}