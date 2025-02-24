import { CanDeactivateFn, Router } from '@angular/router';

export const unauthGuard: CanDeactivateFn<any> = () => {
  return new Promise<boolean>((resolve) => {
    const timeout = setTimeout(() => {
      resolve(true);
    }, 5000);

    const confirmLeave = confirm('Prebieha overovanie, naozaj chcete opustiť stránku?');
    if(confirmLeave){
      clearTimeout(timeout);
      resolve(true);
    }else{
      resolve(false);
    }
  })
};