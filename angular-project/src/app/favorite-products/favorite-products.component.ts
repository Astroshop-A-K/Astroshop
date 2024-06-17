import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { AuthenticationService, UserDTO } from '../api-authorization/authentication.service';
import { NgFor, NgForOf } from '@angular/common';
import { ProductsDTO } from '../shopping-cart/cart.service';
import { RouterLink } from '@angular/router';
import { FavoriteProductsService } from './favorite-products.service';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-favorite-products',
  standalone: true,
  imports: [NgFor, NgForOf, RouterLink, PaginationComponent],
  templateUrl: './favorite-products.component.html',
  styleUrl: './favorite-products.component.css'
})
export class FavoriteProductsComponent implements OnInit {
  favoriteProductsData: ProductsDTO[] = [];
  paginatedFavoriteProducts: ProductsDTO[] = [];
  authService = inject(AuthenticationService);
  user: UserDTO;

  currentPage: number = 1;
  totalItems: number = 0;
  limit: number = 3;

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private FProductsService: FavoriteProductsService){}

  onPageChange(page: number){
    this.currentPage = page;
    this.updateCurrentProducts();
  }
  updateCurrentProducts(){
    const startIndex = (this.currentPage - 1) * this.limit;
    const endIndex = startIndex + this.limit;
    this.paginatedFavoriteProducts = this.favoriteProductsData.slice(startIndex, endIndex);
  }
  
  ngOnInit(): void {
    if(this.authService.authenticated()){
      this.authService.getCurrentUser().subscribe(result =>{
          this.user = result;
          this.FProductsService.getFavoriteProducts(this.user.id).subscribe(result => {
            this.favoriteProductsData = result;
            this.paginatedFavoriteProducts = this.favoriteProductsData;
            this.totalItems = this.paginatedFavoriteProducts.length;
            this.updateCurrentProducts();
          });
      })
    }
  }
}
export interface FavoriteProductDTO{
  userId: string;
  productId: number;
}