import { ChangeDetectorRef, Component, HostListener, OnInit, inject, signal, Inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';
import { AuthenticationService, RoleDTO, UserDTO } from '../api-authorization/authentication.service';
import { NgClass, NgIf } from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatBadgeModule} from '@angular/material/badge';
import { CartService, ProductsDTO } from '../shopping-cart/cart.service';
import { LoginComponent } from '../api-authorization/login/login.component';
import { HomeComponent } from '../home/home.component';
import { ProductsDetailComponent } from '../products-detail/products-detail.component';
import { FavoriteProductsService } from '../favorite-products/favorite-products.service';

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
    MatIconModule,
    HomeComponent,
  ],
  templateUrl: './main-nav.component.html',
  styleUrl: './main-nav.component.css'
})
export class MainNavComponent implements OnInit {
  navbarfixed: boolean = false;
  authService = inject(AuthenticationService);
  private router = inject(Router)
  countNum = this.CartService.countNum;
  fav_countNum = this.FProductsService.countNum;
  favoriteProducts: ProductsDTO[] = [];

  user: UserDTO;
  role: RoleDTO;
  roleName: string = '';

  constructor(private CartService: CartService, private router_nav: Router, private FProductsService: FavoriteProductsService){}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.FProductsService.countNum.set(0);
  }

  isCurrentRoute(route: string): boolean {
    return this.router.url === route;
  }

  toFavoriteProducts(){
    if(this.authService.authenticated()){
      this.router_nav.navigate(['/favorite-products']);
    }
    else{
      this.router_nav.navigate(['/login']);
    }
  }

  ngOnInit(): void {
    if(this.authService.authenticated()){
      this.authService.getCurrentUser().subscribe(result =>{
          this.user = result;
          this.FProductsService.getFavoriteProducts(this.user.id).subscribe(result => {
            this.favoriteProducts = result;
            this.fav_countNum.set(this.favoriteProducts.length);
          })
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

