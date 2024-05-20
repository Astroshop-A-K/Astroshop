import { Component, OnDestroy, OnInit, Inject, signal } from '@angular/core';
import { OrderService } from '../order-page/order.service';
import { DatePipe, NgFor } from '@angular/common';
import { ProductsDTO } from '../shopping-cart/cart.service';
import { CartService } from '../shopping-cart/cart.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ShoppingCartComponent } from '../shopping-cart/shopping-cart.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { __values } from 'tslib';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [NgFor, ReactiveFormsModule, RouterLink, DatePipe],
  providers: [ShoppingCartComponent, MatSnackBar, DatePipe],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.css'
})
export class OrderSummaryComponent implements OnInit, OnDestroy{
  selectedProducts: ProductsDTO[];
  orderCompleted: boolean;
  appliedCoupon: boolean = false;
  couponButtonText: string = "Apply";
  
  totalPrice = this.CartService.totalPrice();
  orderId: number = 0;

  currentDate: string = '';

  constructor(public OrderService: OrderService, public CartService: CartService, @Inject('BASE_URL') private baseUrl: string, private http: HttpClient, private ShoppingCart: ShoppingCartComponent, private snackBar: MatSnackBar, private router: Router, private datePipe: DatePipe){}

  paymentForm = new FormGroup({
    paymentMethod: new FormControl('', Validators.required),
    coupon: new FormControl(''),
  });

  onRadioChange(event: any){
    this.paymentForm.get('paymentMethod')?.setValue(event.target.value);
  }

  applyCoupon(){
    if(this.paymentForm.value.coupon == "BESTSHOP"){
      this.appliedCoupon = true;
      this.couponButtonText = "Applied";
      
      this.totalPrice /= 2; 
    }
    else{
      this.snackBar.open("Invalid coupon", "", { duration: 1500, });
    }
  }
  
  onSubmit(){
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let orderVerificationKey: string = '';
    if(this.paymentForm.valid){
      let payment = this.paymentForm.value.paymentMethod;
      let {name, surname, email, phoneNumber, address, postalCode, city, country, deliveryOption} = this.OrderService.order;

      this.OrderService.order.payment = payment;

      for(let i = 0; i < 32; i++){
        let randomIndex = Math.floor(Math.random() * characters.length);
        orderVerificationKey += characters[randomIndex];
      }

      this.ShoppingCart.clearCart();

      this.createOrder(name, surname, email, phoneNumber, address, postalCode, city, country, deliveryOption, payment, this.totalPrice, orderVerificationKey, this.currentDate, "Pending").subscribe(
        () => {
          this.getOrderId(orderVerificationKey).subscribe(result => {
            this.orderId = result;
            for(let i = 0; i < this.selectedProducts.length; i++){
              this.addProductId(this.selectedProducts[i].productId, this.orderId, this.selectedProducts[i].amount).subscribe();
            }
          });
        }
      );

      this.orderCompleted = true;
    } 
  }
  createOrder(nameBE: string, surnameBE: string, emailBE: string, phoneNumberBE: number, addressBE: string, postalCodeBE: number, cityBE: string, countryBE: string, deliveryOptionBE: string, paymentOptionBE: string, totalPriceBE: number, orderVerificationKeyBE: string, currentDateBE: string, orderStatusBE: string) {
    const url = `${this.baseUrl}orders/create-order`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(url, { Name: nameBE, Surname: surnameBE, Email: emailBE, PhoneNumber: phoneNumberBE, Address: addressBE, PSC: postalCodeBE, City: cityBE, Country: countryBE, DeliveryOption: deliveryOptionBE, Payment: paymentOptionBE, TotalPrice: totalPriceBE, OrderVerificationKey: orderVerificationKeyBE, OrderDate: currentDateBE, OrderStatus: orderStatusBE }, { headers });
  }
  getOrderId(orderVerificationKeyBE: string){
    return this.http.get<number>(this.baseUrl + `orders/${orderVerificationKeyBE}`);
  }
  addProductId(productId: number, orderId: number, amountBE: number){
    const url = `${this.baseUrl}orders/add-productId`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(url, { ProductId: productId, OrderId: orderId, Quantity: amountBE }, { headers });
  }

  ngOnInit(): void {
    this.selectedProducts = this.CartService.products;
    if(this.selectedProducts.length === 0 || this.OrderService.order == null){
      this.router.navigate(['/products']);
    }
    this.currentDate = this.datePipe.transform(new Date(), 'MMM d, yyyy, h:mm a');
  }
  ngOnDestroy(): void{
    this.selectedProducts = [];
    this.orderCompleted = false;
  }
}