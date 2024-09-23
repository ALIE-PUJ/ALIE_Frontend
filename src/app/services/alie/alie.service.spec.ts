import { TestBed } from '@angular/core/testing';

import { AlieService } from './alie.service';

describe('AlieService', () => {
  let service: AlieService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlieService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
