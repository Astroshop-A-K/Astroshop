import { Component, OnDestroy, OnInit } from '@angular/core';
import { OrderService } from '../order-page/order.service';
import { NgFor } from '@angular/common';
import { ProductsDTO } from '../products/products.component';
import { CartService } from '../shopping-cart/cart.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [NgFor, ReactiveFormsModule, RouterLink],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.css'
})
export class OrderSummaryComponent implements OnInit, OnDestroy{
  order: any[];
  selectedProducts: ProductsDTO[];
  totalPrice = this.CartService.totalPrice();

  constructor(private OrderService: OrderService, public CartService: CartService){}

  paymentForm = new FormGroup({
    paymentMethod: new FormControl('', Validators.required),
  });

  onRadioChange(event: any){
    this.paymentForm.get('paymentMethod')?.setValue(event.target.value);
  }

  onSubmit(){
    if(this.paymentForm.valid){
      
    }
  }

  ngOnInit(): void {
    this.order = this.OrderService.order;
    this.selectedProducts = this.CartService.products;
  }
  ngOnDestroy(): void{
    this.order = [];
    this.OrderService.order = [];
  }
}
