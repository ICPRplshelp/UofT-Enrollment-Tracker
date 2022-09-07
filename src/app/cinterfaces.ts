export interface Course {
    title: string,
    code: string,
    faculty: string,
    timeIntervals: number[],
    meetings: Meeting[],
}

export interface EnrollmentCapComplex{
    capChanges: number[][];  // [UNIX, CAP]
    initialCap: number;  // THE STARTING CAP
}

export interface Meeting{
    meetingNumber: string;
    instructors: string[][];
    enrollmentLogs: number[];
    enrollmentCap: number;
    enrollmentCapComplex?: EnrollmentCapComplex;
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

export interface SessionsRaw{
    sessions: SessionInfo[];
}

export interface SessionInfo{
    sessionCode: string;  // must match the name of the folder
    name: string;  // either Fall-Winter AAAA-BBBB or Summer CCCC
}