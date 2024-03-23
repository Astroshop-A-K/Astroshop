import { Component } from '@angular/core';
import { CartService } from './cart.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.css'],
  standalone: true,
  imports: [NgFor]
})
export class ShoppingCartComponent {
  products = this.CartService.getProducts();

  constructor(private CartService: CartService){}
}
