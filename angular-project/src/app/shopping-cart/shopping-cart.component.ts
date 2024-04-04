import { Component } from '@angular/core';
import { CartService } from './cart.service';
import { NgFor } from '@angular/common';
import { ProductsDTO } from '../products/products.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.css'],
  standalone: true,
  imports: [NgFor, RouterLink]
})
export class ShoppingCartComponent {
  products = this.CartService.getProducts();

  constructor(public CartService: CartService){}

  clearCart(){
    this.products = [];
    this.CartService.products = [];
    this.CartService.countNum.update(value => 0);
  }
}
