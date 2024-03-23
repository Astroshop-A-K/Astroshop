import { Injectable } from '@angular/core';
import { ProductsDTO } from '../products/products.component';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  public products: ProductsDTO[] = [];

  constructor() { }

  addToCart(product: ProductsDTO){
    this.products.push(product);
  }

  getProducts(){
    return this.products;
  }

  clearCart(){
    this.products = [];
    return this.products;
  }
}
