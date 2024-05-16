import { Component, EmbeddedViewRef, signal } from '@angular/core';
import { CartService } from './cart.service';
import { NgFor } from '@angular/common';
import { ProductsDTO } from './cart.service';
import { RouterLink } from '@angular/router';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.css'],
  standalone: true,
  imports: [NgFor, RouterLink],
})
export class ShoppingCartComponent {
  products = this.CartService.getProducts();

  constructor(public CartService: CartService){}

  assignAmount(product: ProductsDTO, event: any){
    let amount = product.amount;
    let newAmount = event.target.value;
    product.amount = newAmount;
    this.CartService.updateAmount(newAmount - amount);

    if(newAmount == 0){
      this.CartService.removeProduct(product);
    }
  }

  clearCart(){
    this.products = [];
    this.CartService.products = [];
    this.CartService.countNum.update(value => 0);
  }
}
