import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingLogListComponent } from './meeting-log-list.component';

describe('MeetingLogListComponent', () => {
  let component: MeetingLogListComponent;
  let fixture: ComponentFixture<MeetingLogListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeetingLogListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MeetingLogListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
