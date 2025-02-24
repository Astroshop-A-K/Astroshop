import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CanDeactivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { unauthGuard } from './unauth.guard';

describe('unauthGuard', () => {
  let executeGuard: CanDeactivateFn<any>;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({});

    executeGuard = (...guardParameters) =>
      TestBed.runInInjectionContext(() => unauthGuard(...guardParameters));

    route = {} as ActivatedRouteSnapshot;
    state = {} as RouterStateSnapshot;
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should return false if processing and confirm returns false', fakeAsync(() => {
    spyOn(window, 'confirm').and.returnValue(false);
    const result = executeGuard(null, route, state, null);
    expect(result).toBe(false);
    tick(5000);
  }));

  it('should return true if processing and confirm returns true', fakeAsync(() => {
    spyOn(window, 'confirm').and.returnValue(true);
    const result = executeGuard(null, route, state, null);
    expect(result).toBe(true);
    tick(5000);
  }));

  it('should return true if processing is finished', fakeAsync(() => {
    tick(5000);
    const result = executeGuard(null, route, state, null);
    expect(result).toBe(true);
  }));
});