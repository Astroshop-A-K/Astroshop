import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';

export const adminAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthenticationService);
  if(authService.isAdminAuthenticated() && authService.isAuthenticated){
    return true;
  }else{
    router.navigate(['/home']);
    return false;
  }
};
