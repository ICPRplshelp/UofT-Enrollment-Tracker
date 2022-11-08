export interface CVariant{
    c: string;  // campus: 0135
    w: string;  // weight: HY
    s: string;  // session: FSY
}

export interface Course {
    n: string;  // course number
    v: CVariant[];  // list of course variants
}

export interface Designator {
    des: string;  // the designator, first three letters
    courses: Course[];
}

export interface DesCol {
    liDes: Designator[];
}