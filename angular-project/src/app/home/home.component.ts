import { Component, Inject, NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { NgClass, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [RouterLink, NgClass, NgIf, NgFor]
})

export class HomeComponent {
  public productData: HomeProductsDTO[] = [];

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private router: Router ) {
    this.getData();
  }

  getData() {
    this.http.get<HomeProductsDTO[]>(this.baseUrl + 'products').subscribe(result => {
      this.productData = result;
    }, error => console.error(error));
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
}
