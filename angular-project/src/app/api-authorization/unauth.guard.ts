import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';

export const unauthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);
  
  if (!authService.isAuthenticated()) {
    return true; 
  } else {
    router.navigate(['/home']); 
    return false; 
  }
};
