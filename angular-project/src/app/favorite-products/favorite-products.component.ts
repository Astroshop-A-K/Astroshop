import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthenticationService, UserDTO } from '../api-authorization/authentication.service';
import { NgFor, NgForOf } from '@angular/common';
import { ProductsDTO } from '../shopping-cart/cart.service';
import { RouterLink } from '@angular/router';
import { FavoriteProductsService } from './favorite-products.service';

@Component({
  selector: 'app-favorite-products',
  standalone: true,
  imports: [NgFor, NgForOf, RouterLink],
  templateUrl: './favorite-products.component.html',
  styleUrl: './favorite-products.component.css'
})
export class FavoriteProductsComponent implements OnInit {
  favoriteProductsData: ProductsDTO[] = [];
  authService = inject(AuthenticationService);
  user: UserDTO;

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private FProductsService: FavoriteProductsService){}

  ngOnInit(): void {
    if(this.authService.authenticated()){
      this.authService.getCurrentUser().subscribe(result =>{
          this.user = result;
          this.FProductsService.getFavoriteProducts(this.user.id).subscribe(result => {
            this.favoriteProductsData = result;
          });
      })
    }
  }
}
export interface FavoriteProductDTO{
  userId: string;
  productId: number;
}