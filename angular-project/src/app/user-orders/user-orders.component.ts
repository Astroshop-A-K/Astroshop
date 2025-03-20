import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { CommonModule, NgClass, NgFor, NgForOf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PaginationComponent } from '../pagination/pagination.component';
import { Chart } from 'chart.js/auto';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-orders',
  standalone: true,
  imports: [RouterLink, PaginationComponent, CommonModule, FormsModule],
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

  searchText: string = '';
  totalRevenue: number = 0;

  orders_chartInstance: any;
  orders_ctx: any;
  @ViewChild('ordersDate') ordersDate!: { nativeElement: any };

  pie_chartInstance: any;
  pie_ctx: any;
  @ViewChild('ordersStatusChart') ordersStatusChart!: { nativeElement: any };

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string){}

  onPageChange(page: number){
    this.currentPage = page;
    this.updateCurrentOrders();
  }

  updateCurrentOrders(){
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
    this.updateCurrentOrders();
  }

  searchOrders() {
    const search = this.searchText.trim().toLowerCase();

    if (!search) {
      this.applyFilters();
      return;
    } else {
      const filtered = this.allOrdersData.filter(order =>
        order.orderId.toString().includes(search) || 
        order.name.toLowerCase().includes(search) ||
        order.surname.toLowerCase().includes(search) ||
        order.email.toLowerCase().includes(search) 
      );

      this.ordersData = filtered;
      this.totalItems = filtered.length;
      this.currentPage = 1;
      this.updateCurrentOrders();
    }
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

  createChart(chart: 'status' | 'orders'): void {
    if(chart === 'status'){
      this.pie_chartInstance = this.ordersStatusChart.nativeElement;
      this.pie_ctx = this.pie_chartInstance.getContext('2d');
  
      const delivered = this.ordersData.filter(o => o.orderStatus === 'Doručené').length;
      const preparing = this.ordersData.filter(o => o.orderStatus === 'Pripravuje sa').length;
      const pending = this.ordersData.filter(o => o.orderStatus === 'Čakajúce').length;
  
      this.pie_chartInstance = new Chart(this.pie_ctx, {
        type: 'doughnut',
        data: {
          labels: ['Doručené', 'Pripravuje sa', 'Čakajúce'],
          datasets: [
            {
              label: 'Koláčový graf',
              data: [delivered, preparing, pending],
              backgroundColor: ['#00a200', '#ffd900', '#ff2d2d'],
            }
          ]
        }
      });
    }else if(chart === 'orders'){
      this.orders_chartInstance = this.ordersDate.nativeElement;
      this.orders_ctx = this.orders_chartInstance.getContext('2d');
      const ordersByDate = this.groupOrdersByDate(this.allOrdersData);

      const dates = Object.keys(ordersByDate);
      const orderCounts = Object.values(ordersByDate);

      console.log(dates, orderCounts)

      this.orders_chartInstance = new Chart(this.orders_ctx, {
        type: 'bar',
        data: {
          labels: dates,
          datasets: [{
            label: 'Počet objednávok',
            data: orderCounts, 
            backgroundColor: '#42A5F5',
            borderColor: '#1E88E5',
            borderWidth: 1
          }]
        },
      })
    }
  }

  groupOrdersByDate(orders: OrdersDTO[]) {
    return orders.reduce((acc, order) => {
      const [datePart] = order.orderDate.split(' ');
      const [day, month, year] = datePart.split('.').map(Number);
      const formattedDate = `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;

      if(!acc[formattedDate]){
        acc[formattedDate] = 0;
      }
      acc[formattedDate] += 1;

      return acc;
    }, {});
  }

  getOrders(){
    this.http.get<OrdersDTO[]>(this.baseUrl + 'orders').subscribe(result => {
      this.allOrdersData = result;
      this.isLoading = false;
      this.applyFilters();

      this.totalRevenue = parseFloat(
        (this.allOrdersData.reduce((total, order) => total + (order.totalPrice) || 0, 0)).toFixed(2)
      )

      setTimeout(() => {
        this.createChart('status');
        this.createChart('orders');
      }, 0);
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
