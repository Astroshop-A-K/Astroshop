import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthenticationService, UserDTO } from '../api-authorization/authentication.service';
import { NgFor, NgForOf } from '@angular/common';
import { ProductsDTO } from '../shopping-cart/cart.service';

@Component({
  selector: 'app-favorite-products',
  standalone: true,
  imports: [NgFor, NgForOf],
  templateUrl: './favorite-products.component.html',
  styleUrl: './favorite-products.component.css'
})
export class FavoriteProductsComponent implements OnInit {
  favoriteProductsData: ProductsDTO[] = [];
  authService = inject(AuthenticationService);
  user: UserDTO;

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string){}

  getFavoriteProducts(userId: string): Observable<ProductsDTO[]>{
    let queryParams = new HttpParams();
    queryParams = queryParams.append("userId", userId);
    return this.http.get<ProductsDTO[]>(this.baseUrl + 'products/getFavoriteProducts', { params: queryParams });
  }

  ngOnInit(): void {
    if(this.authService.authenticated()){
      this.authService.getCurrentUser().subscribe(result =>{
          this.user = result;
          this.getFavoriteProducts(this.user.id).subscribe(result => {
            this.favoriteProductsData = result;
          });
      })
  }
  }
}