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

  getCounter(){
    return this.products.length;
  }

  totalPrice(){
    let totalPrice = 0;
    for (const product of this.products) {
      totalPrice += product.price;
    }
    return totalPrice;
  }
}
