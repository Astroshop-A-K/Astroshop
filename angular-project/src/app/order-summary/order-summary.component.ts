import { Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { OrderService } from '../order-page/order.service';
import { NgFor } from '@angular/common';
import { ProductsDTO } from '../products/products.component';
import { CartService } from '../shopping-cart/cart.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ShoppingCartComponent } from '../shopping-cart/shopping-cart.component';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [NgFor, ReactiveFormsModule, RouterLink],
  providers: [ShoppingCartComponent],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.css'
})
export class OrderSummaryComponent implements OnInit, OnDestroy{
  selectedProducts: ProductsDTO[];
  totalPrice = this.CartService.totalPrice();

  constructor(public OrderService: OrderService, public CartService: CartService, @Inject('BASE_URL') private baseUrl: string, private http: HttpClient, private ShoppingCart: ShoppingCartComponent){}

  paymentForm = new FormGroup({
    paymentMethod: new FormControl('', Validators.required),
  });

  onRadioChange(event: any){
    this.paymentForm.get('paymentMethod')?.setValue(event.target.value);
  }
  
  onSubmit(){
    if(this.paymentForm.valid){
      let payment = this.paymentForm.value.paymentMethod;
      let name = this.OrderService.order.name;
      let surname = this.OrderService.order.surname;
      let email = this.OrderService.order.email;
      let phoneNumber = this.OrderService.order.phoneNumber;
      let address = this.OrderService.order.address;
      let postalCode = this.OrderService.order.postalCode;
      let city = this.OrderService.order.city;
      let country = this.OrderService.order.country;
      let deliveryOption = this.OrderService.order.deliveryOption;
      let totalPrice = this.OrderService.order.totalPrice;

      this.OrderService.order.payment = payment;

      this.ShoppingCart.clearCart();

      this.createOrder(name, surname, email, phoneNumber, address, postalCode, city, country, deliveryOption, payment, totalPrice).subscribe();
      localStorage.clear();
    } 
  }

  createOrder(nameBE: string, surnameBE: string, emailBE: string, phoneNumberBE: number, addressBE: string, postalCodeBE: number, cityBE: string, countryBE: string, deliveryOptionBE: string, paymentOptionBE: string, totalPriceBE: number) {
    const url = `${this.baseUrl}orders/create-order`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(url, { Name: nameBE, Surname: surnameBE, Email: emailBE, PhoneNumber: phoneNumberBE, Address: addressBE, PSC: postalCodeBE, City: cityBE, Country: countryBE, DeliveryOption: deliveryOptionBE, Payment: paymentOptionBE, TotalPrice: totalPriceBE }, { headers });
  }

  ngOnInit(): void {
    this.selectedProducts = this.CartService.products;
  }
  ngOnDestroy(): void{
    this.OrderService.order = null;
    this.selectedProducts = [];
  }
}
