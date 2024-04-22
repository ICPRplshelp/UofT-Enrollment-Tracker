import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportantDatesComponent } from './important-dates.component';

describe('ImportantDatesComponent', () => {
  let component: ImportantDatesComponent;
  let fixture: ComponentFixture<ImportantDatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportantDatesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportantDatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
