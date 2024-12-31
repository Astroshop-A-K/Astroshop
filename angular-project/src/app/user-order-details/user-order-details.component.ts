import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, OnInit, Inject, signal } from '@angular/core';
import { OrdersDTO } from '../user-orders/user-orders.component';
import { ActivatedRoute, Route } from '@angular/router';
import { Observable } from 'rxjs';
import { ProductsDTO } from '../shopping-cart/cart.service';
import { NgClass, NgFor, NgForOf } from '@angular/common';

@Component({
  selector: 'app-user-order-details',
  standalone: true,
  imports: [NgFor, NgForOf, NgClass],
  templateUrl: './user-order-details.component.html',
  styleUrl: './user-order-details.component.css'
})
export class UserOrderDetailsComponent implements OnInit {
  public orderInfo: OrdersDTO = { //namiesto array vytvorim objekt, ktory ma ProductsDTO interface 
    orderId: 0,
    name: '',
    surname: '',
    email: '',
    phoneNumber: 0,
    address: '',
    psc: 0,
    city: '',
    country: '',
    deliveryOption: '',
    payment: "",
    totalPrice: 0,
    orderVerificationKey: '',
    orderDate: '',
    orderStatus: '',
    orderNote: ''
  }; 
  public orderId: number = 0;
  public selectedProducts: ProductsDTO[] = [];

  orderStatus = signal<string>('');

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private route: ActivatedRoute){}

  changeStatus(event: any){
    let orderStatus = event.target.value;
    this.changeOrderStatus(this.orderId, orderStatus).subscribe( () => {});
    this.orderStatus.update(value => value = orderStatus);
  }

  getOrderInfo(orderId: number){
    let queryParams = new HttpParams();
    queryParams = queryParams.append("orderId", orderId);
    return this.http.get<OrdersDTO>(this.baseUrl + 'orders/getOrderInfo', { params: queryParams });
  }
  getOrderProducts(orderId: number): Observable<ProductsDTO[]>{
    let queryParams = new HttpParams();
    queryParams = queryParams.append("orderId", orderId);
    return this.http.get<ProductsDTO[]>(this.baseUrl + 'orders/getOrderProducts', { params: queryParams });
  }
  changeOrderStatus(orderId: number, orderStatusBE: string){
    const url = `${this.baseUrl}orders/changeOrderStatus`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(url, {OrderId: orderId, OrderStatus: orderStatusBE}, { headers });
  }

  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    this.orderId = Number(routeParams.get('orderId'));

    this.getOrderInfo(this.orderId).subscribe(result => {
      this.orderInfo = result;
      this.orderStatus.set(this.orderInfo.orderStatus);
    })
    this.getOrderProducts(this.orderId).subscribe(result => {
      this.selectedProducts = result;
    })
  }
}
