import { Injectable, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  public products: ProductsDTO[] = [];
  countNum = signal(0);
  amount: number = 0;

  constructor(private snackBar: MatSnackBar) { }

  addToCart(product: ProductsDTO){
    const alreadySelectedProduct = this.products.find(p => p.productName === product.productName);
    if(alreadySelectedProduct){
      if(alreadySelectedProduct.amount != alreadySelectedProduct.quantity){
        alreadySelectedProduct.amount++;
        this.countNum.update(value => value + 1);
        this.snackBar.open("Produkt bol úspešne pridaný do košíka!", "", { duration: 1500, }); 
      }
      else{
        this.snackBar.open("Pridali ste do košíka všetky dostupné produkty!", "", { duration: 1500, }); 
      }
    }
    else{
      product.amount = 1;
      this.products.push(product);
      this.countNum.update(value => value + 1);
      this.snackBar.open("Produkt bol úspešne pridaný do košíka!", "", { duration: 1500, }); 
    }
  }

  updateAmount(amount: number){
    this.countNum.update(value => value + amount);
  }

  getProducts(){
    return this.products;
  }

  totalPrice(){
    let totalPrice = 0;
    for (const product of this.products) {
      totalPrice += product.productDiscount > 0 ? ((product.price - ((product.price / 100)) * product.productDiscount)) * product.amount : product.price * product.amount;
    }
    return parseFloat(totalPrice.toFixed(2));
  }

  removeProduct(product: ProductsDTO){
    const index = this.products.indexOf(product);
    if(index !== -1){
      this.countNum.update(value => value - product.amount);
      this.products.splice(index, 1);
      this.snackBar.open("Produkt bol z košíka odstránený!", "", { duration: 1500, });
    }
  }

  clearCart(){
    this.products.length = 0;
    this.countNum.update(value => 0);
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
  productDiscount: number;
}
