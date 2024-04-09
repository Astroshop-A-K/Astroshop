import { Component, OnInit } from '@angular/core';
import { OrderService } from '../order-page/order.service';
import { NgFor } from '@angular/common';
import { ProductsDTO } from '../products/products.component';
import { CartService } from '../shopping-cart/cart.service';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [NgFor],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.css'
})
export class OrderSummaryComponent implements OnInit{
  order: any[];
  selectedProducts: ProductsDTO[];

  constructor(private OrderService: OrderService, private CartService: CartService){}

  ngOnInit(): void {
    this.order = this.OrderService.order;
    this.selectedProducts = this.CartService.products;
  }
}
