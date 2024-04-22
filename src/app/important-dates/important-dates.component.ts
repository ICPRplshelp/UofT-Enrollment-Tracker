import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ImportantTimestamps } from '../cinterfaces';
import {
  DeadlineCell,
  IntermediateDeadlineCell,
} from './important-dates-interfaces';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-important-dates',
  templateUrl: './important-dates.component.html',
  styleUrls: ['./important-dates.component.scss'],
})
export class ImportantDatesComponent implements OnInit {
  @Input() importantDates: ImportantTimestamps | null | undefined;
  readonly details: Partial<StringValues<ImportantTimestamps>> = {
    start: '',
    summerPriority: 'First day of summer priority enrollment',
    fourth: '4th year enrollment starts',
    third: '3rd year enrollment starts',
    second: '2nd year enrollment starts',
    first: '1st year enrollment starts',
    general: 'General enrollment period',
    otherCampus: 'Other campus enrollment',
    fallFirstDay: 'F and Y courses start',
    fallWaitlistClosed: 'F and Y waitlists close',
    fallEnrollmentEnd: 'F and Y enrollment closes',
    fallDrop: 'F drop deadline',
    fallLWD: 'F classes end',
    winterStart: 'S classes start',
    winterWaitlistClosed: 'S waitlists close',
    winterEnrollmentEnd: 'S enrollment closes',
    yearDrop: 'Y drop deadline',
    winterDrop: 'S drop deadline',
    winterLWD: 'S classes end',
    endOfYear: '',
    fall75: 'F Refund rates drop from 75% to 50%',
    fall50: 'F Refund rates drop to 0%',
    winter75: 'S refund rates drop from 75% to 50%',
    winter50: 'S refund rates drop to 0%',
    year75: 'Y refund rates drop from 75% to 50%',
    year50: 'Y refund rates drop from 50% to 0',
    isSummer: 'This session is in the summer',
  };

  readonly displayedColumns: string[] = ['description', 'val', 'relative'];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['importantDates']) {
      this.currentCells = this.generateDescriptions(this.importantDates);
    }
  }

  currentCells: DeadlineCell[] = [];

  generateDescriptions(
    dates: ImportantTimestamps | undefined | null
  ): DeadlineCell[] {
    if (dates === undefined || dates === null) {
      return [];
    }
    const cells: IntermediateDeadlineCell[] = Object.keys(dates)
      .filter((key) => {
        let deets = this.details[key as keyof ImportantTimestamps];
        return deets !== undefined && deets !== null && deets !== '';
      })
      .map((key) => {
        const desc = this.details[key as keyof ImportantTimestamps];
        const tgDate = dates[key as keyof ImportantTimestamps];
        return { val: tgDate, description: desc };
      }) as IntermediateDeadlineCell[];

    cells.sort((a, b) => {
      if (typeof a.val === 'boolean' || typeof b.val === 'boolean') {
        if (typeof a.val === 'boolean' && typeof b.val === 'boolean') {
          return 0;
        } else if (typeof a.val === 'boolean' && typeof b.val === 'number') {
          return 1;
        } else {
          return -1;
        }
      }

      return a.val - b.val;
    });

    return cells.map((c) => {
      return { description: c.description, val: this.stringifyValue(c.val),
        relative: this.compTimes(c.val)
       };
    });
  }

  stringifyValue(val: number | boolean): string {
    if (typeof val === 'boolean') {
      return val ? 'True' : 'False';
    }

    const options: any = {
      timeZone: 'America/New_York', // Specify Eastern Time Zone
      weekday: 'short',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    };
    const asDate = new Date(val * 1000);
    return asDate.toLocaleString('en-US', options);
  }

  compTimes(compTo: number | boolean): string {
    if(typeof compTo === 'boolean'){
      return "";
    }
    const currentTimeUnix = Date.now();
    const currentTimeUnixInSeconds = Math.floor(currentTimeUnix / 1000);
    const diffSigned = compTo - currentTimeUnixInSeconds;
    const secondsInMinute = 60;
    const minutesInHour = 60;
    const hoursInDay = 24;
    const diff = Math.abs(diffSigned);
    const isInThePast = diffSigned < 0;
    const days = Math.floor(
      diff /
        ( secondsInMinute * minutesInHour * hoursInDay)
    );
    if (isInThePast) {
      if (days !== 0 && days !== 1) {
        return `${days} days ago`;
      } else if (days === 1) {
        return '1 day ago';
      } else {
        return 'Today';
      }
    } else {
      if (days !== 0 && days !== 1) {
        return `In ${days} days`;
      } else if (days === 1) {
        return 'In 1 day';
      } else {
        return 'Less than 1 day';
      }
    }
  }

  constructor() {}
  ngOnInit(): void {}
}

type StringValues<T> = {
  [K in keyof T]: string;
};
