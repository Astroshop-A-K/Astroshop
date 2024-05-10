import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  public products: ProductsDTO[] = [];
  countNum = signal(0);
  amount: number = 0;

  constructor() { }

  addToCart(product: ProductsDTO){
    const alreadySelectedProduct = this.products.find(p => p.productId === product.productId);
    if(alreadySelectedProduct){
      product.amount++;
      this.countNum.update(value => value + 1);
    }
    else{
      product.amount = 1;
      this.products.push(product);
      this.countNum.update(value => value + 1);
    }
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
export interface ProductsDTO {
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
  amount: number;
}
