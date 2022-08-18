import { TestBed } from '@angular/core/testing';

import { AllCoursesService } from './all-courses.service';

describe('AllCoursesService', () => {
  let service: AllCoursesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AllCoursesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
