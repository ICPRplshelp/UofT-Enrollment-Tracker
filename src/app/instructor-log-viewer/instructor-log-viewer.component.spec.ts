import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorLogViewerComponent } from './instructor-log-viewer.component';

describe('InstructorLogViewerComponent', () => {
  let component: InstructorLogViewerComponent;
  let fixture: ComponentFixture<InstructorLogViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstructorLogViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InstructorLogViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
