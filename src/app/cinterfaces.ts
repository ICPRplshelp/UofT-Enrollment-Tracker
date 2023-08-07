export interface Course {
    title: string,
    code: string,
    faculty: string,
    timeIntervals: number[],
    meetings: Meeting[],
}

export interface EnrollmentCapChange {
    time: number;
    newCapacity: number;
}


export interface EnrollmentCapComplex{
    capChanges: EnrollmentCapChange[];  // [UNIX, CAP]
    initialCap: number;  // THE STARTING CAP
}


export interface Instructor {
    firstName: string;
    lastName: string;
}

export interface InstructorChangeInstance {
    instructorsAfter: Instructor[];
    timing: number;
}

export interface InstructorLog {
    initinalInstructors: Instructor[];
    instructorChanges: InstructorChangeInstance[];
}


export interface Meeting{
    meetingNumber: string;
    createdAt: number;  // when the meeting is created
    instructors: Instructor[];
    enrollmentLogs: number[];
    enrollmentCap: number;
    enrollmentCapComplex?: EnrollmentCapComplex;
    instructorLog?: InstructorLog;
    delivery?: string;
    isCancelled?: boolean;
}


export interface ImportantTimestampsBundle {
    faculty: string; // target faculty, or blank for the default
    importantTimestamps: ImportantTimestamps;
}

export interface ImportantTimestamps {
    start: number;
    fourth?: number;
    third?: number;
    second?: number;
    first?: number;
    general: number;
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
    fall75?: number;
    fall50?: number;  // if not present, then fall50 == fall drop
    winter75?: number;
    winter50?: number;
    year75?: number;
    year50?: number;
    isSummer?: boolean;
}

export interface SessionsRaw{
    sessions: SessionInfo[];
    
}

export interface SessionInfo{
    sessionCode: string;  // must match the name of the folder
    name: string;  // either Fall-Winter AAAA-BBBB or Summer CCCC
}


export interface SessionCollection {
    sessions: IndividualSessionInfo[];
    default: string;
}

export interface IndividualSessionInfo {
    sessionCode: string;  // the session code. it must be the folder.
    name: string;  // the user-friendly name of the session.
}

export interface TopCourses {
    courses: string[];
}