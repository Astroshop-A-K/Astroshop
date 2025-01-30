import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { AuthenticationService, RoleDTO, UserDTO } from '../api-authorization/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthenticationService);
  user: UserDTO;
  role: RoleDTO;
  roleName: string = '';

  isLoading: boolean = true;

  activeTab: string = 'info';

  constructor(private router: Router){}

  selectTab(tab: string){
    this.activeTab = tab;
  }
  
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {
    if(this.authService.authenticated()){
      this.authService.getCurrentUser().subscribe(result =>{
          this.user = result;
          this.authService.getRole(this.user.id).subscribe(result => {
              this.role = result;
              this.isLoading = false;
              if(this.role != null){
                  this.roleName = this.role.name;
              }
          });
      })
   }
  }
}