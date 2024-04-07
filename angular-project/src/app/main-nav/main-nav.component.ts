import { ChangeDetectorRef, Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';
import { AuthenticationService } from '../api-authorization/authentication.service';
import { NgClass, NgIf } from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatBadgeModule} from '@angular/material/badge';
import { CartService } from '../shopping-cart/cart.service';

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
export class MainNavComponent {
  navbarfixed: boolean = false;
  authService = inject(AuthenticationService);
  private router = inject(Router)
  countNum = this.CartService.countNum;

  constructor(private CartService: CartService){}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  @HostListener('window:scroll', ['$event']) onscroll() {
    if (window.scrollY > 50) {
      this.navbarfixed = true;
    }
    else {
      this.navbarfixed = false;
    }
  }
}

