import { TestBed } from '@angular/core/testing';

import { CrsgetterService } from './crsgetter.service';

describe('CrsgetterService', () => {
  let service: CrsgetterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrsgetterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
