import { Component, OnInit, Input } from '@angular/core';
import { InstructorLog, Meeting } from '../cinterfaces';

@Component({
  selector: 'app-meeting-log-list',
  templateUrl: './meeting-log-list.component.html',
  styleUrls: ['./meeting-log-list.component.scss']
})
export class MeetingLogListComponent implements OnInit {
  @Input() meetings: Meeting[] = [];
  constructor() { }

  ngOnInit(): void {
  }

  getChangeCount(insLog: InstructorLog | undefined): number {
    if (insLog === undefined) {
      return 0;
    }
    const firstIsEmpty = (insLog.initialInstructors.length === 0);
    if(firstIsEmpty) {
      return Math.max(0, insLog.instructorChanges.length - 1);
    } else {
      return Math.max(0, insLog.instructorChanges.length);
    }
  }

  sq(t: any[] | number): string {
    if (typeof t === 'number') {
      if(t === 1) {
        return "";
      } else {
        return "s";
      }
    }
    if (t.length === 1) return "";
    return "s";
  }

  noOnZero(num: number): string {
    if(num === 0) {
      return "No";
    } else {
      return `${num}`;
    }
  }


    getDeliverySymbol(deliveryMode: string | undefined): string {
    switch (deliveryMode) {
      case 'INPER':
        return 'In person';
      case 'SYNC':
        return 'Online';
      case 'SYNIF':
        return 'Online';
      case 'HYBR':
        return 'Hybrid';
      case 'ASYNC':
        return 'Async';
      case 'ASYIF':
        return 'Async';
      case 'ASYNIF':
        return 'Async';
      default:
        return '';
    }
  }

}
