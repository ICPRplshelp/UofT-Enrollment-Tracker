import {Component, HostListener} from '@angular/core';
import {ChartOptions, ChartDataset, ChartType} from 'chart.js';
import {Course, ImportantTimestamps} from './cinterfaces';
import {CrsgetterService} from './crsgetter.service';
import * as pluginAnnotation from 'chartjs-plugin-annotation';
import { AllCoursesService } from './all-courses.service';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'timetabletracker';

  constructor(private crsgetter: CrsgetterService,
    private ac: AllCoursesService,
    private _snackBar: MatSnackBar) {
  }


  myFavCourses: string[] = ['EAS110Y1-Y', 'POL222H1-F', 'LIN101H1-F', 'CSC384H1-S', 'CHM247H1-S', 'LIN102H1-S', 'POL107H1-F', 'ENV200H1-S', 'FSL100H1-F', 'RSM333H1-S', 'RSM250H1-S', 'MAT237Y1-Y', 'SPA100Y1-Y', 'ENV100H1-F', 'EAS120Y1-Y', 'POL109H1-S', 'RSM222H1-F', 'POL106H1-F', 'SOC100H1-S', 'PSY100H1-F', 'MAT244H1-F', 'GGR124H1-S', 'CSC343H1-S', 'RSM219H1-F', 'PSY100H1-S', 'ECO202Y1-Y', 'POL200Y1-Y', 'ECO200Y1-Y', 'ECO105Y1-Y', 'MAT223H1-S', 'CSC263H1-S', 'STA130H1-S', 'CSC236H1-F', 'ECO204Y1-Y', 'PHY132H1-S', 'STA130H1-F', 'POL101H1-F', 'MAT224H1-S', 'CSC209H1-S', 'ANT100Y1-Y', 'CSC207H1-F', 'SOC150H1-S', 'STA238H1-S', 'PHY131H1-F', 'STA237H1-F', 'PSL301H1-S', 'ECO220Y1-Y', 'CSC108H1-S', 'AST201H1-S', 'BIO220H1-S', 'PSL300H1-F', 'MAT133Y1-Y', 'HMB265H1-F', 'MAT235Y1-Y', 'BCH210H1-F', 'BIO230H1-F', 'AST101H1-F', 'MAT223H1-F', 'MAT137Y1-Y', 'SOC100H1-F', 'CHM135H1-F', 'CSC148H1-S', 'BIO130H1-S', 'CHM136H1-S', 'BIO120H1-F', 'CSC108H1-F', 'ECO101H1-F', 'ECO102H1-S', 'MAT136H1-S', 'MAT135H1-F']
  ;

  courseTitle: string = "TITLE";

  smallMessage = "Your screen is small. Lecture sections are compressed. M#### means the maximum enrollment for that section. Consider rotating your device.";
  importantDates: ImportantTimestamps | null = null; 
  
  
  ngOnInit() {

        // code that grabs the important timestamps
    // and assigns it to this.importantDates
    let tempData: ImportantTimestamps;
    this.crsgetter.getImportantDates().subscribe(
      (data) => {tempData = data},
      () => { console.log("Couldn't load important timestamps") },
      () => {
        // console.log("Updated important dates");
        this.importantDates = tempData;
      }
    );

    // pick something random from myFavCourses
    this.inputCourse = this.myFavCourses[Math.floor(Math.random() * this.myFavCourses.length)];


    this.loadCourseData(this.inputCourse);
    this.smallScreen = window.innerWidth < 768;
    let ref: any;
    if(this.smallScreen){
      ref = this._snackBar.open(this.smallMessage, "GOT IT", {
        duration: 7000
      });
      this.ref = ref;
    }


  }
  ref: any;



  private _smallScreen: boolean = false;
  public get smallScreen(): boolean {
    return this._smallScreen;
  }
  public set smallScreen(value: boolean) {
    let switched = value !== this.smallScreen;

    this._smallScreen = value;
    if(switched)
      this._loadCourseDataHelper();
  }

  smallActivated = 0;

  @HostListener('window:resize', ['$event'])
  onWindowResize(){
    if(window.innerWidth < 480){
      let originalState = this.smallScreen;
      this.smallScreen = true;
      let ref: any;
      if(this.smallScreen && !originalState && this.smallActivated <= 0){
        this.smallActivated++;
        ref = this._snackBar.open(this.smallMessage, "GOT IT", {
          duration: 5000
        });
        this.ref = ref;
      }
    } else {
      if(this.smallScreen){
        this.ref.dismiss();
      }
      this.smallScreen = false;
    }
  }


  public chartPlugins = [pluginAnnotation];

  public scatterChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      x: {
        type: 'time',
      },
    },
    plugins: {
      legend: {
        position: 'right',
      },
    },

    // plugins: {
    //   annotation: {
    //     annotations: [
    //       {
    //         type: 'line',
    //         // mode: 'horizontal',
    //         scaleID: 'y-axis-0',
    //         value: 60,
    //         borderColor: 'red',
    //         borderWidth: 2,
    //       }
    //     ]
    //   }
    // }
  };

  inputCourse: string = 'MAT137Y1-Y';

  data = [
    {x: 0, y: 1},
    {x: 1, y: 2},
  ];

  data2 = [
    {x: 0, y: 0},
    {x: 1, y: 1},
  ];

  public scatterChartData: ChartDataset[] = [
    {
      data: this.data,
      label: 'Series A',
      pointRadius: 0,
      showLine: true,
      backgroundColor: 'rgba(120, 0, 0, 0)',
      borderColor: 'rgba(120,120,0,255)',
    },
    {
      data: this.data2,
      label: 'Series A',
      pointRadius: 0,
      showLine: true,
      backgroundColor: 'rgba(120, 0, 0, 0)',
      borderColor: 'rgba(0,120,0,255)',
    },
  ];
  public scatterChartType: ChartType = 'scatter';

  



  keyDownFunction(event: { keyCode: number }) {
    if (event.keyCode === 13) {
      this.loadCourseData(this.inputCourse);
      // rest of your code
    }
  }

  invalidCourseRegexWarning: string = "This isn't a course code";
  courseDoesNotExist: string =
    "This course doesn't exist or is not offered in this term";
  missingSuffix: string = 'You need the -F/-Y/-S suffix for this';
  missingHY: string =
    'You need the -H/-Y suffix, the campus code, and the -F/-S/-Y suffix for this';
  utmUtsc = "St. George FAS courses only — UTM and UTSC courses are not supported";
  private _curErrorMessage: string = '';
  public get curErrorMessage(): string {
    return this._curErrorMessage;
  }

  public set curErrorMessage(value: string) {
    // if all characters of this._curErrorMessage before the first "!" match value, and it isn't empty, then append a ! to the end of this._curErrorMessage
    let exclamIndex = this._curErrorMessage.indexOf('!');
    if (exclamIndex === -1) exclamIndex = this._curErrorMessage.length;
    if (
      this._curErrorMessage.length > 0 &&
      this._curErrorMessage.substring(0, exclamIndex) === value) {
      this._curErrorMessage += '!';
    } else {
      this._curErrorMessage = value;
    }
    this.hasFailed = value !== '';
    // console.log(this.hasFailed);
    if (this.hasFailed) {
      this.shakeClass();
    }
  }

  hasFailed: boolean = false;

  shakeClass() {
    // add the "shake" class to the DOM for all classes that had the "shakeable" class
    let shakeableClasses = document.getElementsByClassName('shakeable');
    for (let i = 0; i < shakeableClasses.length; i++) {
      shakeableClasses[i].classList.add('shake');
    }
    // remove the "shake" class from the DOM after 1 second
    setTimeout(() => {
      for (let i = 0; i < shakeableClasses.length; i++) {
        shakeableClasses[i].classList.remove('shake');
      }
    }, 1000);
  }

  previousFullCourseCode = "";


  fmtNumAsPercent(num: number): string {
// if num is NaN or any infinity then it is a 0
    if (isNaN(num) || Math.abs(num) === Infinity) {
      return '0.00%';
    }


    return (num * 100).toFixed(2) + '%';
  }

  private previousCourse: string = "";
  previousCourseInfo: Course | null = null;

  autoFormat: boolean = true;
  private _hideSpecial: boolean = false;
  public get hideSpecial(): boolean {
    return this._hideSpecial;
  }
  public set hideSpecial(value: boolean) {
    this._hideSpecial = value;
    this.loadCourseData(this.inputCourse);
  }


  formatInstructors(ins: string[][]): string {
    let names: string[] = [];
    for(let fl of ins){
      names.push(`${fl[0]} ${fl[1]}`);
    }
    let cand = names.join(", ");
    return cand !== "" ? cand : "TBA";
  }


  determineCourseCode(crsCode: string): string {
    if(crsCode.match(/^[A-Z]{3}[A-D0-9]\d{2}[HY]\d-?[FYS]$/)){

      if(crsCode.match(/^[A-Z]{3}[A-D0-9]\d{2}[HY]\d[FYS]$/)){
        crsCode = crsCode.substring(0, 8) + "-" + crsCode.substring(8);
      }
      if(crsCode.match(/^[A-Z]{3}[A-D]\d{2}[HY]\d[FYS]$/)){
        crsCode = crsCode.substring(0, 7) + "3" + crsCode.substring(8);
      }

      return crsCode;
    } else if (crsCode.match(/^[A-Z]{3}[0-9]{3}.*/)){
      // console.log("Autocorrecting...");
      let temp = this.ac.autoCorrectCourse(crsCode);
      if(temp === ""){
        this.curErrorMessage = "This course doesn't exist or is not offered in this term";
      }
      return temp;
    }
    if(!crsCode.match(/^[A-Z]{3}[A-D\d]\d{2}/))
      this.curErrorMessage = "That doesn't look like a course";
    else this.curErrorMessage = "You didn't provide enough information about your course, or it doesn't exist"
    return "";
  }

  /**
   * Reloads the course and presents it to the screen,
   * done by updating scatterChartData.
   *
   * @param courseCode a course code like CSC110Y1-F
   */
  loadCourseData(courseCode: string): void {
    // make courseCode uppercase
    courseCode = courseCode.toUpperCase();
    // remove all spaces from courseCode
    courseCode = courseCode.replace(/\s/g, '');
    courseCode = courseCode.trim();

    // console.log(courseCode);

    let tempCourse = this.determineCourseCode(courseCode);
    if(tempCourse === ""){
      // this.curErrorMessage = "Course doesn't exist or is not offered in this term";
      return;
    }


    if(this.autoFormat)
      this.inputCourse = tempCourse.replace("-", "");

    courseCode = tempCourse;
    
    if(this.previousCourse === courseCode){
      if(!this.previousWasError){
        this._loadCourseDataHelper();}
      else {
        this._curErrorMessage += "!";
      }  
      return;
    }


    
    let courseInfo: Course;
    this.crsgetter.getCourse(courseCode).subscribe(
      (data) => {
        courseInfo = data;
      },
      () => {
        this.curErrorMessage = this.courseDoesNotExist;
        this.previousWasError = true;
        this.previousCourse = courseCode;
        // console.log("this course never existed");
      },
      () => {
        this.curErrorMessage = '';
        // console.log("attempting to redraw the graph");
        this._loadCourseDataHelper(courseInfo);
        this.previousCourseInfo = courseInfo;
        this.previousFullCourseCode = tempCourse;
        this.courseTitle = courseInfo.title;
        this.previousCourse = courseCode;
        this.previousWasError = false;
      }
    );

  }

  previousWasError = false;
  searched = false;
  private _showMaxEnrollment = true;
  public get showMaxEnrollment() {
    return this._showMaxEnrollment;
  }

  public set showMaxEnrollment(value) {
    this._showMaxEnrollment = value;
    this.loadCourseData(this.inputCourse);
  }

  // make a setter for showMaxEnrollment

  /**
   * 
   * @param meetingNumber the meeting number, such as LEC0101
   * @returns whether the meeting is special.
   */
  private _isSpecialMeeting(meetingNumber: string): boolean {
    if(!meetingNumber.match(/LEC\d+/)) return false;
    let numbersString = meetingNumber.substring(3);
    let numbersNumber = parseInt(numbersString);
    if(numbersNumber === NaN) return false;
    return 2000 <= numbersNumber && numbersNumber < 3000;
  }


  /**
   * A helper to the method above so
   * I don't need to have to type the same
   * thing exactly twice.
   *
   * @param course the course information.
   */
  private _loadCourseDataHelper(course: Course | null = null): void {
    if (course === undefined) {
      return;
    }
    if(course === null){
      course = this.previousCourseInfo;
    }
    if(course === null){
      return;
    }

    this.searched = true;
    // this isn't null by this point, so proceed
    const chartDatasetSoFar: ChartDataset[] = [];
    const timings: number[] = course.timeIntervals;

    const earliest: number = timings[0];
    const latest: number = timings[timings.length - 1];
    this.lastUpdateString = // latest is the seconds since jan 1 1970, so represent that as a user friendly string
      new Date(latest * 1000).toLocaleString();
    // console.log(this.lastUpdateString);

    const maxEnrollmentsSoFar: ChartDataset[] = [];
    let iterations = 0;
    this.updateImportantCounts(course);
    // let fys = course.code[course.code.length - 1];
    for (let mtt of course.meetings) {
      
      // hide all special meetings
      if(this.hideSpecial && this._isSpecialMeeting(mtt.meetingNumber)){
        continue;
      }

      let tempBordercolor = this._getColorSeries(iterations);
      // let tempBackgroundColor = 'rgba(120, 0, 0, 0)';
      let tempShowLine = true;
      let tempPointRadius = 0;
      let tempLabel = this.smallScreen ? `L${mtt.meetingNumber.substring(3)}` :
      `${mtt.meetingNumber} - ${this.formatInstructors(mtt.instructors)}`;
      let chartPoints: { x: number; y: number }[] = [];

      // loops over a strip of enrollment numbers
      for (let i = 0; i < mtt.enrollmentLogs.length; i++) {
        let enrollment = mtt.enrollmentLogs[i];
        let timeOfEnrollment = timings[i];
        chartPoints.push({x: timeOfEnrollment * 1000, y: enrollment});
      }

      // chartPoints is our data so far
      chartDatasetSoFar.push({
        data: chartPoints,
        showLine: tempShowLine,
        pointRadius: tempPointRadius,
        label: tempLabel,
        backgroundColor: tempBordercolor,
        borderColor: tempBordercolor,
      });

      if (this._showMaxEnrollment) {
        maxEnrollmentsSoFar.push({
          data: [
            {x: earliest * 1000, y: mtt.enrollmentCap},
            {x: latest * 1000, y: mtt.enrollmentCap},
          ],
          showLine: true,
          pointRadius: 0,
          backgroundColor: tempBordercolor,
          borderColor: tempBordercolor,
          borderDash: [10, 5],
          label: this.smallScreen ? `M${mtt.meetingNumber.substring(3)}` : `${mtt.meetingNumber} - MAX`,
        });
      }

      iterations++;
    }
    // add all of maxEnrollmentsSoFar to chartDatasetSoFar
    chartDatasetSoFar.push(...maxEnrollmentsSoFar);
    this.scatterChartData = chartDatasetSoFar;
    // this.currentEnrollment = 4;
    // this.finalEnrollment = 4;
    // this.drops = 2;
    // this.lwds = 1;
    // this.cap = 9;
  }

  /**
   * Updates all important counts attached to crs
   * @param crs the course information to be passed in
   * 
   */
  updateImportantCounts(crs: Course): void {
    // console.log("Updating important counts");
    let fys = crs.code[crs.code.length - 1];
    // console.log(fys);
    if(!fys.match(/[FYS]/)){
      return;
    }
    const aggEnrollments: number[] = [];
    const enrollmentCollection: number[][] = [];
    let cap = 0;
    for(let met of crs.meetings){
      // use a continue condition here to skip
      // courses that we do not want to count

      if(this.hideSpecial && this._isSpecialMeeting(met.meetingNumber)){
        // console.log("Special meeting " + met.meetingNumber);
        continue;
      }
      enrollmentCollection.push(met.enrollmentLogs);
      cap += met.enrollmentCap;

      
    }
    // enrollmentCollection is a 2x2 array of all meetings.
    // transpose it, then for each element in transposed,
    // sum all the numbers within
    for(let i = 0; i < enrollmentCollection[0].length; i++){
      let sum = 0;
      for(let j = 0; j < enrollmentCollection.length; j++){
        sum += enrollmentCollection[j][i];
      }
      aggEnrollments.push(sum);
    }
    this.currentEnrollment = aggEnrollments[aggEnrollments.length - 1];
    this.cap = cap;
    
    let startingTermIndex: number = 0;
    let dropDateIndex: number = 0;
    let lwdDateIndex: number = 0;

    if(this.importantDates === null){
      console.log("Important dates are not loaded yet!");
      return;
    }

    if(fys === "F"){
      startingTermIndex = this.findIndexFirstDay(crs.timeIntervals,
        this.importantDates.fallEnrollmentEnd);
      dropDateIndex = this.findIndexFirstDay(crs.timeIntervals,
        this.importantDates.fallDrop);
      lwdDateIndex = this.findIndexFirstDay(crs.timeIntervals, 
        this.importantDates.fallLWD);
    }
    else if (fys === "S") {
      // that is winter
      startingTermIndex = this.findIndexFirstDay(crs.timeIntervals,
        this.importantDates.winterEnrollmentEnd);
      dropDateIndex = this.findIndexFirstDay(crs.timeIntervals,
        this.importantDates.winterDrop);
      lwdDateIndex = this.findIndexFirstDay(crs.timeIntervals,
        this.importantDates.winterLWD);
    }
    else if (fys === "Y") {
      startingTermIndex = this.findIndexFirstDay(crs.timeIntervals,
        this.importantDates.fallEnrollmentEnd);
      dropDateIndex = this.findIndexFirstDay(crs.timeIntervals,
        this.importantDates.yearDrop);
      lwdDateIndex = this.findIndexFirstDay(crs.timeIntervals,
        this.importantDates.winterLWD);
    }

    this.finalEnrollment = startingTermIndex === -1 ? this.currentEnrollment
    : this.findMaxAfterIndex(aggEnrollments, startingTermIndex);
    // : aggEnrollments[startingTermIndex];

    let enrolsAtDropDate = dropDateIndex === -1 ? this.currentEnrollment : aggEnrollments[dropDateIndex];
    let enrolsAtLwdDate = lwdDateIndex === -1 ? this.currentEnrollment :
    aggEnrollments[lwdDateIndex];

    this.drops = this.finalEnrollment - enrolsAtDropDate;
    this.lwds = enrolsAtDropDate - enrolsAtLwdDate;

  }

  /**
   * Finds the maximum value of the array[index:].
   * @param arr the array
   * @param index the index to start looking for
   * @returns the max, or 0 if the array is too short
   */
  findMaxAfterIndex(arr: number[], index: number): number {
    let max = 0;
    for(let i = index; i < arr.length; i++){
      if(arr[i] > max){
        max = arr[i];
      }
    }
    return max;
  }

  /**
   * Returns the first index in timings where timingCap is
   * greater or equal to timings at index.
   * 
   * @param timings a list of timings
   * @param timingCap the first to detect
   */
  findIndexFirstDay(timings: number[], timingCap: number): number {
    for(let i = 0; i < timings.length; i++){
      if(timings[i] >= timingCap){
        return i;
      }
    }
    return -1;

  }

  currentEnrollment: number = 0;
  finalEnrollment: number = 0;
  drops: number = 0;
  lwds: number = 0;
  cap: number = 0;

  lastUpdateString: string = "";


  colors: string[] = [
    '#6E4DBC',
    '#1C996F',
    '#D1543B',
    '#C94973',
    '#D48A35',
    '#3CABB5',
    '#48ce00',
    '#d32295',
    '#2d89d3',
    '#6b4a32',
    '#505050',
    '#003b6e',
    '#a445c0',
    '#9b9100',
    '#cb3500',
    '#492100',
    '#000000',
  ];

  private _getColorSeries(colorNum: number): string {
    return this.colors[colorNum % this.colors.length];
  }
}
