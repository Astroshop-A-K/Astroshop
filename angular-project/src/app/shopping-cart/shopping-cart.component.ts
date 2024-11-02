import { Component, EmbeddedViewRef, signal } from '@angular/core';
import { CartService } from './cart.service';
import { CommonModule, NgFor } from '@angular/common';
import { ProductsDTO } from './cart.service';
import { RouterLink } from '@angular/router';
import { NgModel } from '@angular/forms';
import { MainNavComponent } from '../main-nav/main-nav.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.css'],
  standalone: true,
  imports: [NgFor, RouterLink, CommonModule],
})
export class ShoppingCartComponent {
  products = this.CartService.getProducts();

  constructor(public CartService: CartService, private snackBar: MatSnackBar){}

  increase(product: ProductsDTO){
    if(product.amount !== product.quantity){
      let defAmount = product.amount;
      product.amount++;
      this.CartService.updateAmount(product.amount - defAmount);
    }else{
      this.snackBar.open("You've added all the products!", "", { duration: 1500, });
    }
  }
  decrease(product: ProductsDTO){
      if(product.amount > 1){
        let defAmount = product.amount;
        product.amount--;
        this.CartService.updateAmount(product.amount - defAmount);
      }else{
        this.CartService.removeProduct(product);
        this.snackBar.open("Removed the product!", "", { duration: 1500, });
      }
  }

  clearCart(){
    if(this.products.length > 0){
      this.products = [];
      this.CartService.clearCart();
      this.snackBar.open("Cleared the cart!", "", { duration: 1500, });
    }else{
      this.snackBar.open("The cart is already empty!", "", { duration: 1500, })
    }
  }
}
