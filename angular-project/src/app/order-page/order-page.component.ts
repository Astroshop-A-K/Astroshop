import { Component } from '@angular/core';
import { CartService } from '../shopping-cart/cart.service';

@Component({
  selector: 'app-order-page',
  standalone: true,
  imports: [],
  templateUrl: './order-page.component.html',
  styleUrl: './order-page.component.css'
})
export class OrderPageComponent {
  totalPrice = this.CartService.totalPrice();
  products = this.CartService.getProducts();

  constructor(private CartService: CartService){}
}
