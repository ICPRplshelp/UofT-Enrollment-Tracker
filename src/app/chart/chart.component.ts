import { Component, HostListener, OnInit } from '@angular/core';
import { CrsgetterService } from '../crsgetter.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  Course,
  EnrollmentCapChange,
  EnrollmentCapComplex,
  ImportantTimestamps,
  ImportantTimestampsBundle,
  IndividualSessionInfo,
  Instructor,
  Meeting,
  SessionCollection,
  TopCourses,
} from '../cinterfaces';
import Annotation, * as pluginAnnotation from 'chartjs-plugin-annotation';

import { Chart, ChartDataset, ChartOptions, ChartType } from 'chart.js';
import { AutoCompleteService } from '../shared/auto-complete.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AnnotationOptions } from 'chartjs-plugin-annotation';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent implements OnInit {
  deadlineTimeOffset: number = 160000; // deadlines for last day to
  // add or drop are offset by this much to account for timetable delays.
  // these only impact the drop rate.
  firstTimeRun: boolean = true;
  title = 'timetabletracker';
  backCapNudge: number = 1; // seconds to nudge the cap change backwards.
  // sessionWasLastYear: boolean = false;
  noWidthLimit: boolean = false;
  constructor(
    private crsgetter: CrsgetterService,
    private _snackBar: MatSnackBar,
    private autoCompleter: AutoCompleteService
  ) {
    Chart.register(Annotation);
  }

  myFavCourses: string[] = [];

  courseTitle: string = 'TITLE';

  smallMessage =
    'Your screen is small. Lecture sections are compressed. M#### means the maximum enrollment for that section. Consider rotating your device.';
  importantDates: ImportantTimestamps | null = null;
  sessionColl: SessionCollection | null = null;
  isSummer: boolean = false; // true if the course is offered in the summer

  getSessions(): IndividualSessionInfo[] {
    if (this.sessionColl !== null) {
      return this.sessionColl.sessions;
    } else return [];
  }

  getSessionName(sesNum: string): string {
    const temp = this.getSessions();
    const idx = temp.map((s) => s.sessionCode).indexOf(sesNum);
    if (idx === -1) {
      return 'TBA';
    } else {
      return temp[idx].name;
    }
  }

  private _selectedValue: string = '';
  public get selectedValue(): string {
    return this._selectedValue;
  }
  public set selectedValue(value: string) {
    this._selectedValue = value;
    this.crsgetter.session = value;
    this.autoCompleter.reloadAutocomplete(this.crsgetter);
    const courseDataLoader = () => this.loadCourseData(this.inputCourse);
    this.reloadImportantDatesAndValues(courseDataLoader);
    // this._loadCourseDataHelper();
  }

  importantDatesBucket: ImportantTimestampsBundle[] = [];

  reloadImportantDatesAndValues(done: () => void): void {
    // let tempData: ImportantTimestamps;
    let tempDataBundleLocal: ImportantTimestampsBundle[] = [];
    this.crsgetter.getImportantDatesBundle().subscribe({
      next: (data) => {
        tempDataBundleLocal = data;
      },
      error: () => {},
      complete: () => {
        this.importantDatesBucket = tempDataBundleLocal;
        done();
      },
    });

    let tempData2: TopCourses;
    this.crsgetter.getTopCoursesList().subscribe({
      next: (data) => {
        tempData2 = data;
      },
      error: () => {
        // could not load top courses
      },
      complete: () => {
        this.myFavCourses = tempData2.courses;
        if (this.firstTimeRun) {
          this.chooseRandomCourse();
          this.firstTimeRun = false;
        }
      },
    });
  }

  getSessionList() {
    let tempData2: SessionCollection;
    this.crsgetter.getSessionCollection().subscribe({
      next: (data) => {
        tempData2 = data;
      },
      error: () => {
        // console.log("Couldn't load session lists")
      },
      complete: () => {
        this.selectedValue = tempData2.default;
        this.sessionColl = tempData2;
        this.reloadImportantDatesAndValues(() => {});
      },
    });
  }

  private chooseRandomCourse() {
    let randomIndex: number = Math.floor(
      Math.random() * this.myFavCourses.length
    );
    let randomCourse = this.myFavCourses[randomIndex];
    this.inputCourse = randomCourse;
    this.loadCourseData(this.inputCourse);
  }

  ngOnInit() {
    this.getSessionList();

    // this.inputCourse = "MAT137Y1-Y";
    // this.loadCourseData(this.inputCourse);
    this.smallScreen = window.innerWidth < 768;
    let ref: any;
    if (this.smallScreen) {
      ref = this._snackBar.open(this.smallMessage, 'GOT IT', {
        duration: 7000,
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
    if (switched) this._loadCourseDataHelper();
  }

  smallActivated = 0;

  @HostListener('window:resize', ['$event']) onWindowResize() {
    if (window.innerWidth < 480) {
      let originalState = this.smallScreen;
      this.smallScreen = true;
      let ref: any;
      if (this.smallScreen && !originalState && this.smallActivated <= 0) {
        this.smallActivated++;
        ref = this._snackBar.open(this.smallMessage, 'GOT IT', {
          duration: 5000,
        });
        this.ref = ref;
      }
    } else {
      if (this.smallScreen) {
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
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        position: 'right',
      },
      annotation: {
        annotations: [
          {
            type: 'line',
            scaleID: 'x',
            value: 1663819200 * 1000,
            borderColor: 'green',
            borderWidth: 2,
            label: {
              display: true,
              position: 'start',
              content: 'PLEASE RELOAD THE COURSE BY PRESSING ENTER',
            },
          },
        ],
      },
    },
  };

  private _undefinedOrBefore(
    candidate: number | undefined,
    minValue: number
  ): number {
    if (candidate === undefined) {
      return 0;
    } else {
      if (candidate > minValue) {
        return 0;
      } else {
        return candidate;
      }
    }
  }

  calculateCourseLevel(crsCode: string): number {
    const letter = crsCode[3];
    // console.log(letter);
    if (letter === '4' || letter === 'D') return 4;
    if (letter === '3' || letter === 'C') return 3;
    if (letter === '2' || letter === 'B') return 2;
    if (letter === '1' || letter === 'A') return 1;
    return 0;
  }


  getFacultyName(faculty: string) {
    switch(faculty) {
      case "APSC": return "Eng";
      case "ARCLA": return "Daniels";
      case "ARTSC": return "Artsci";
      case "MUSIC": return "Music";
      case "SCAR": return "UTSC";
      case "ERIN": return "UTM";
      case "FPEH": return "KPE";
      default: return "Unknown, fallback to Artsci"
    }
  }

  getImportantDatesBasedOnFaculty(
    faculty: string
  ): ImportantTimestamps | undefined {
    let curTimestamp = this.importantDatesBucket.find(
      (item) => item.faculty === faculty
    );

    if (curTimestamp === undefined) {
      // Define the order in which faculties should be searched
      const facultyOrder = ['UNKNOWN', 'ARTSCI'];

      // Find the first faculty from the predefined order that exists in the importantDatesBucket
      const fallbackFaculty = facultyOrder.find((faculty) =>
        this.importantDatesBucket.some((item) => item.faculty === faculty)
      );

      // If a fallback faculty is found, use it; otherwise, just return undefined
      curTimestamp = this.importantDatesBucket.find(
        (item) => item.faculty === fallbackFaculty
      );

      // If no fallback faculty is found, return undefined
      if (curTimestamp === undefined) {
        return this.importantDatesBucket[0].importantTimestamps;
      }
      if(fallbackFaculty)
        this.faculty = fallbackFaculty;
    }
    
    return curTimestamp.importantTimestamps;
  }

  getLookbackTime(): number {
    const currentUnixTime = Math.floor(Date.now() / 1000);
    const secondsInAYear = 31536000;
    let currentLookBackTime = currentUnixTime - secondsInAYear;

    return 42069;
  }

  /**
   * Recalculate the annotations on this chart.
   * This method will run AFTER the chart has been redrawn.
   */
  recalculateAnnotations(): void {
    let lastEnrol: number;
    let lastDrop: number;
    let lastClass: number;
    let firstClass: number;

    const targetImportantDates = this.getImportantDatesBasedOnFaculty(
      this.faculty
    );
    if (targetImportantDates === undefined) {
      console.log('Pratically, this should never happen.');
      return;
    }

    if (!this.showAnnotations) {
      if (
        notNullorUndefined(this.scatterChartOptions) &&
        notNullorUndefined(this.scatterChartOptions.plugins) &&
        notNullorUndefined(this.scatterChartOptions.plugins.annotation)
      ) {
        this.scatterChartOptions.plugins.annotation.annotations = [];
      }
      return;
    }
    const annotationList:
      | AnnotationOptions[]
      | Record<string, AnnotationOptions> = [];
    const lb = this.lookBack();
    if (lb !== null) {
      annotationList.push({
        type: 'line',
        scaleID: 'x',
        value: lb * 1000,
        borderColor: 'red',
        borderWidth: 2,
        label: {
          display: true,
          position: 'start',
          content: '',
        },
      });
    }

    // if these values are zero, don't do anything
    // this.lastTime is the last time

    if (this.fys === 'F') {
      lastEnrol = this._undefinedOrBefore(
        targetImportantDates.fallEnrollmentEnd,
        this.lastTime
      );
      lastDrop = this._undefinedOrBefore(
        targetImportantDates.fallDrop,
        this.lastTime
      );
      lastClass = this._undefinedOrBefore(
        targetImportantDates.fallLWD,
        this.lastTime
      );
      firstClass = this._undefinedOrBefore(
        targetImportantDates.fallFirstDay,
        this.lastTime
      );
    } else if (this.fys === 'S') {
      lastEnrol = this._undefinedOrBefore(
        targetImportantDates.winterEnrollmentEnd,
        this.lastTime
      );
      lastDrop = this._undefinedOrBefore(
        targetImportantDates.winterDrop,
        this.lastTime
      );
      lastClass = this._undefinedOrBefore(
        targetImportantDates.winterLWD,
        this.lastTime
      );
      firstClass = this._undefinedOrBefore(
        targetImportantDates.winterStart,
        this.lastTime
      );
    } else {
      lastEnrol = this._undefinedOrBefore(
        targetImportantDates.fallEnrollmentEnd,
        this.lastTime
      );
      lastDrop = this._undefinedOrBefore(
        targetImportantDates.yearDrop,
        this.lastTime
      );
      lastClass = this._undefinedOrBefore(
        targetImportantDates.winterLWD,
        this.lastTime
      );
      firstClass = this._undefinedOrBefore(
        targetImportantDates.fallFirstDay,
        this.lastTime
      );
    }

    if (lastEnrol !== 0) {
      annotationList.push({
        type: 'line',
        scaleID: 'x',
        value: lastEnrol * 1000,
        borderColor: 'green',
        borderWidth: 2,
        label: {
          display: true,
          position: 'end',
          content: 'enrol end',
        },
      });
    }
    if (firstClass !== 0) {
      annotationList.push({
        type: 'line',
        scaleID: 'x',
        value: firstClass * 1000,
        borderColor: 'green',
        borderWidth: 2,
        label: {
          display: true,
          position: 'end',
          content: '',
        },
      });
    }
    if (lastDrop !== 0) {
      annotationList.push({
        type: 'line',
        scaleID: 'x',
        value: (lastDrop + this.deadlineTimeOffset) * 1000,
        borderColor: 'green',
        borderWidth: 2,
        label: {
          display: true,
          position: 'end',
          content: 'drop ddl',
        },
      });
    }

    // console.log("About to", this.previousFullCourseCode[this.previousFullCourseCode.length - 1]);
    const crsCodeNow = this.previousFullCourseCode;
    if (
      targetImportantDates !== null &&
      notNullorUndefined(targetImportantDates)
    ) {
    }
    if (
      targetImportantDates !== null &&
      notNullorUndefined(targetImportantDates) &&
      this.faculty !== 'APSC' &&
      notNullorUndefined(targetImportantDates.first) &&
      notNullorUndefined(targetImportantDates.second) &&
      notNullorUndefined(targetImportantDates.third) &&
      notNullorUndefined(targetImportantDates.fourth)
    ) {
      // console.log("Got there");

      const crsLv = this.calculateCourseLevel(this.previousFullCourseCode);
      // console.log(crsLv);
      if (crsLv >= 1 && crsLv <= 4) {
        let firstDayEnrol: number;
        switch (crsLv) {
          case 1:
            firstDayEnrol = targetImportantDates.first;
            break;
          case 2:
            firstDayEnrol = targetImportantDates.second;
            break;
          case 3:
            firstDayEnrol = targetImportantDates.third;
            break;
          case 4:
            firstDayEnrol = targetImportantDates.fourth;
            break;
          default:
            firstDayEnrol = targetImportantDates.fourth;
            break;
        }
        const numSuffix = [
          'th',
          'st',
          'nd',
          'rd',
          'th',
          'th',
          'th',
          'th',
          'th',
        ];
        firstDayEnrol += 25200;
        if (this.lastTime > firstDayEnrol && this.firstTime < firstDayEnrol) {
          annotationList.push({
            type: 'line',
            scaleID: 'x',
            value: firstDayEnrol * 1000,
            borderColor: 'green',
            borderWidth: 2,
            label: {
              display: true,
              position: 'end',
              content: `${crsLv}${numSuffix[crsLv]} yr`,
            },
          });
        }
      }
    }

    if (
      targetImportantDates !== null &&
      notNullorUndefined(targetImportantDates) &&
      targetImportantDates.general > this.earliestChartTime &&
      this.lastTime > targetImportantDates.general
    ) {
      // console.log('earliest chart time', this.earliestChartTime);
      // console.log('general time', targetImportantDates.general);
      annotationList.push({
        type: 'line',
        scaleID: 'x',
        value: targetImportantDates.general * 1000,
        borderColor: 'green',
        borderWidth: 2,
        label: {
          display: true,
          position: 'end',
          content: 'gen',
        },
      });
    }

    if (lastClass !== 0) {
      annotationList.push({
        type: 'line',
        scaleID: 'x',
        value: lastClass * 1000,
        borderColor: 'green',
        borderWidth: 2,
        label: {
          display: true,
          position: 'end',
          content: 'end',
        },
      });
    }
    if (
      notNullorUndefined(this.scatterChartOptions) &&
      notNullorUndefined(this.scatterChartOptions.plugins) &&
      notNullorUndefined(this.scatterChartOptions.plugins.annotation)
    ) {
      this.scatterChartOptions.plugins.annotation.annotations = annotationList;
    }
  }
  earliestChartTime: number = 0;
  private _inputCourse: string = '';

  private lookBack(): number | null {
    const currentUnixTime = Math.floor(Date.now() / 1000);
    const secondsInAYear = 31536000;
    let currentLookBackTime = currentUnixTime - secondsInAYear;
    if (
      currentLookBackTime > this.firstTime &&
      this.firstTime !== 0 &&
      this.lastTime !== 0
    ) {
      let iters = 0;
      const itersCap = 100;
      while (
        iters < itersCap &&
        !(
          // stop decrementing if this is true
          (
            currentLookBackTime < this.firstTime ||
            (this.firstTime <= currentLookBackTime &&
              currentLookBackTime <= this.lastTime)
          )
        )
      ) {
        currentLookBackTime -= secondsInAYear;
        iters++;
      }

      if (
        iters !== itersCap &&
        this.firstTime <= currentLookBackTime &&
        currentLookBackTime <= this.lastTime
      ) {
        return currentLookBackTime;
      }
    }
    return null;
  }

  public get inputCourse(): string {
    return this._inputCourse;
  }
  public set inputCourse(value: string) {
    this._inputCourse = value.replace(/[,.\s\/\[\]\-=';]+$/, ' ');
    // if(temp[temp.length - 1] === " "){
    //   temp = temp.slice(0, temp.length - 1);
    // }
    // this._inputCourse = temp;
  }

  data = [
    { x: 0, y: 1 },
    { x: 1, y: 2 },
  ];

  data2 = [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
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

  keyDownFunction(event: { keyCode: number; shiftKey: boolean }) {
    if (event.keyCode === 13) {
      this.loadCourseData(this.inputCourse);
      if (this.randomized >= 2) {
        this.randomized = Math.floor(this.randomized / 1.05);
      }
    }
    if (event.keyCode === 45) {
      if (this.randomized >= 100) {
        return;
      }
      let randomIndex: number = Math.floor(
        Math.random() * this.myFavCourses.length
      );
      let randomCourse = this.myFavCourses[randomIndex];
      this.loadCourseData(randomCourse);
      this.randomized++;
    }
    const icf = (inc: number) => {
      let sLI = this.getSessions().map((s) => s.sessionCode);
      // curr session is this.selectedValue;
      let sesInd = sLI.indexOf(this.selectedValue);
      sesInd = sesInd + inc;
      if (sesInd >= sLI.length) {
        sesInd = sLI.length - 1;
        return;
      } else if (sesInd < 0){
        sesInd = 0;
      }
      this.selectedValue = sLI[sesInd];
    };
    if (event.keyCode === 188) {
      icf(-1);
    }

    if (event.keyCode === 190) {
      icf(1);
    }
    if (event.keyCode === 186) {
      icf(-2);
    }
    if (event.keyCode === 222) {
      icf(2);
    }



    if (this.inputCourse.length >= 9) {
      const allCoursesThatExist: string[] = [];
      let indexOfCurrent = -1;
      let i = 0;
      for (const suf of ['F', 'S', 'Y']) {
        const tc2 = this.inputCourse.slice(0, 8) + suf;
        if (this.autoCompleter.validateCourseExistence(tc2)) {
          allCoursesThatExist.push(tc2);
          if (suf === this.inputCourse[8]) {
            indexOfCurrent = i;
          }
        }
        i++;
      }

      if (indexOfCurrent === -1 || allCoursesThatExist.length === 0) {
        return;
      }

      if (event.keyCode === 219) {
        const newIndex = pythonModulus(
          indexOfCurrent - 1,
          allCoursesThatExist.length
        );
        this.loadCourseData(allCoursesThatExist[newIndex]);
      }
      if (event.keyCode === 221) {
        const newIndex = pythonModulus(
          indexOfCurrent + 1,
          allCoursesThatExist.length
        );
        this.loadCourseData(allCoursesThatExist[newIndex]);
      }
    }
  }

  randomized: number = 50;

  invalidCourseRegexWarning: string = "This isn't a course code";
  courseDoesNotExist: string =
    "This course doesn't exist or is not offered in this term";
  courseNotOffered: string = 'This course is not offered in this term';
  missingSuffix: string = 'You need the -F/-Y/-S suffix for this';
  missingHY: string =
    'You need the -H/-Y suffix, the campus code, and the -F/-S/-Y suffix for this';
  utmUtsc =
    'St. George FAS courses only — UTM and UTSC courses are not supported';
  private _curErrorMessage: string = '';
  public get curErrorMessage(): string {
    return this._curErrorMessage;
  }

  public set curErrorMessage(value: string) {
    let exclamIndex = this._curErrorMessage.indexOf('!');
    if (exclamIndex === -1) exclamIndex = this._curErrorMessage.length;
    if (
      this._curErrorMessage.length > 0 &&
      this._curErrorMessage.substring(0, exclamIndex) === value
    ) {
      this._curErrorMessage += '!';
    } else {
      this._curErrorMessage = value;
    }
    this.hasFailed = value !== '';

    if (this.hasFailed) {
      this.shakeClass();
    }
  }

  hasFailed: boolean = false;

  shakeClass(): void {
    // we did not implement anything here.
  }

  previousFullCourseCode = '';

  fmtNumAsPercent(num: number): string {
    if (isNaN(num) || Math.abs(num) === Infinity) {
      return '0.00%';
    }

    return (num * 100).toFixed(2) + '%';
  }

  fmtNumAsPercentShort(num: number): string {
    if (isNaN(num) || Math.abs(num) === Infinity) {
      return '0.00%';
    }

    return Math.floor(num * 100) + '%';
  }

  private previousCourse: string = '';
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

  formatInstructors(ins: Instructor[]): string {
    let names: string[] = [];
    for (let fl of ins) {
      names.push(`${fl.firstName} ${fl.lastName}`.trim());
    }
    let cand = names.join(', ');
    return cand !== '' ? cand : 'TBA';
  }

  determineCourseCode(crsCode: string): string {
    // console.log("Attempting to autocomplete");
    return this.autoCompleter.autoCompleteSearch(crsCode);
  }

  previousSession: string = '';

  /**
   * Reloads the course and presents it to the screen,
   * done by updating scatterChartData.
   *
   * @param courseCode a course code like CSC110Y1-F
   */
  loadCourseData(courseCode: string): void {
    courseCode = courseCode.toUpperCase();

    courseCode = courseCode.replace(/\s/g, '');
    courseCode = courseCode.trim();

    let tempCourse = this.determineCourseCode(courseCode);
    if (tempCourse === '') {
      return;
    }

    if (this.autoFormat) this.inputCourse = tempCourse;

    courseCode = tempCourse;

    if (
      this.previousCourse === courseCode &&
      this.previousSession == this.selectedValue
    ) {
      if (!this.previousWasError) {
        this._loadCourseDataHelper();
      } else {
        this._curErrorMessage += '!';
      }
      return;
    }

    if (
      !(
        courseCode.match(/^[A-Z]{3}[A-D\d]\d{2}[HY]\d[FSY]\d?$/) ||
        courseCode.match(/^[A-Z]{3}\d{4}[HY][FSY]\d?/)
      )
    ) {
      console.log('Course regex off');
      this.previousCourse = 'placeholder';
      if (this.previousWasError) {
        this.curErrorMessage += '!';
        return;
      }

      if (courseCode.match(/^[A-Z]{3}[A-D\d]\d{2,3}/)) {
        this.curErrorMessage = this.courseDoesNotExist;
      } else {
        this.curErrorMessage = this.invalidCourseRegexWarning;
      }
      this.previousWasError = true;
      return;
    }

    let courseInfo: Course;
    const curSession = this.crsgetter.session;
    this.crsgetter.getCourse(courseCode).subscribe({
      next: (data) => {
        courseInfo = data;
      },
      error: (err: HttpErrorResponse) => {
        if (curSession !== this.crsgetter.session) {
          return;
        }

        if (err.status === 404) this.curErrorMessage = this.courseDoesNotExist;
        else if (err.status === 403)
          this.curErrorMessage =
            "You're not doing anything weird with your browser, aren't you?";
        else if (err.status >= 500)
          this.curErrorMessage = `Server-side error: ${err.status}`;
        else if (err.status === 0)
          this.curErrorMessage =
            'You are offline or your connection is really bad';
        else this.curErrorMessage = `Something went wrong: ${err.status}`;

        this.previousWasError = true;
        this.previousCourse = courseCode;
        this.previousSession = '';
      },
      complete: () => {
        if (curSession !== this.crsgetter.session) {
          return;
        }

        this.curErrorMessage = '';
        this.previousCourseInfo = courseInfo;
        this.previousFullCourseCode = tempCourse;
        this.courseTitle = courseInfo.title;
        this.previousCourse = courseCode;
        this.previousWasError = false;
        this._loadCourseDataHelper(courseInfo);
        this.previousSession = this.selectedValue;
      },
    });
  }

  _darkMode: boolean = false;

  public get darkMode(): boolean {
    return this._darkMode;
  }

  public set darkMode(dm: boolean) {
    this._darkMode = dm;

    this.loadCourseData(this.inputCourse);
  }

  chartColors: any[] = [
    {
      backgroundColor: ['#FF7360', '#6FC8CE', '#FAFFF2', '#FFFCC4', '#B9E8E0'],
    },
  ];

  largePointRadius: number = 3;
  private _showLargePoints: boolean = false;
  public get showLargePoints(): boolean {
    return this._showLargePoints;
  }

  public set showLargePoints(value: boolean) {
    this._showLargePoints = value;
    this.loadCourseData(this.inputCourse);
  }

  private _showAnnotations: boolean = true;
  public get showAnnotations(): boolean {
    return this._showAnnotations;
  }

  public set showAnnotations(value: boolean) {
    this._showAnnotations = value;
    this.loadCourseData(this.inputCourse);
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

  /**
   *
   * @param meetingNumber the meeting number, such as LEC0101
   * @returns whether the meeting is special.
   */
  private _isSpecialMeeting(meetingNumber: string): boolean {
    if (!meetingNumber.match(/LEC\d+/)) return false;
    let numbersString = meetingNumber.substring(3);
    let numbersNumber = parseInt(numbersString);
    if (isNaN(numbersNumber)) return false;
    return 2000 <= numbersNumber && numbersNumber < 3000;
  }

  private _showRemaining: boolean = false;
  public get showRemaining(): boolean {
    return this._showRemaining;
  }

  public set showRemaining(value) {
    this._showRemaining = value;
    if (value) this._combineAll = false;
    this.loadCourseData(this.inputCourse);
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
    if (course === null) {
      course = this.previousCourseInfo;
    }
    if (course === null) {
      return;
    }

    this.searched = true;

    const chartDatasetSoFar: ChartDataset[] = [];
    const timings: number[] = course.timeIntervals;

    const earliest: number = timings[0];
    this.earliestChartTime = earliest;
    const latest: number = timings[timings.length - 1];
    this.lastUpdateString = new Date(latest * 1000).toLocaleString();

    const maxEnrollmentsSoFar: ChartDataset[] = [];
    let iterations = 0;
    this.recalculateDeadlines(course, latest);

    this.updateImportantCounts(course);

    let targetMeetings = course.meetings;

    if (this._showRemaining) {
      targetMeetings = this._convertToSpacesLeft(course);
    } else if (this.combineAll) {
      targetMeetings = this._combineAllMeetings(course);
    }

    targetMeetings.sort((a, b) => {
      let am = a.meetingNumber.slice(3);
      let bm = b.meetingNumber.slice(3);
      if (am.startsWith('2')) {
        am = '7' + am.slice(1);
      }
      if (bm.startsWith('2')) {
        bm = '7' + bm.slice(1);
      }

      return am.localeCompare(bm);
    });

    for (let mtt of targetMeetings) {
      if (this.hideSpecial && this._isSpecialMeeting(mtt.meetingNumber)) {
        continue;
      }

      this._processMeetingInfo(
        iterations,
        mtt,
        timings,
        chartDatasetSoFar,
        maxEnrollmentsSoFar,
        earliest,
        latest
      );

      iterations++;
    }

    chartDatasetSoFar.push(...maxEnrollmentsSoFar);
    this.scatterChartData = chartDatasetSoFar;
  }

  waitlistDeadline = 0;
  enrollmentDeadline = 0;

  private recalculateDeadlines(course: Course, latest: number): void {
    const targetImportantDates = this.getImportantDatesBasedOnFaculty(
      this.faculty
    );
    if (targetImportantDates === undefined) {
      console.log('Pratically, this should never happen.');
      return;
    }
    if (targetImportantDates !== null) {
      let waitlistDeadline: number;
      let enrollmentDeadline: number;
      if (
        course.code[course.code.length - 1] === 'F' ||
        course.code[course.code.length - 1] === 'Y'
      ) {
        waitlistDeadline = targetImportantDates.fallWaitlistClosed;
        enrollmentDeadline = targetImportantDates.fallEnrollmentEnd;
      } else {
        waitlistDeadline = targetImportantDates.winterWaitlistClosed;
        enrollmentDeadline = targetImportantDates.winterEnrollmentEnd;
      }

      this.afterWaitlistDeadline = latest > waitlistDeadline;
      this.afterEnrollmentDeadline = latest > enrollmentDeadline;
      this.waitlistDeadline = waitlistDeadline;
      this.enrollmentDeadline = enrollmentDeadline;
    }
  }

  private _getDeliverySymbol(deliveryMode: string | undefined): string {
    switch (deliveryMode) {
      case 'INPER':
        return '';
      case 'SYNC':
        return '🌐';
      case 'SYNIF':
        return '📶';
      case 'HYBR':
        return '📶';
      case 'ASYNC':
        return '💤';
      case 'ASYIF':
        return '📴';
      case 'ASYNIF':
        return '📴';
      default:
        return '';
    }
  }

  re75: number | null = null;
  re50: number | null = null;
  re0: number | null = null;

  private _processMeetingInfo(
    iterations: number,
    mtt: Meeting,
    timings: number[],
    chartDatasetSoFar: ChartDataset[],
    maxEnrollmentsSoFar: ChartDataset[],
    earliest: number,
    latest: number
  ): void {
    // console.log("Earliest is ", earliest);
    let tempBordercolor;
    if (
      !this._isSpecialMeeting(mtt.meetingNumber) ||
      this.toggleSeperateSpecialColors
    )
      tempBordercolor = this._getColorSeries(iterations);
    else tempBordercolor = this._getSpecialColorSeries(iterations);

    let tempShowLine = true;
    let tempPointRadius = 0;
    let insStr = this.formatInstructors(mtt.instructors);
    let synSymbol = this._getDeliverySymbol(mtt.delivery);
    if (synSymbol !== '') {
      synSymbol = synSymbol + ' ';
    }

    let tempLabel = this.smallScreen
      ? `L${mtt.meetingNumber.substring(3)}`
      : `${mtt.meetingNumber} ${
          insStr.trim() === '' ? '' : '-'
        } ${synSymbol}${insStr}`;
    let chartPoints: { x: number; y: number }[] = [];

    // this.earliestChartTime = earliest;
    if (mtt.isCancelled) {
      tempLabel += ' - CANCELLED';
    }

    for (let i = 0; i < mtt.enrollmentLogs.length; i++) {
      let enrollment = mtt.enrollmentLogs[i];

      if (enrollment === 0 && i == 0) {
        continue;
      }

      let timeOfEnrollment = timings[i];
      // this captured time must be later than the time this
      // lecture section was created
      if (timeOfEnrollment >= mtt.createdAt)
        chartPoints.push({ x: timeOfEnrollment * 1000, y: enrollment });
    }
    if (chartPoints.length >= 1) {
      chartDatasetSoFar.push({
        data: chartPoints,
        showLine: tempShowLine,
        pointRadius: this.showLargePoints
          ? this.largePointRadius
          : tempPointRadius,
        label: tempLabel,
        backgroundColor: tempBordercolor,
        borderColor: tempBordercolor,
      });
    }

    if (this._showMaxEnrollment) {
      let hideMax = mtt.meetingNumber === 'ZERO';
      let maxBumper: string = hideMax ? '' : ' - MAX';

      maxEnrollmentsSoFar.push({
        data: this._createCapPoints(mtt, earliest, latest, mtt.createdAt),
        showLine: true,
        pointRadius: 0,
        backgroundColor: tempBordercolor,
        borderColor: tempBordercolor,
        borderDash: [10, 5],
        label:
          this.smallScreen && mtt.meetingNumber.length >= 6
            ? `M${mtt.meetingNumber.substring(3)}`
            : `${mtt.meetingNumber}${maxBumper}`,
      });
    }
  }

  private _createCapPoints(
    mtt: Meeting,
    earliest: number,
    latest: number,
    createdAt: number
  ): { x: number; y: number }[] {
    if (
      mtt.enrollmentCapComplex === undefined ||
      mtt.enrollmentCapComplex === null
    ) {
      return [
        { x: earliest * 1000, y: mtt.enrollmentCap },
        { x: latest * 1000, y: mtt.enrollmentCap },
      ];
    }
    // no longer undefined
    // console.log(earliest, createdAt);
    if (createdAt === 0) {
      createdAt = earliest;
    }
    const firstCell = {
      x: createdAt * 1000,
      y: mtt.enrollmentCapComplex.initialCap,
    };
    const notEarlyFallback = [
      { x: earliest * 1000, y: 0 },
      { x: createdAt * 1000 - 1, y: 0 },
    ];
    // was this section created the same time as the earliest section?
    // not if the section was created late.
    const capSeries: { x: number; y: number }[] =
      createdAt - 100 <= earliest && earliest <= createdAt + 100
        ? [firstCell]
        : [...notEarlyFallback, firstCell];
    let previousCap = mtt.enrollmentCapComplex.initialCap;
    for (let temp of mtt.enrollmentCapComplex.capChanges) {
      let unix1K = temp.time * 1000;
      let tempCap = temp.newCapacity;
      capSeries.push({ x: unix1K - this.backCapNudge, y: previousCap });
      capSeries.push({ x: unix1K, y: tempCap });
      previousCap = tempCap;
    }
    // the last cap series
    const lastCapSeries =
      mtt.enrollmentCapComplex.capChanges.length === 0
        ? mtt.enrollmentCapComplex.initialCap
        : mtt.enrollmentCapComplex.capChanges[
            mtt.enrollmentCapComplex.capChanges.length - 1
          ].newCapacity;
    capSeries.push({ x: latest * 1000, y: lastCapSeries });
    return capSeries;
  }

  afterWaitlistDeadline: boolean = false;
  afterEnrollmentDeadline: boolean = false;

  /**
   * Converts this to:
   * Each course has a strip of enrollments, and also a cap.
   * We convert each strip into the number of spaces left.
   * If the number of spaces left is negative, then bump it up to zero.
   * Add all of them up
   * And that is our graph on the number of spaces left.
   * @param course
   * @private
   */
  private _convertToSpacesLeft(course: Course): Meeting[] {
    const spacesLeftArray: number[][] = [];
    let capSoFar = 0;
    for (let mtt of course.meetings) {
      if (this.hideSpecial && this._isSpecialMeeting(mtt.meetingNumber)) {
        continue;
      }
      let cap = mtt.enrollmentCap;
      if (cap === 0) {
        continue;
      }
      capSoFar += cap;
      let tempLsf: number[] = mtt.enrollmentLogs.map((x) => cap - x);
      spacesLeftArray.push(tempLsf);
    }

    const temp = this._flattenUnTransposedNumericalArray2(spacesLeftArray);

    const fMax = Math.max(...temp.ar);
    const finalArr = temp.ar.map((x) => fMax - x);

    let fakeMeeting: Meeting = {
      meetingNumber: '',
      instructors: [], // {firstName: "", lastName: ""}
      enrollmentLogs: finalArr,
      enrollmentCap: capSoFar,
      createdAt: 0,
    };
    let smallList = [fakeMeeting];

    // let fakeMeeting2: Meeting = {
    //   meetingNumber: 'ZERO',
    //   instructors: [['', '']],
    //   enrollmentLogs: [],
    //   enrollmentCap: 0,
    //   createdAt: 0,
    // };
    // smallList.push(fakeMeeting2);

    return smallList;
  }

  /**
   * Combines all the meetings for a course
   * @param course the course information in question
   * @private
   */
  private _combineAllMeetings(course: Course): Meeting[] {
    let capSoFar = 0;
    let doubleArr: number[][] = [];
    for (let mtt of course.meetings) {
      if (this.hideSpecial && this._isSpecialMeeting(mtt.meetingNumber)) {
        continue;
      }

      doubleArr.push(mtt.enrollmentLogs);
      capSoFar += mtt.enrollmentCap;
    }
    const aggEnrollments = this._flattenUnTransposedNumericalArray(doubleArr);

    let fakeMeeting: Meeting = {
      createdAt: 0,
      meetingNumber: 'ALL',
      instructors: [],
      enrollmentLogs: aggEnrollments,
      enrollmentCap: capSoFar,
      enrollmentCapComplex: this._createComplexEnrolData(course),
    };

    return [fakeMeeting];
  }

  /**
   * Returns true if the meeting was added late.
   * @param course the course
   * @param mt the meeting which must be part of the course
   */
  private _meetingAddedLate(course: Course, mt: Meeting): boolean {
    let firstTime = 0;
    if (course.timeIntervals.length !== 0) {
      firstTime = course.timeIntervals[0];
    }
    // console.log(mt);
    // console.log(firstTime, mt.createdAt);
    return firstTime < mt.createdAt - 500; // if the meeting was created 100
    // seconds after the course. This helps prevent latency or smth
  }

  private _createComplexEnrolData(course: Course): EnrollmentCapComplex {
    const timeSlots = this._createCapChangeTimeSeries(course);
    let startingMaxForAll = 0;
    for (let mt of course.meetings) {
      if (this.hideSpecial && this._isSpecialMeeting(mt.meetingNumber)) {
        continue; // prevent special meetings from affecting the cap
      }
      if (
        mt.enrollmentCapComplex === null ||
        mt.enrollmentCapComplex === undefined
      ) {
        continue; // never supposed to happen in practice
      }
      // 0 if the course was added late otherwise
      if (!this._meetingAddedLate(course, mt))
        startingMaxForAll += mt.enrollmentCapComplex.initialCap;
    }
    const cplxNumCap = this._createNewComplexCaps(timeSlots, startingMaxForAll);
    // console.log(cplxNumCap);
    const toRet: EnrollmentCapComplex = {
      initialCap: startingMaxForAll,
      capChanges: cplxNumCap,
    };
    return toRet;
  }

  private _createCapChangeTimeSeries(course: Course): EnrollmentCapChange[] {
    // [TIME, CAP]
    let toReturn: EnrollmentCapChange[] = [];
    for (let met of course.meetings) {
      if (
        met.enrollmentCapComplex === null ||
        met.enrollmentCapComplex === undefined
      ) {
        continue;
      }
      let previousCap = met.enrollmentCapComplex.initialCap;
      if (this._meetingAddedLate(course, met)) {
        previousCap = 0;
        toReturn.push({
          time: met.createdAt,
          newCapacity: met.enrollmentCapComplex.initialCap,
        });
        // toReturn.push([met.createdAt, met.enrollmentCapComplex.initialCap]);
      }
      // if this meeting was added late, add [createdAt, initialCap] to the
      // changelog list and the initial cap is 0.

      for (let capSeries of met.enrollmentCapComplex.capChanges) {
        toReturn.push({
          time: capSeries.time,
          newCapacity: capSeries.newCapacity - previousCap,
        });
        // toReturn.push([capSeries[0], capSeries[1] - previousCap]);
        previousCap = capSeries.newCapacity;
        // previousCap = capSeries[1];
      }
    }
    // sort them by what was on the first index
    toReturn.sort((elem, elem2) => elem.time - elem2.time);
    // console.log("sorted", toReturn);
    return toReturn;
  }

  private _createNewComplexCaps(
    // [TIME, CAP]
    timeSeries: EnrollmentCapChange[],
    initialCap: number
  ): EnrollmentCapChange[] {
    const newCaps: EnrollmentCapChange[] = [];
    let previousCap = initialCap; // for more readibility
    for (let item of timeSeries) {
      if (
        newCaps.length === 0 ||
        newCaps[newCaps.length - 1].time !== item.time
      ) {
        newCaps.push({
          time: item.time,
          newCapacity: previousCap + item.newCapacity,
        });
        // newCaps.push([item[0], previousCap + item[1]]);
      } else {
        // newCaps[newCaps.length - 1][1] = newCaps[newCaps.length - 1][1] + item[1];
        newCaps[newCaps.length - 1].newCapacity =
          newCaps[newCaps.length - 1].newCapacity + item.newCapacity;
      }
      // console.log(newCaps);
      previousCap = newCaps[newCaps.length - 1].newCapacity;
    }
    return newCaps;
  }

  /**
   * Returns true if all values in this array are 0 or above.
   * @param arr the double array to check
   * @param hIndex the column of the array to inspect
   * @private
   */
  private _arrayHasNonNegativeValue(arr: number[][], hIndex: number): boolean {
    for (let j = 0; j < arr.length; j++) {
      let inspected = arr[j][hIndex];
      if (inspected <= -1) {
        return false;
      }
    }
    return true;
  }

  /**
   * a modified version of its first counterpart, with the following exception
   * or something
   *
   * @param doubleArr a 2x2 array
   * @private
   */
  private _flattenUnTransposedNumericalArray2(doubleArr: number[][]): {
    ar: number[];
    negativeAtOnePoint: boolean;
  } {
    let negativeAtOnePoint: boolean = false;
    const aggEnrollments: number[] = [];
    for (let i = 0; i < doubleArr[0].length; i++) {
      let sum = 0;
      let arrayHasNonNegativeValue = this._arrayHasNonNegativeValue(
        doubleArr,
        i
      );

      if (arrayHasNonNegativeValue) {
        for (let j = 0; j < doubleArr.length; j++) {
          if (!isNaN(doubleArr[j][i])) sum += doubleArr[j][i];
        }
      } else {
        let negativeAtOnePoint = true;
        let tempArray: number[] = [];
        for (let j = 0; j < doubleArr.length; j++) {
          if (!isNaN(doubleArr[j][i])) tempArray.push(doubleArr[j][i]);
          else tempArray.push(0);
        }
        sum = Math.max(...tempArray);
      }
      aggEnrollments.push(sum);
    }
    return { ar: aggEnrollments, negativeAtOnePoint: negativeAtOnePoint };
  }

  /**
   * transpose input and do something equivalent to transposed.map(x => sum(x))
   * or something
   *
   * @param doubleArr a 2x2 array
   * @private
   */
  private _flattenUnTransposedNumericalArray(doubleArr: number[][]): number[] {
    const aggEnrollments: number[] = [];
    for (let i = 0; i < doubleArr[0].length; i++) {
      let sum = 0;
      for (let j = 0; j < doubleArr.length; j++) {
        if (!isNaN(doubleArr[j][i])) sum += doubleArr[j][i];
      }
      aggEnrollments.push(sum);
    }
    return aggEnrollments;
  }

  faculty: string = '';

  private _combineAll: boolean = false;
  public get combineAll(): boolean {
    return this._combineAll;
  }

  public set combineAll(value: boolean) {
    this._combineAll = value;
    if (value) this._showRemaining = false;
    this.loadCourseData(this.inputCourse);
  }

  fys: string = 'F';
  lastTime: number = 0;
  firstTime: number = 0;

  /**
   * If the current course faculty is UNKNOWN,
   * but we know the campus...
   * @param crsCode the course code
   */
  fallbackFacultyIfUnknown(crsCode: string): string {
    // console.log(crsCode);
    if (crsCode.match(/^[A-Z]{3}([A-D]|\d)\d{2}[HY]\d/)) {
      const campusNum = crsCode[7];
      if (campusNum === '3') {
        return 'SCAR';
      } else if (campusNum === '5') {
        return 'ERIN';
      } else {
        return 'UNKNOWN';
      }
    }
    return 'UNKNOWN';
  }

  lastAfterEnrollmentDeadline = false;

  /**
   * Updates all important counts attached to crs
   * @param crs the course information to be passed in
   *
   */
  updateImportantCounts(crs: Course): void {
    let fys = crs.code[crs.code.length - 1];

    let lastTime = 0;
    let firstTime = 0;
    if (crs.timeIntervals.length >= 1) {
      lastTime = crs.timeIntervals[crs.timeIntervals.length - 1];
      firstTime = crs.timeIntervals[0];
    }
    this.lastTime = lastTime;
    this.firstTime = firstTime;

    if (!fys.match(/[FYS]/)) {
      return;
    }
    this.faculty =
      crs.faculty === 'UNKNOWN'
        ? this.fallbackFacultyIfUnknown(crs.code)
        : crs.faculty;
    // console.log(this.faculty);
    this.fys = fys; // set this to be global here
    const aggEnrollments: number[] = [];
    const enrollmentCollection: number[][] = [];
    let cap = 0;
    for (let met of crs.meetings) {
      if (this.hideSpecial && this._isSpecialMeeting(met.meetingNumber)) {
        continue;
      }
      enrollmentCollection.push(met.enrollmentLogs);
      cap += met.enrollmentCap;
    }

    for (let i = 0; i < enrollmentCollection[0].length; i++) {
      let sum = 0;
      for (let j = 0; j < enrollmentCollection.length; j++) {
        if (!isNaN(enrollmentCollection[j][i]))
          sum += enrollmentCollection[j][i];
      }
      aggEnrollments.push(sum);
    }
    this.currentEnrollment = aggEnrollments[aggEnrollments.length - 1];
    this.cap = cap;

    let startingTermIndex: number = 0;
    let dropDateIndex: number = 0;
    let lwdDateIndex: number = 0;

    let re75Index: number | null = null;
    let re50Index: number | null = null;

    const targetImportantDates = this.getImportantDatesBasedOnFaculty(
      this.faculty
    );
    if (targetImportantDates === undefined) {
      console.log('Pratically, this should never happen.');
      return;
    }

    if (targetImportantDates === null) {
      return;
    }

    if (fys === 'F') {
      startingTermIndex = this.findIndexFirstDay(
        crs.timeIntervals,
        targetImportantDates.fallEnrollmentEnd
      );

      if (notNullorUndefined(targetImportantDates.fall75)) {
        re75Index = this.findIndexFirstDay(
          crs.timeIntervals,
          targetImportantDates.fall75
        );
        if (notNullorUndefined(targetImportantDates.fall50)) {
          re50Index = this.findIndexFirstDay(
            crs.timeIntervals,
            targetImportantDates.fall50
          );
        } else {
          re50Index = null;
        }
      } else {
        re75Index = null;
        re50Index = null;
      }
      dropDateIndex = this.findIndexFirstDay(
        crs.timeIntervals,
        targetImportantDates.fallDrop + this.deadlineTimeOffset
      );
      lwdDateIndex = this.findIndexFirstDay(
        crs.timeIntervals,
        targetImportantDates.fallLWD
      );
    } else if (fys === 'S') {
      startingTermIndex = this.findIndexFirstDay(
        crs.timeIntervals,
        targetImportantDates.winterEnrollmentEnd
      );
      dropDateIndex = this.findIndexFirstDay(
        crs.timeIntervals,
        targetImportantDates.winterDrop + this.deadlineTimeOffset
      );
      if (notNullorUndefined(targetImportantDates.winter75)) {
        re75Index = this.findIndexFirstDay(
          crs.timeIntervals,
          targetImportantDates.winter75
        );
        if (notNullorUndefined(targetImportantDates.winter50)) {
          re50Index = this.findIndexFirstDay(
            crs.timeIntervals,
            targetImportantDates.winter50
          );
        } else {
          re50Index = null;
        }
      } else {
        re75Index = null;
        re50Index = null;
      }
      lwdDateIndex = this.findIndexFirstDay(
        crs.timeIntervals,
        targetImportantDates.winterLWD
      );
    } else if (fys === 'Y') {
      startingTermIndex = this.findIndexFirstDay(
        crs.timeIntervals,
        targetImportantDates.fallEnrollmentEnd
      );
      if (notNullorUndefined(targetImportantDates.year75)) {
        re75Index = this.findIndexFirstDay(
          crs.timeIntervals,
          targetImportantDates.year75
        );
        if (notNullorUndefined(targetImportantDates.year50)) {
          re50Index = this.findIndexFirstDay(
            crs.timeIntervals,
            targetImportantDates.year50
          );
        } else {
          re50Index = null;
        }
      } else {
        re75Index = null;
        re50Index = null;
      }
      dropDateIndex = this.findIndexFirstDay(
        crs.timeIntervals,
        targetImportantDates.yearDrop + this.deadlineTimeOffset
      );
      lwdDateIndex = this.findIndexFirstDay(
        crs.timeIntervals,
        targetImportantDates.winterLWD
      );
    }

    this.finalEnrollment =
      startingTermIndex === -1
        ? this.currentEnrollment
        : this._calculateFEnroll(enrollmentCollection, startingTermIndex);

    let enrolsAtDropDate =
      dropDateIndex === -1
        ? this.currentEnrollment
        : aggEnrollments[dropDateIndex];
    let enrolsAtLwdDate = this.currentEnrollment; // lwd is infinite as
    // the last day to LWD is the last day to request it.

    this.drops = this.finalEnrollment - enrolsAtDropDate;
    this.lwds = enrolsAtDropDate - enrolsAtLwdDate;
    this.lastAfterEnrollmentDeadline = false;
    this.etd = null;
    const lookBackTime = this.lookBack();
    if (lookBackTime !== null) {
      const fdi = this.findIndexFirstDay(crs.timeIntervals, lookBackTime);
      if (fdi !== -1) {
        this.etd = aggEnrollments[fdi];
      }
      if (lookBackTime > this.enrollmentDeadline) {
        // console.log('LBT-ED', lookBackTime, this.enrollmentDeadline);
        this.lastAfterEnrollmentDeadline = true;
      }
    }

    if (re75Index !== null) {
      let enrolsAt75 =
        re75Index === -1 ? this.currentEnrollment : aggEnrollments[re75Index];
      this.re75 = this.finalEnrollment - enrolsAt75;
      if (re50Index !== null) {
        let enrolsAt50 =
          re50Index === -1 ? this.currentEnrollment : aggEnrollments[re50Index];
        this.re50 = enrolsAt75 - enrolsAt50;
        this.re0 = enrolsAt50 - enrolsAtDropDate;
      } else {
        this.re50 = null;
        this.re0 = null;
      }
    } else {
      this.re75 = null;
      this.re50 = null;
      this.re0 = null;
    }
    this.isSummer = targetImportantDates.isSummer === true;
    this.recalculateAnnotations();
  }

  private _calculateFEnroll(
    enrollmentCollection: number[][],
    startingTermIndex: number
  ) {
    let tempFinalEnroll = 0;
    for (let er of enrollmentCollection) {
      tempFinalEnroll += this.findMaxAmended(er, startingTermIndex);
    }
    return tempFinalEnroll;
  }

  /**
   * Finds the maximum value of the array[index:].
   * @param arr the array
   * @param index the index to start looking for
   * @returns the max, or 0 if the array is too short
   */
  findMaxAfterIndex(arr: number[], index: number): number {
    if (index < 0) {
      return 0;
    }

    let max = 0;
    for (let i = index; i < arr.length; i++) {
      if (arr[i] > max) {
        max = arr[i];
      }
    }
    return max;
  }

  /**
   * Finds the max of timings[firstIndex:], or timings[-1] if
   * firstIndex >= timings.length()
   * @param timings the timings list
   * @param firstIndex the index corresponding to the day of closure
   */
  findMaxAmended(timings: number[], firstIndex: number): number {
    if (timings.length === 0) {
      return 0;
    }
    if (firstIndex >= timings.length) {
      return timings[timings.length - 1];
    }
    return Math.max(...timings.slice(firstIndex));
  }

  /**
   * Returns the first index in timings where timingCap is
   * greater or equal to timings at index.
   *
   * @param timings a list of timings
   * @param timingCap the first to detect
   */
  findIndexFirstDay(timings: number[], timingCap: number): number {
    for (let i = 0; i < timings.length; i++) {
      if (timings[i] >= timingCap) {
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
  etd: number | null = null;
  dtd: number | null = null;

  lastUpdateString: string = '';

  colors: string[] = [
    '#6E4DBC',
    '#1C996F',
    '#D1543B',
    '#ac3ebd',
    '#D48A35',
    '#3CABB5',
    '#48ce00',
    '#d32295',
    '#2d89d3',
    '#6b4a32',
    '#505050',
    '#003b6e',
    '#8105a6',
    '#9b9100',
    '#cb3500',
    '#492100',
    '#000000',
  ];

  colors2 = [
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

  specialColors: string[] = [
    '#755F59',
    '#93A67E',
    '#C2ADA7',
    '#939EC2',
    '#5F6475',
  ];

  toggleSeperateSpecialColors: boolean = true;

  private _getColorSeries(colorNum: number): string {
    return this.colors[colorNum % this.colors.length];
  }

  private _getSpecialColorSeries(colorNum: number): string {
    return this.specialColors[colorNum % this.specialColors.length];
  }
}

function notNullorUndefined<T>(val: T | null | undefined): val is T {
  return val !== null && val !== undefined;
}
function pythonModulus(a: number, b: number): number {
  return ((a % b) + b) % b;
}
