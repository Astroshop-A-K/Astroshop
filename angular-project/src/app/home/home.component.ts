import { Component, Inject, NgModule, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { FavoriteProductsService } from '../favorite-products/favorite-products.service';
import { ProductsDTO } from '../shopping-cart/cart.service';
import { AuthenticationService, UserDTO } from '../api-authorization/authentication.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [RouterLink, NgClass, NgIf, NgFor, StarRatingComponent]
})

export class HomeComponent implements OnInit {
  public productData: HomeProductsDTO[] = [];
  favoriteProductsData: ProductsDTO[] = [];
  authService = inject(AuthenticationService);
  user: UserDTO;

  isLoading: boolean = true;

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private FProductsService: FavoriteProductsService) {}

  getData() {
    this.http.get<HomeProductsDTO[]>(this.baseUrl + 'products').subscribe(result => {
      this.productData = result;
      this.isLoading = false;
    }, error => console.error(error));
  }

  ngOnInit(): void {
    this.getData();
    if(this.authService.authenticated()){
      this.authService.getCurrentUser().subscribe(result =>{
          this.user = result;
          this.FProductsService.getFavoriteProducts(this.user.id).subscribe(result => {
            this.favoriteProductsData = result;
            this.FProductsService.countNum.set(this.favoriteProductsData.length);
          });
      })
    }
  }
}
interface HomeProductsDTO {
  productId: number;
  productName: string;
  productDescription: string;
  price: number;
  productCategory: string;
  productImage0: string;
  productImage1: string;
  productImage2: string;
  quantity: number;
  averageStarRating: number;
  reviewsCount: number;
  productDiscount: number;
}
