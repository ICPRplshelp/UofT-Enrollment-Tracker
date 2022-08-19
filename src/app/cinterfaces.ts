export interface Course {
    title: string,
    code: string,
    faculty: string,
    timeIntervals: number[],
    meetings: Meeting[],
}

export interface Meeting{
    meetingNumber: string,
    instructors: string[][],
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