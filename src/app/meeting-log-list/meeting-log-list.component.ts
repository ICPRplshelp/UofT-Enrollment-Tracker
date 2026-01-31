import { Component, OnInit, Input } from '@angular/core';
import { Meeting } from '../cinterfaces';

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
