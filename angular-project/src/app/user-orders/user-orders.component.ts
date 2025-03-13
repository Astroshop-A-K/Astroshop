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
  allOrdersData: OrdersDTO[] = [];
  filteredOrdersData: OrdersDTO[] = [];

  selectedStatuses: string[] = [];
  orderStatuses: string[] = [
    'Čakajúce',
    'Pripravuje sa',
    'Doručené'
  ];

  isLoading: boolean = true;

  currentPage: number = 1;
  totalItems: number = 0;
  limit: number = 6;

  dateSortOrder: string = '';
  isVisibleDateFilter: boolean = false;
  isVisibleCheckbox: boolean = false;

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

  toggleDropdown(dropdown: 'status' | 'date'){
    if(dropdown === 'status'){
      this.isVisibleCheckbox = !this.isVisibleCheckbox;
    }else{
      this.isVisibleDateFilter = !this.isVisibleDateFilter;
    }
  }

  sortByDate(order: 'newest' | 'oldest'): void {
    this.dateSortOrder = order;
    this.applyFilters();
  }

  parseDate(dateString: string): Date {
    const[datePart, timePart] = dateString.split(' ');
    const[day, month, year] = datePart.split('.').map(Number);
    const [hours, minutes, seconds = 0] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes, seconds);
  }

  applyFilters(): void {
    let filtered = [...this.allOrdersData];

    if(this.selectedStatuses.length > 0){
      filtered = filtered.filter(order => this.selectedStatuses.includes(order.orderStatus));
    }

    if(this.dateSortOrder){
      filtered = filtered.sort((a, b) => {
        const dateA = this.parseDate(a.orderDate).getTime();
        const dateB = this.parseDate(b.orderDate).getTime();
        return this.dateSortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });
    }

    this.ordersData = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 1;
    this.updateCurrentProducts();
  }

  onCheckboxChange(event: Event){
    const checkBox = event.target as HTMLInputElement;
    const value = checkBox.value;

    if(checkBox.checked){
      this.selectedStatuses.push(value);
    }else{
      this.selectedStatuses = this.selectedStatuses.filter(status => status !== value);
    }

    this.applyFilters();
  }

  getOrders(){
    this.http.get<OrdersDTO[]>(this.baseUrl + 'orders').subscribe(result => {
      this.allOrdersData = result;
      this.isLoading = false;
      this.applyFilters();
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
