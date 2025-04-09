import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PaginationComponent } from '../pagination/pagination.component';
import { Chart } from 'chart.js/auto';
import { FormsModule } from '@angular/forms';
import { ProblemsDTO } from '../contact-page/contact-page.component';
import { MatSnackBar } from '@angular/material/snack-bar';

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

  problemsCurrentPage: number = 1;
  problemsTotalItems: number = 0;
  problemsLimit: number = 6;

  dateSortOrder: string = '';
  isVisibleDateFilter: boolean = false;
  isVisibleCheckbox: boolean = false;

  searchText: string = '';
  searchOption: string = 'auto';
  totalRevenue: number = 0;

  revenue_chartInstance: any;
  revenue_ctx: any;
  @ViewChild('revenueChart') revenueChart!: { nativeElement: any };

  orders_chartInstance: any;
  orders_ctx: any;
  @ViewChild('ordersDate') ordersDate!: { nativeElement: any };

  pie_chartInstance: any;
  pie_ctx: any;
  @ViewChild('ordersStatusChart') ordersStatusChart!: { nativeElement: any };

  problemsData: ProblemsDTO[] = [];
  filteredProblemsData: ProblemsDTO[] = [];

  loadingStatusId: Set<number> = new Set();

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private snackBar: MatSnackBar){}

  onPageChange(page: number, dataType: 'orders' | 'messages'){
    if(dataType === 'orders') {
      this.currentPage = page;
      this.updateCurrentData('orders');
    }else if(dataType === 'messages'){
      this.problemsCurrentPage = page;
      this.updateCurrentData('messages');
    }
  }

  updateCurrentData(dataType: 'orders' | 'messages'){
    if(dataType === 'orders') {
      const startIndex = (this.currentPage - 1) * this.limit;
      const endIndex = startIndex + this.limit;
      this.filteredOrdersData = this.ordersData.slice(startIndex, endIndex);
    }else if(dataType === 'messages'){
      const startIndex = (this.problemsCurrentPage - 1) * this.problemsLimit;
      const endIndex = startIndex + this.problemsLimit;
      this.filteredProblemsData = this.problemsData.slice(startIndex, endIndex);
    }
  };

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
        const dateA = this.parseDate(a.orderDate).getTime(); //vrati pocet ms 
        const dateB = this.parseDate(b.orderDate).getTime();
        return this.dateSortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });
    }

    this.ordersData = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 1;
    this.updateCurrentData('orders');
  }

  searchOrders() {
    if(!this.searchText){
      this.applyFilters();
      return;
    }

    let filtered = this.allOrdersData.filter(order => {
      switch(this.searchOption){
        case 'orderId':
          return order.orderId.toString().startsWith(this.searchText)
        case 'email':
          return  order.email.toLowerCase().includes(this.searchText.toLowerCase())
        case 'note':
          return order.orderNote.toLowerCase().includes(this.searchText.toLowerCase())
        case 'auto':
          return (
            order.orderId.toString().startsWith(this.searchText) ||
            order.email.toLowerCase().includes(this.searchText.toLowerCase()) ||
            order.orderNote.toLowerCase().includes(this.searchText.toLowerCase())
          )
        default:
          return false
      }
    })
    this.applyFilters();  
    this.allOrdersData = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 1;
    this.updateCurrentData('orders');  
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

  createChart(chart: 'status' | 'orders' | 'revenue'): void {
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
              label: 'Počet objednávok',
              data: [delivered, preparing, pending],
              backgroundColor: ['#00a200', '#ffd900', '#ff2d2d'],
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }else if(chart === 'orders'){
      this.orders_chartInstance = this.ordersDate.nativeElement;
      this.orders_ctx = this.orders_chartInstance.getContext('2d');
      const ordersByDate = this.groupOrdersByDate(this.allOrdersData);

      const dates = Object.keys(ordersByDate);
      const orderCounts = Object.values(ordersByDate);

      this.orders_chartInstance = new Chart(this.orders_ctx, {
        type: 'bar',
        data: {
          labels: dates,
          datasets: [{
            label: 'Počet objednávok',
            data: orderCounts, 
            backgroundColor: '#0d6efd',
            borderColor: '#1e88e5',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      })
    }else if(chart === 'revenue') {
      this.revenue_chartInstance= this.revenueChart.nativeElement;
      this.revenue_ctx = this.revenue_chartInstance.getContext('2d');
      const ordersRevenue = this.groupOrdersByDateRevenue(this.allOrdersData);

      const labels = Object.keys(ordersRevenue);
      const data = Object.values(ordersRevenue).map(o => o.totalRevenue);

      this.revenue_chartInstance = new Chart(this.revenue_ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Denná tržba (€)',
            data: data, 
            backgroundColor: '#0d6efd',
            borderColor: '#1e88e5',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
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
  groupOrdersByDateRevenue(orders: OrdersDTO[]): { [date: string]: { totalRevenue: number } } {
    return orders.reduce((acc, order) => {
      const [datePart] = order.orderDate.split(' ');
      const [day, month, year] = datePart.split('.').map(Number);
      const formattedDate = `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;

      if(!acc[formattedDate]){
        acc[formattedDate] = { totalRevenue: 0 };
      }
      acc[formattedDate].totalRevenue += parseFloat(order.totalPrice.toFixed(2));

      return acc;
    }, {} as { [date: string]: { totalRevenue: number } });
  }

  changeProblemStatus(problem: ProblemsDTO){
    this.loadingStatusId.add(problem.problemId)
    problem.problemStatus = problem.problemStatus === 'Nevyriešené' ? 'Vyriešené' : 'Nevyriešené';
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.put(this.baseUrl + 'contact/change-problem-status', { ProblemId: problem.problemId, ProblemStatus: problem.problemStatus }, { headers }).subscribe(() => {
      this.snackBar.open("Stav správy bol úspešne zmenený!", "", { duration: 1500 });
      this.loadingStatusId.delete(problem.problemId);
    });
  }
  isLoadingStatus(problemId: number): boolean {
    return this.loadingStatusId.has(problemId);
  }

  getOrders(){
    this.http.get<OrdersDTO[]>(this.baseUrl + 'orders/get-orders').subscribe(result => {
      this.allOrdersData = result;
      this.isLoading = false;
      this.applyFilters();

      this.totalRevenue = parseFloat(
        (this.allOrdersData.reduce((total, order) => total + (order.totalPrice) || 0, 0)).toFixed(2)
      )

      setTimeout(() => {
        this.createChart('status');
        this.createChart('orders');
        this.createChart('revenue');
      }, 0);
    }, error => console.error(error));
  }
  getProblems(){
    this.http.get<ProblemsDTO[]>(this.baseUrl + 'contact/get-problems').subscribe((result) => {
      this.problemsData = result;
      this.problemsTotalItems = this.problemsData.length;
      this.problemsCurrentPage = 1;
      this.updateCurrentData('messages');
    });
  }

  ngOnInit(): void {
    this.getOrders();
    this.getProblems();
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
