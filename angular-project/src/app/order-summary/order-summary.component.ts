import { Component, OnDestroy, OnInit, Inject, signal, Query, ViewChild, ElementRef } from '@angular/core';
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
import emailjs from 'emailjs-com';
import * as html2pdf from 'html2pdf.js'; 

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
  @ViewChild('table', { static: false }) table!: ElementRef;

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

      this.createOrder(name, surname, email, phoneNumber, address, postalCode, city, country, deliveryOption, payment, this.totalPrice, orderVerificationKey, this.currentDate, "Pending").subscribe(
        () => {
          this.getOrderId(orderVerificationKey).subscribe(result => {
            this.orderId = result;
            this.generateInvoice();
            this.selectedProducts.forEach((product) => {
              this.addProductId(product.productId, this.orderId, product.amount).subscribe();
            })
            this.CartService.clearCart();
          });
        }
      );
      this.orderCompleted = true;
    } 
  }
  generateInvoice() {
    const invoiceHTML = `
    <div style="width: 100%;box-sizing: border-box; padding: 50px">
      <div class="title-element" style="font-family: Arial, Helvetica, sans-serif; text-align: center;">
        <h2>Číslo objednávky: <strong>${this.orderId}</strong></h2>
      </div>
      <div class="first-table">
        <table style="width: 100%; border: 1px solid #ccc; border-collapse: collapse; text-align: center;">
          <tr>
            <th style="padding: 8px; text-align: left; background-color: #f9f9f9;">Dátum</th>
            <td style="padding: 8px;">${this.currentDate}</td>
          </tr>
          <tr>
            <th style="padding: 8px; text-align: left; background-color: #f9f9f9;">Hmotnosť objednávky</th>
            <td style="padding: 8px;">0 kg</td>
          </tr>
          <tr>
            <th style="padding: 8px; text-align: left; background-color: #f9f9f9;">Celkový počet produktov</th>
            <td style="padding: 8px;">${this.selectedProducts.reduce((sum, product) => sum + product.amount, 0)}</td>
          </tr>
          <tr>
            <th style="padding: 8px; text-align: left; background-color: #f9f9f9;">IP adresa</th>
            <td style="padding: 8px;">192.168.10.1</td>
          </tr>
        </table>
      </div>
      <div class="second-table" style="margin-top: 10px">
        <h3>Objednané produkty</h3>
        <table style="width: 100%; border: 1px solid #ccc; border-collapse: collapse; text-align: center;">
          <tr style="background-color: #f9f9f9;">
            <th style="padding: 10px;">Číslo produktu</th>
            <th style="padding: 10px;">Cena/ks</th>
            <th style="padding: 10px;">Ks</th>
            <th style="padding: 10px;">Celkom</th>
          </tr>
          ${this.selectedProducts.map(item => `
            <tr>
              <td style="padding: 8px;">${item.productId}</td>
              <td style="padding: 8px;">${item.price} €</td>
              <td style="padding: 8px;">${item.amount}</td>
              <td style="padding: 8px;">${(item.amount * item.price).toFixed(2)} €</td>
            </tr>
          `).join('')}
          <tr>
            <td style="font-weight: bold;">CELKOM:</td>
            <td></td>
            <td></td>
            <td style="font-weight: bold;">${this.totalPrice.toFixed(2)}€</td>
          </tr>
        </table>
      </div>
      <div class="third-table" style="margin-top: 10px">
        <h3>Objednávateľ</h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ccc;">
          <tr>
            <th style="padding: 8px; text-align: left; background-color: #f9f9f9;">Meno</th>
            <td style="padding: 8px;">${this.OrderService.order.name} ${this.OrderService.order.surname}</td>
          </tr>
          <tr>
            <th style="padding: 8px; text-align: left; background-color: #f9f9f9;">Adresa</th>
            <td style="padding: 8px;">${this.OrderService.order.address}, ${this.OrderService.order.city}, ${this.OrderService.order.postalCode}</td>
          </tr>
          <tr>
            <th style="padding: 8px; text-align: left; background-color: #f9f9f9;">E-mail</th>
            <td style="padding: 8px;">${this.OrderService.order.email}</td>
          </tr>
          <tr>
            <th style="padding: 8px; text-align: left; background-color: #f9f9f9;">Tel.č.</th>
            <td style="padding: 8px;">${this.OrderService.order.phoneNumber}</td>
          </tr>
          <tr>
            <th style="padding: 8px; text-align: left; background-color: #f9f9f9;">Štát</th>
            <td style="padding: 8px;">${this.OrderService.order.country}</td>
          </tr>
        </table>
      </div>
    </div>
  `;

    const emailParams = {
      customer_name: `${this.OrderService.order.name} ${this.OrderService.order.surname}`,
      customer_email: this.OrderService.order.email,
      customer_address: this.OrderService.order.address,
      customer_city: this.OrderService.order.city,
      customer_country: this.OrderService.order.country,
      order_id: this.orderId,
      order_date: this.currentDate,
      products_table: this.selectedProducts.map(product => {
        const total = (product.amount * product.price).toFixed(2);
        return `${product.productName} | ${product.amount} | ${product.price.toFixed(2)}€ | ${total}€`;
      }).join('\n'), //zmapujeme kazdy product v array a to sa tam akoby ulozi pre kazdy prvok ta value co sa vracia a join('\n') spoji vsetky prvky array do jedneho stringu a tie prvky su oddelene novym riadkom aby to tam nebolo prepchate preto to '\n'
      total_price: this.totalPrice.toFixed(2),
      subject: 'Order Information'
    };

    emailjs.init('vvvXsO3WEU729fqbQ');
    emailjs.send('service_cleravy', 'template_5nu9fji', emailParams);

    const element = document.createElement('div');
    element.innerHTML = invoiceHTML;
    html2pdf().from(element).toPdf().get('pdf').then((pdf)=>{
      pdf.save(`Faktura_č${this.orderId}.pdf`);
    })
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
  changeProductQuantity(productId: number, quantity: number){
    const url = `${this.baseUrl}orders/changeProductQuantity`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(url, { ProductId: productId, Quantity: quantity}, { headers });
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
    this.ShoppingCart.clearCart();
  }
}