import { Component } from '@angular/core';
import { ChartOptions, ChartDataset, ChartType } from 'chart.js';
import { Course } from './cinterfaces';
import { CrsgetterService } from './crsgetter.service';
import * as pluginAnnotation from 'chartjs-plugin-annotation';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'timetabletracker';

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

  constructor(private crsgetter: CrsgetterService) {}
  ngOnInit() {
    this.loadCourseData(this.inputCourse);
  }

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
    if(exclamIndex === -1) exclamIndex = this._curErrorMessage.length;
    if (
      this._curErrorMessage.length > 0 &&
      this._curErrorMessage.substring(0, exclamIndex) === value) {
      this._curErrorMessage += '!';
    } else {
      this._curErrorMessage = value;
    }
    this.hasFailed = value !== '';
    console.log(this.hasFailed);
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


  fmtNumAsPercent(num: number): string {
// if num is NaN or any infinity then it is a 0
    if (isNaN(num) || Math.abs(num) === Infinity) {
      return '0.00%';
    }


    return (num * 100).toFixed(2) + '%';
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
    // if courseCode's second last index isn't a "-", then make it so
    if (courseCode.length === 9 && courseCode[courseCode.length - 2] !== '-') {
      courseCode =
        courseCode.slice(0, courseCode.length - 1) +
        '-' +
        courseCode.charAt(courseCode.length - 1);
    }

    // check if courseCode matches this regex:
    // [A-Z]{3}[0-9]{3}[HY]{1}[0-9]{1}-[FYS]{1}
    if (!courseCode.match(/[A-Z]{3}[0-9]{3}[HY]{1}[01]{1}-[FYS]{1}/)) {
      if (courseCode.match(/[A-Z]{3}[A-D0-9][0-9]{2}[HY]{1}/)) {
        
        if  (courseCode.length >= 8 && courseCode[7] === '3' || courseCode[7] === '5') {

          this.curErrorMessage = this.utmUtsc;
        
      } else this.curErrorMessage = this.missingSuffix;


      }  else if (courseCode.match(/[A-Z]{3}[0-9]{3}/)) {
        this.curErrorMessage = this.missingHY;
      } else {
        // if courseCode is 7 or more characters long and the 6th character is a 3 or 5
        
        

        this.curErrorMessage = this.invalidCourseRegexWarning;
        
      }
      // alert("Invalid course code: " + courseCode);
      return;
    }
    let courseInfo: Course;
    this.crsgetter.getCourse(courseCode).subscribe(
      (data) => {
        courseInfo = data;
      },
      () => {
        this.curErrorMessage = this.courseDoesNotExist;
        // console.log("this course never existed");
      },
      () => {
        this.curErrorMessage = '';
        // console.log("attempting to redraw the graph");
        this._loadCourseDataHelper(courseInfo);
      }
    );
  }

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
   * A helper to the method above so
   * I don't need to have to type the smae
   * thing exactly twice.
   *
   * @param course the course information.
   */
  private _loadCourseDataHelper(course: Course): void {
    if (course === null || course === undefined) {
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
    console.log(this.lastUpdateString);

    const maxEnrollmentsSoFar: ChartDataset[] = [];
    let iterations = 0;
    for (let mtt of course.meetings) {
      let tempBordercolor = this._getColorSeries(iterations);
      // let tempBackgroundColor = 'rgba(120, 0, 0, 0)';
      let tempShowLine = true;
      let tempPointRadius = 0;
      let tempLabel = `${mtt.meetingNumber} - ${mtt.instructor}`;
      let chartPoints: { x: number; y: number }[] = [];

      // loops over a strip of enrollment numbers
      for (let i = 0; i < mtt.enrollmentLogs.length; i++) {
        let enrollment = mtt.enrollmentLogs[i];
        let timeOfEnrollment = timings[i];
        chartPoints.push({ x: timeOfEnrollment * 1000, y: enrollment });
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
        // dead code for displaying maximum enrollments
        maxEnrollmentsSoFar.push({
          data: [
            { x: earliest * 1000, y: mtt.enrollmentCap },
            { x: latest * 1000, y: mtt.enrollmentCap },
          ],
          showLine: true,
          pointRadius: 0,
          backgroundColor: tempBordercolor,
          borderColor: tempBordercolor,
          borderDash: [10, 5],
          label: `${mtt.meetingNumber} - MAX`,
        });
      }

      iterations++;
    }
    // add all of maxEnrollmentsSoFar to chartDatasetSoFar
    chartDatasetSoFar.push(...maxEnrollmentsSoFar);
    this.scatterChartData = chartDatasetSoFar;
    this.currentEnrollment = course.currentEnrollment;
    this.finalEnrollment = course.finalEnrollment;
    this.drops = course.drops;
    this.lwds = course.lwds;
    this.cap = course.cap;
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
    '#a622d3',
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
