import { Injectable } from '@angular/core';
import { CrsgetterService } from '../crsgetter.service';
import { CVariant, DesCol } from './autocompleteinterfaces';

@Injectable({
  providedIn: 'root'
})
export class AutoCompleteService {

  constructor(private crsgetter: CrsgetterService) {

    this.reloadAutocomplete(crsgetter);

   }

  reloadAutocomplete(crsgetter: CrsgetterService) {
    let tempData: DesCol;
    crsgetter.getAllCourseList().subscribe((data) => {
      tempData = data;
    },
      () => {
      },
      () => {
        this.msList = tempData;
      });
  }

  autoCompleteSearch(courseCode: string): string {

    let des = '';
    let code = '';
    let campus = null;
    let weight = null;
    let session = null;

    if(courseCode.match(/^[A-Z]{3}[A-D\d]\d{2}[HY][0135][FSY]/)){
      if(courseCode.match(/^[A-Z]{3}[A-D\d]\d{2}[HY][0135][FSY].*[FSY]?$/)){
        return courseCode.slice(0, 8) + '-' + courseCode[courseCode.length - 1];
      }
      return courseCode.slice(0, 8) + '-' + courseCode[9];  // all information is given, don't ask otherwise
    } else if(courseCode.match(/^[A-Z]{3}[A-D\d]\d{2}[HY][0135]/)){
      des = courseCode.slice(0, 3);
      code = courseCode.slice(0, 6);
      weight = courseCode[6];
      campus = courseCode[7];
    } else if (courseCode.match(/^[A-Z]{3}[A-D\d]\d{2}[HY][FSY]/)){
      des = courseCode.slice(0, 3);
      code = courseCode.slice(0, 6);
      weight = courseCode[6];
      session = courseCode[7];
    } else if (courseCode.match(/^[A-Z]{3}[A-D\d]\d{2}[FSY]/)){
      des = courseCode.slice(0, 3);
      code = courseCode.slice(0, 6);
      session = courseCode[6];
    } else if (courseCode.match(/^[A-Z]{3}[A-D\d]\d{2}[HY]/)){
      des = courseCode.slice(0, 3);
      code = courseCode.slice(0, 6);
      weight = courseCode[6];
    } else if (courseCode.match(/^[A-Z]{3}[A-D\d]\d{2}/)){
      // console.log("AAA100")
      des = courseCode.slice(0, 3);
      code = courseCode.slice(0, 6);
      
    }

    let candidates = this._autoCompleteSearchHelper(des, code, campus , weight, session);
    if(candidates.length === 0){
      // console.log("Candidates empty, sorry");
      return courseCode;
    }

    // only the first suggestion is useful; everything else isn't.
    return candidates[0];
  }

  msList: DesCol | undefined;  // the entire master list

  /**
   * Return all potential matches of a course.
   * @param des course designator
   * @param code course code, CSC110
   * @param campus campus, 0135
   * @param weight weight, HY
   * @param session session, FSY
   * @param ms to be removed
   * @returns all potential matches
   */
  _autoCompleteSearchHelper(des: string, code: string, campus: string | null,
    weight: string | null, session: string | null): string[] {
      if(this.msList === undefined){
        // console.log("MSLIST NOT LOADED YET");
        return [];
      }
      let unwrappedList = this.msList.liDes;
      let foundDes = unwrappedList.find(x => x.des === des);
      // console.log("reach unwrapped", foundDes);
      if(foundDes === undefined){
        return [];
      }  // and that's how we know finddes is not undefined

      // console.log(code);
      let foundCrs = foundDes.courses.find(x => x.n === code);
      if(foundCrs === undefined){
        return [];
      }
      // console.log("reach COURSES", foundCrs);

      // foundcrs is our course; now start the list and add
      // all possible qualities in this list

      let cVarList: CVariant[] = [];
      for(let cvr of foundCrs.v){
        let c1 = this.equalOrMissing(cvr.c, campus);
        let c2 = this.equalOrMissing(cvr.s, session);
        let c3 = this.equalOrMissing(cvr.w, weight);
        if(c1 && c2 && c3){
          cVarList.push(cvr);
        }
      }

      let ls: string[] = [];
      for(let cv2 of cVarList){
        ls.push(code + this.cvrToCourseSuffix(cv2));
      }
      console.log(ls);
      return ls;
    }

  /**
   * 
   * @param cvr the CVariant
   * @returns the suffix of the course, no dash
   */
  cvrToCourseSuffix(cvr: CVariant){
    return cvr.w + cvr.c + '-' + cvr.s;
  }
  

  equalOrMissing(s1: string, s2: string | null): boolean {
    // console.log("equal or missing", s1, s2);
    if (s2 === null){
      return true;
    }
    else {
      return s1 === s2;
    }
  }
}
