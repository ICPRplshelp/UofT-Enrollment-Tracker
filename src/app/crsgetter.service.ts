import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {HttpClient} from '@angular/common/http';
import { Course, ImportantTimestamps, ImportantTimestampsBundle, SessionCollection, TopCourses } from './cinterfaces';
import { DesCol } from './shared/autocompleteinterfaces';

@Injectable({
  providedIn: 'root'
})
export class CrsgetterService {

  constructor(private http: HttpClient) { }

  localMode = false;

  session = "20229";
  crsPath = this.localMode ? "api/" : "https://raw.githubusercontent.com/ICPRplshelp/Enrollment-Data/master/";
  suffix = ".json";
  

  sanitizeSession(): string {
    if(this.session.match(/^\d{5}$/)){
      return this.session;
    } else {
      return "20229";
    }
  }

  crsToPath(crsCode: string): string {
    return this.crsPath  + this.sanitizeSession() +
    "/" + crsCode + this.suffix; 
    // return this.crsPath + crsCode + this.suffix;
  }


  private _previousCourse: string = "";


  /**
   * For use right before querying, check if
   * I was about to query the same thing twice.
   * 
   * @param crsCode the course code to check
   * @returns whether crsCode === _previousCourse
   */
  checkJustSearched(crsCode: string): boolean {
    return crsCode === this._previousCourse;
  }

  /**
   * A JSON loader for any course.
   * 
   * @param crsCode the course code like CSC110Y1-F
   * @returns an observable of the course data
   */
  getCourse(crsCode: string): Observable<Course> {
    this._previousCourse = crsCode;
    const cPath = this.crsToPath(crsCode);
    return this.http.get<Course>(cPath);
  }

  // remember, get requests are cached by default. This means
  // you do not need to worry about sending too many requests
  // to the same URL.
  getImportantDates(): Observable<ImportantTimestamps> {
    const tStampPath = this.crsPath + this.sanitizeSession() + "/" + "constants" + this.suffix;
    return this.http.get<ImportantTimestamps>(tStampPath);
  }

  getImportantDatesBundle(): Observable<ImportantTimestampsBundle[]> {
    const tStampRequestPath = this.crsPath + this.sanitizeSession() + "/" + "AAtcconstants" + this.suffix;
    return this.http.get<ImportantTimestampsBundle[]>(tStampRequestPath);
  }

  getSessionCollection(): Observable<SessionCollection> {
    const sessionPath = this.crsPath + "sessions.json";
    return this.http.get<SessionCollection>(sessionPath);
  }

  getAllCourseList(): Observable<DesCol> {
    const tMPath = this.crsPath + this.sanitizeSession() + "/AAclistall.json";
    return this.http.get<DesCol>(tMPath);
  }

  getTopCoursesList(): Observable<TopCourses> {
    const tMPath = this.crsPath + this.sanitizeSession() + "/aaTopCourses.json";
    return this.http.get<TopCourses>(tMPath);
  }


}
