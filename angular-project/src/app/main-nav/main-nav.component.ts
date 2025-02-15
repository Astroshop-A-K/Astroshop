import { ChangeDetectorRef, Component, HostListener, OnInit, inject, signal, Inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';
import { AuthenticationService, RoleDTO, UserDTO } from '../api-authorization/authentication.service';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatBadgeModule} from '@angular/material/badge';
import { CartService, ProductsDTO } from '../shopping-cart/cart.service';
import { FavoriteProductsService } from '../favorite-products/favorite-products.service';

@Component({
  selector: 'app-main-nav',
  standalone: true,
  imports: [RouterLink, MatToolbar, MatButton, NgIf, NgClass, MatBadgeModule, MatIconModule, CommonModule, RouterLinkActive],
  templateUrl: './main-nav.component.html',
  styleUrl: './main-nav.component.css'
})
export class MainNavComponent implements OnInit {
  countNum = this.CartService.countNum;
  fav_countNum = this.FProductsService.countNum;

  favoriteProducts: ProductsDTO[] = [];
  products: ProductsDTO[] = [];

  user: UserDTO;
  role: RoleDTO;
  roleName: string = '';

  isActive: boolean = false;
  isActive_category: boolean = false;i
  isNavFixed: boolean = false;

  constructor(private CartService: CartService, private FProductsService: FavoriteProductsService, private router: Router, public authService: AuthenticationService){
    this.products = this.CartService.getProducts();
  }

  isCurrentRoute(...routes: string[]): boolean {
    const currentRoute = this.router.url;
    return routes.some(route => currentRoute.startsWith(route)); //metoda v JS ktora ci aspon jeden prvok v array splna podmienku (true/false);
  }

  toggleSideBar(type: 'main' | 'category'){
    if(type === 'main'){
      this.isActive = !this.isActive;
      if(this.isActive){
        this.isActive_category = false;
      }
    }else{
      this.isActive_category = !this.isActive_category;
      if(this.isActive_category){
        this.isActive = false;
      }
    }
  }

  onFilter(category: string){
    if(category){
      this.router.navigate(['/products'], {queryParams: { category }});
      this.isActive_category = false;
    }else{
      this.router.navigate(['/products']);
    }
  }

  @HostListener('window:scroll', []) //zatvorka [] empty array na dalsie argumenty
  onWindowScroll(){ //tato metoda sa aktivuje vzdy ked sa scrolluje preto je hostlistener hned nad nou
    const offset = window.pageYOffset;
    const windowWidth = window.innerWidth;
    let sidebar = document.getElementsByClassName('sidebar')[0] as HTMLElement;
    let categoriesSidebar = document.getElementsByClassName('categories-sidebar')[0] as HTMLElement;

    if(offset > 30){
      this.isNavFixed = true;
      sidebar.style.marginTop = '0px';
      categoriesSidebar.style.marginTop = '0px'
    }
    else{
      this.isNavFixed = false;
      sidebar.style.marginTop = '97px';
      if(windowWidth > 850){
        categoriesSidebar.style.marginTop = '72.5px';
      }else{
        categoriesSidebar.style.marginTop = '97px';
      }
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
   this.router.events.subscribe(event => { //zapne sa vzdy ked sa udeje novy event ktory je emitovany Observable
    if(event instanceof NavigationEnd){ //navigacia prebehla uspesne
      this.isActive = false;
    }
   })
 } 
}

