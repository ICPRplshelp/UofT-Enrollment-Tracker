import { Component, OnInit, Input } from '@angular/core';
import { InstructorChangeInstance, InstructorLog } from '../cinterfaces';

@Component({
  selector: 'app-instructor-log-viewer',
  templateUrl: './instructor-log-viewer.component.html',
  styleUrls: ['./instructor-log-viewer.component.scss']
})
export class InstructorLogViewerComponent implements OnInit {

  @Input() log: InstructorLog | undefined;


  get sortedChanges(): InstructorChangeInstance[] {
    if (!this.log || !this.log.instructorChanges) {
      return [];
    }
    return [...this.log.instructorChanges].sort((a, b) => a.timing - b.timing);
  }


  constructor() { }

  ngOnInit(): void {
  }

}
