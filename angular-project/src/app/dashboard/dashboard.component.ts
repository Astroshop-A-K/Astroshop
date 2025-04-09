import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthenticationService, UserDTO } from '../api-authorization/authentication.service';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthenticationService);
  user: UserDTO;

  isLoading: boolean = true;

  activeTab: string = 'info';

  constructor(private router: Router, private snackBar: MatSnackBar){}

  selectTab(tab: string){
    this.activeTab = tab;
  }
  
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']).then(() => {
      this.snackBar.open("Boli ste úspešne odhlásený!", "", { duration: 1500 });
    });
  }

  ngOnInit(): void {
    if(this.authService.authenticated()){
      this.authService.getCurrentUser().subscribe(result =>{
          this.user = result;
          this.isLoading = false;
      })
   }
  }
}