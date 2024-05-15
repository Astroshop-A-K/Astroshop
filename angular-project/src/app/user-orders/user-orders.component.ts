import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Inject } from '@angular/core';
import { NgFor, NgForOf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-orders',
  standalone: true,
  imports: [NgFor, NgForOf, RouterLink],
  templateUrl: './user-orders.component.html',
  styleUrl: './user-orders.component.css'
})
export class UserOrdersComponent implements OnInit {
  public ordersData: OrdersDTO[];

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string){}

  getOrders(){
    this.http.get<OrdersDTO[]>(this.baseUrl + 'orders').subscribe(result => {
      this.ordersData = result;
    }, error => console.error(error));
  } 

  ngOnInit(): void {
    this.getOrders();
  }
}
export interface OrdersDTO{
  orderId: number;
  name: string;
  surname: string;
  email: string;
  phoneNumber: number;
  address: string;
  postalCode: number;
  city: string;
  country: string;
  deliveryOption: string;
  payment: string;
  totalPrice: number;
  orderVerificationKey: string;
}
