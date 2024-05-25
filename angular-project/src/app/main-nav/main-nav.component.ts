import { ChangeDetectorRef, Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';
import { AuthenticationService, RoleDTO, UserDTO } from '../api-authorization/authentication.service';
import { NgClass, NgIf } from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatBadgeModule} from '@angular/material/badge';
import { CartService } from '../shopping-cart/cart.service';
import { LoginComponent } from '../api-authorization/login/login.component';

@Component({
  selector: 'app-main-nav',
  standalone: true,
  imports: [
    RouterLink,
    MatToolbar,
    MatButton,
    NgIf,
    NgClass,
    MatBadgeModule,
    MatIconModule
  ],
  templateUrl: './main-nav.component.html',
  styleUrl: './main-nav.component.css'
})
export class MainNavComponent implements OnInit {
  navbarfixed: boolean = false;
  authService = inject(AuthenticationService);
  private router = inject(Router)
  countNum = this.CartService.countNum;

  user: UserDTO;
  role: RoleDTO;
  roleName: string = '';

  constructor(private CartService: CartService){}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  @HostListener('window:scroll', ['$event']) onscroll() {
    if (window.scrollY > 1) {
      this.navbarfixed = true;
    }
    else {
      this.navbarfixed = false;
    }
  }
  isCurrentRoute(route: string): boolean {
    return this.router.url === route;
  }

  ngOnInit(): void {
    if(this.authService.authenticated()){
      this.authService.getCurrentUser().subscribe(result =>{
          this.user = result;
          this.authService.getRole(this.user.id).subscribe(result => {
              this.role = result;
              if(this.role != null){
                  this.roleName = this.role.name;
              }
          })
      })
   }
 } 
}

