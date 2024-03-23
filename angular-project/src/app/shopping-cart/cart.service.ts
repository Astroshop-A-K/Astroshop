import { Injectable } from '@angular/core';
import { ProductsDTO } from '../products/products.component';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  public products: ProductsDTO[] = [];
  private counterSubject = new Subject<number>();

  constructor() { }

  addToCart(product: ProductsDTO){
    this.products.push(product);
    this.counterSubject.next(this.products.length);
  }

  getProducts(){
    return this.products;
  }

  clearCart(){
    this.products = [];
    return this.products;
  }
}
