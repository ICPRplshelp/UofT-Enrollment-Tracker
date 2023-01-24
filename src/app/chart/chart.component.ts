import { Component, HostListener, OnInit } from '@angular/core';
import { CrsgetterService } from '../crsgetter.service';
import { AllCoursesService } from '../all-courses.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  Course,
  EnrollmentCapComplex,
  ImportantTimestamps,
  IndividualSessionInfo,
  Meeting,
  SessionCollection,
} from '../cinterfaces';
import Annotation, * as pluginAnnotation from 'chartjs-plugin-annotation';

import { Chart, ChartDataset, ChartOptions, ChartType } from 'chart.js';
import { max } from 'moment';
import { AutoCompleteService } from '../shared/auto-complete.service';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent implements OnInit {
  deadlineTimeOffset: number = 160000; // deadlines for last day to
  // add or drop are offset by this much to account for timetable delays.
  // these only impact the drop rate.

  title = 'timetabletracker';

  constructor(
    private crsgetter: CrsgetterService,
    private ac: AllCoursesService,
    private _snackBar: MatSnackBar,
    private autoCompleter: AutoCompleteService
  ) {
    Chart.register(Annotation);
  }

  myFavCourses: string[] = [
    'EAS110Y1-Y',
    'POL222H1-F',
    'LIN101H1-F',
    'CSC384H1-S',
    'CHM247H1-S',
    'LIN102H1-S',
    'POL107H1-F',
    'ENV200H1-S',
    'FSL100H1-F',
    'RSM333H1-S',
    'RSM250H1-S',
    'MAT237Y1-Y',
    'SPA100Y1-Y',
    'ENV100H1-F',
    'EAS120Y1-Y',
    'POL109H1-S',
    'RSM222H1-F',
    'POL106H1-F',
    'SOC100H1-S',
    'PSY100H1-F',
    'MAT244H1-F',
    'GGR124H1-S',
    'CSC343H1-S',
    'RSM219H1-F',
    'PSY100H1-S',
    'ECO202Y1-Y',
    'POL200Y1-Y',
    'ECO200Y1-Y',
    'ECO105Y1-Y',
    'MAT223H1-S',
    'CSC263H1-S',
    'STA130H1-S',
    'CSC236H1-F',
    'ECO204Y1-Y',
    'PHY132H1-S',
    'STA130H1-F',
    'POL101H1-F',
    'MAT224H1-S',
    'CSC209H1-S',
    'ANT100Y1-Y',
    'CSC207H1-F',
    'SOC150H1-S',
    'STA238H1-S',
    'PHY131H1-F',
    'STA237H1-F',
    'PSL301H1-S',
    'ECO220Y1-Y',
    'CSC108H1-S',
    'AST201H1-S',
    'BIO220H1-S',
    'PSL300H1-F',
    'MAT133Y1-Y',
    'HMB265H1-F',
    'MAT235Y1-Y',
    'BCH210H1-F',
    'BIO230H1-F',
    'AST101H1-F',
    'MAT223H1-F',
    'MAT137Y1-Y',
    'SOC100H1-F',
    'CHM135H1-F',
    'CSC148H1-S',
    'BIO130H1-S',
    'CHM136H1-S',
    'BIO120H1-F',
    'CSC108H1-F',
    'ECO101H1-F',
    'ECO102H1-S',
    'MAT136H1-S',
    'MAT135H1-F',
  ];

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

  selectedValue: string = '20229';

  ngOnInit() {
    let tempData: ImportantTimestamps;
    this.crsgetter.getImportantDates().subscribe({
      next: (data) => {
        tempData = data;
      },
      error: () => {
        // console.log("Couldn't load important timestamps");
      },
      complete: () => {
        this.importantDates = tempData;
        this._loadCourseDataHelper();
      }
    }
    );

    let tempData2: SessionCollection;
    this.crsgetter.getSessionCollection().subscribe({
      next: (data) => {
        tempData2 = data;
      },
      error: () => {
        // console.log("Couldn't load session lists")
      },
      complete: () => {
        this.sessionColl = tempData2;
        this.selectedValue =
          tempData2.sessions[tempData2.sessions.length - 1].sessionCode;
        this._loadCourseDataHelper();
      }}
    );

    this.inputCourse =
      this.myFavCourses[Math.floor(Math.random() * this.myFavCourses.length)];

    this.loadCourseData(this.inputCourse);
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

  /**
   * Recalculate the annotations on this chart.
   * This method will run AFTER the chart has been redrawn.
   */
  recalculateAnnotations(): void {
    let lastEnrol: number;
    let lastDrop: number;
    let lastClass: number;

    if (!this.showAnnotations) {
      if (
        this.scatterChartOptions !== undefined &&
        this.scatterChartOptions.plugins !== undefined &&
        this.scatterChartOptions.plugins.annotation !== undefined
      ) {
        this.scatterChartOptions.plugins.annotation.annotations = [];
      }
      return;
    }

    // if these values are zero, don't do anything
    // this.lastTime is the last time
    if (this.fys === 'F') {
      lastEnrol = this._undefinedOrBefore(
        this.importantDates?.fallEnrollmentEnd,
        this.lastTime
      );
      lastDrop = this._undefinedOrBefore(
        this.importantDates?.fallDrop,
        this.lastTime
      );
      lastClass = this._undefinedOrBefore(
        this.importantDates?.fallLWD,
        this.lastTime
      );
    } else if (this.fys === 'S') {
      lastEnrol = this._undefinedOrBefore(
        this.importantDates?.winterEnrollmentEnd,
        this.lastTime
      );
      lastDrop = this._undefinedOrBefore(
        this.importantDates?.winterDrop,
        this.lastTime
      );
      lastClass = this._undefinedOrBefore(
        this.importantDates?.winterLWD,
        this.lastTime
      );
    } else {
      lastEnrol = this._undefinedOrBefore(
        this.importantDates?.fallEnrollmentEnd,
        this.lastTime
      );
      lastDrop = this._undefinedOrBefore(
        this.importantDates?.yearDrop,
        this.lastTime
      );
      lastClass = this._undefinedOrBefore(
        this.importantDates?.winterLWD,
        this.lastTime
      );
    }

    const annotationList: any[] = [];
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
          content: 'enrollment deadline',
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
          content: 'drop deadline',
        },
      });
    }

    if (
      this.importantDates !== null &&
      this.importantDates !== undefined &&
      this.importantDates.general > this.earliestChartTime
    ) {
      console.log('earliest chart time', this.earliestChartTime);
      console.log('general time', this.importantDates.general);
      annotationList.push({
        type: 'line',
        scaleID: 'x',
        value: this.importantDates.general * 1000,
        borderColor: 'green',
        borderWidth: 2,
        label: {
          display: true,
          position: 'end',
          content: 'general enrollment',
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
          content: 'classes end',
        },
      });
    }
    if (
      this.scatterChartOptions !== undefined &&
      this.scatterChartOptions.plugins !== undefined &&
      this.scatterChartOptions.plugins.annotation !== undefined
    ) {
      this.scatterChartOptions.plugins.annotation.annotations = annotationList;
    }
  }
  earliestChartTime: number = 0;
  inputCourse: string = 'MAT137Y1-Y';

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

  keyDownFunction(event: { keyCode: number }) {
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
  }

  randomized: number = 50;

  invalidCourseRegexWarning: string = "This isn't a course code";
  courseDoesNotExist: string =
    "This course doesn't exist or is not offered in this term";
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

  shakeClass() {
    let shakeableClasses = document.getElementsByClassName('shakeable');
    for (let i = 0; i < shakeableClasses.length; i++) {
      shakeableClasses[i].classList.add('shake');
    }

    setTimeout(() => {
      for (let i = 0; i < shakeableClasses.length; i++) {
        shakeableClasses[i].classList.remove('shake');
      }
    }, 1000);
  }

  previousFullCourseCode = '';

  fmtNumAsPercent(num: number): string {
    if (isNaN(num) || Math.abs(num) === Infinity) {
      return '0.00%';
    }

    return (num * 100).toFixed(2) + '%';
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

  formatInstructors(ins: string[][]): string {
    let names: string[] = [];
    for (let fl of ins) {
      if (fl.length === 1) {
        names.push(fl[0]);
      } else if (fl.length === 0) {
        // do nothing
      } else names.push(`${fl[0]} ${fl[1]}`);
    }
    let cand = names.join(', ');
    return cand !== '' ? cand : 'TBA';
  }

  determineCourseCode(crsCode: string): string {
    // console.log("Attempting to autocomplete");
    return this.autoCompleter.autoCompleteSearch(crsCode);
  }

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

    if (this.autoFormat) this.inputCourse = tempCourse.replace('-', '');

    courseCode = tempCourse;

    if (this.previousCourse === courseCode) {
      if (!this.previousWasError) {
        this._loadCourseDataHelper();
      } else {
        this._curErrorMessage += '!';
      }
      return;
    }

    let courseInfo: Course;
    this.crsgetter.getCourse(courseCode).subscribe({
      next: (data) => {
        courseInfo = data;
      },
      error: () => {
        this.curErrorMessage = this.courseDoesNotExist;
        this.previousWasError = true;
        this.previousCourse = courseCode;
      },
      complete: () => {
        this.curErrorMessage = '';

        this.previousCourseInfo = courseInfo;
        this.previousFullCourseCode = tempCourse;
        this.courseTitle = courseInfo.title;
        this.previousCourse = courseCode;
        this.previousWasError = false;
        this._loadCourseDataHelper(courseInfo);
      }}
    );
  }

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

    this.recalculateAfterWaitlistClosed(course, latest);

    chartDatasetSoFar.push(...maxEnrollmentsSoFar);
    this.scatterChartData = chartDatasetSoFar;
  }

  private recalculateAfterWaitlistClosed(course: Course, latest: number) {
    if (this.importantDates !== null) {
      let waitlistDeadline: number;
      if (
        course.code[course.code.length - 1] === 'F' ||
        course.code[course.code.length - 1] === 'Y'
      ) {
        waitlistDeadline = this.importantDates.fallWaitlistClosed;
      } else {
        waitlistDeadline = this.importantDates.winterWaitlistClosed;
      }

      this.afterWaitlistDeadline = latest > waitlistDeadline;
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
      let unix1K = temp[0] * 1000;
      let tempCap = temp[1];
      capSeries.push({ x: unix1K - 1, y: previousCap });
      capSeries.push({ x: unix1K, y: tempCap });
      previousCap = tempCap;
    }
    // the last cap series
    const lastCapSeries =
      mtt.enrollmentCapComplex.capChanges.length === 0
        ? mtt.enrollmentCapComplex.initialCap
        : mtt.enrollmentCapComplex.capChanges[
            mtt.enrollmentCapComplex.capChanges.length - 1
          ][1];
    capSeries.push({ x: latest * 1000, y: lastCapSeries });
    return capSeries;
  }

  afterWaitlistDeadline: boolean = false;

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
      capSoFar += cap;
      let tempLsf: number[] = mtt.enrollmentLogs.map((x) => cap - x);
      spacesLeftArray.push(tempLsf);
    }

    const temp = this._flattenUnTransposedNumericalArray2(spacesLeftArray);

    const finalArr = temp.ar;

    let fakeMeeting: Meeting = {
      meetingNumber: 'ALL LEFT',
      instructors: [['', '']],
      enrollmentLogs: finalArr,
      enrollmentCap: capSoFar,
      createdAt: 0,
    };
    let smallList = [fakeMeeting];

    let fakeMeeting2: Meeting = {
      meetingNumber: 'ZERO',
      instructors: [['', '']],
      enrollmentLogs: [],
      enrollmentCap: 0,
      createdAt: 0,
    };
    smallList.push(fakeMeeting2);

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
      instructors: [['', '']],
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

  private _createCapChangeTimeSeries(course: Course): number[][] {
    let toReturn: number[][] = [];
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
        toReturn.push([met.createdAt, met.enrollmentCapComplex.initialCap]);
      }
      // if this meeting was added late, add [createdAt, initialCap] to the
      // changelog list and the initial cap is 0.

      for (let capSeries of met.enrollmentCapComplex.capChanges) {
        toReturn.push([capSeries[0], capSeries[1] - previousCap]);
        previousCap = capSeries[1];
      }
    }
    // sort them by what was on the first index
    toReturn.sort((elem, elem2) => elem[0] - elem2[0]);
    // console.log("sorted", toReturn);
    return toReturn;
  }

  private _createNewComplexCaps(
    timeSeries: number[][],
    initialCap: number
  ): number[][] {
    const newCaps: number[][] = [];
    let previousCap = initialCap; // for more readibility
    for (let item of timeSeries) {
      if (newCaps.length === 0 || newCaps[newCaps.length - 1][0] !== item[0]) {
        newCaps.push([item[0], previousCap + item[1]]);
      } else {
        newCaps[newCaps.length - 1][1] =
          newCaps[newCaps.length - 1][1] + item[1];
      }
      // console.log(newCaps);
      previousCap = newCaps[newCaps.length - 1][1];
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

  /**
   * Updates all important counts attached to crs
   * @param crs the course information to be passed in
   *
   */
  updateImportantCounts(crs: Course): void {
    let fys = crs.code[crs.code.length - 1];

    let lastTime = 0;
    if (crs.timeIntervals.length >= 1)
      lastTime = crs.timeIntervals[crs.timeIntervals.length - 1];
    this.lastTime = lastTime;

    if (!fys.match(/[FYS]/)) {
      return;
    }
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

    if (this.importantDates === null) {
      return;
    }

    if (fys === 'F') {
      startingTermIndex = this.findIndexFirstDay(
        crs.timeIntervals,
        this.importantDates.fallEnrollmentEnd
      );
      dropDateIndex = this.findIndexFirstDay(
        crs.timeIntervals,
        this.importantDates.fallDrop + this.deadlineTimeOffset
      );
      lwdDateIndex = this.findIndexFirstDay(
        crs.timeIntervals,
        this.importantDates.fallLWD
      );
    } else if (fys === 'S') {
      startingTermIndex = this.findIndexFirstDay(
        crs.timeIntervals,
        this.importantDates.winterEnrollmentEnd
      );
      dropDateIndex = this.findIndexFirstDay(
        crs.timeIntervals,
        this.importantDates.winterDrop + this.deadlineTimeOffset
      );
      lwdDateIndex = this.findIndexFirstDay(
        crs.timeIntervals,
        this.importantDates.winterLWD
      );
    } else if (fys === 'Y') {
      startingTermIndex = this.findIndexFirstDay(
        crs.timeIntervals,
        this.importantDates.fallEnrollmentEnd
      );
      dropDateIndex = this.findIndexFirstDay(
        crs.timeIntervals,
        this.importantDates.yearDrop + this.deadlineTimeOffset
      );
      lwdDateIndex = this.findIndexFirstDay(
        crs.timeIntervals,
        this.importantDates.winterLWD
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

  lastUpdateString: string = '';

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
