import { Injectable, signal } from '@angular/core';
import { ProductsDTO } from '../products/products.component';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  public products: ProductsDTO[] = [];
  countNum = signal(0);

  constructor() { }

  addToCart(product: ProductsDTO){
    this.products.push(product);
    this.countNum.update(value => value + 1);
  }

  getProducts(){
    return this.products;
  }

  totalPrice(){
    let totalPrice = 0;
    for (const product of this.products) {
      totalPrice += product.price;
    }
    return totalPrice;
  }

  removeProduct(product: ProductsDTO){
    const index = this.products.indexOf(product);
    if(index !== -1){
      this.products.splice(index, 1);
      this.countNum.update(value => value + -1);
    }
  }
}
