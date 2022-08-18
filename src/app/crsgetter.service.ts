import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {HttpClient} from '@angular/common/http';
import { Course, ImportantTimestamps } from './cinterfaces';

@Injectable({
  providedIn: 'root'
})
export class CrsgetterService {

  constructor(private http: HttpClient) { }

  crsPath = "api/20229/";
  suffix = ".json";
  
  crsToPath(crsCode: string): string {
    return this.crsPath + crsCode + this.suffix;
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

  getImportantDates(): Observable<ImportantTimestamps> {
    const tStampPath = this.crsPath + "20229Constants" + this.suffix;
    return this.http.get<ImportantTimestamps>(tStampPath);
  }


}
