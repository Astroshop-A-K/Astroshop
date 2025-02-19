import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Inject } from '@angular/core';
import { NgClass, NgFor, NgForOf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-user-orders',
  standalone: true,
  imports: [NgFor, NgForOf, RouterLink, NgClass, PaginationComponent],
  templateUrl: './user-orders.component.html',
  styleUrl: './user-orders.component.css'
})
export class UserOrdersComponent implements OnInit {
  ordersData: OrdersDTO[] = [];
  filteredOrdersData: OrdersDTO[] = [];

  isLoading: boolean = true;

  currentPage: number = 1;
  totalItems: number = 0;
  limit: number = 10;

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string){}

  onPageChange(page: number){
    this.currentPage = page;
    this.updateCurrentProducts();
  }
  updateCurrentProducts(){
    const startIndex = (this.currentPage - 1) * this.limit;
    const endIndex = startIndex + this.limit;
    this.filteredOrdersData = this.ordersData.slice(startIndex, endIndex);
  }

  getOrders(){
    this.http.get<OrdersDTO[]>(this.baseUrl + 'orders').subscribe(result => {
      this.ordersData = result;
      this.isLoading = false;
      this.totalItems = this.ordersData.length;
      this.updateCurrentProducts();
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
  psc: number;
  city: string;
  country: string;
  deliveryOption: string;
  payment: string;
  totalPrice: number;
  orderVerificationKey: string;
  orderDate: string;
  orderStatus: string;
  orderNote: string;
}
