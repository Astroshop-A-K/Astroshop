import { Component, OnDestroy, OnInit, Inject, signal, Query, ViewChild, ElementRef } from '@angular/core';
import { OrderService } from '../order-page/order.service';
import { CommonModule, DatePipe, NgFor } from '@angular/common';
import { ProductsDTO } from '../shopping-cart/cart.service';
import { CartService } from '../shopping-cart/cart.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ShoppingCartComponent } from '../shopping-cart/shopping-cart.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RecaptchaModule } from 'ng-recaptcha';
import { __values } from 'tslib';
import emailjs from 'emailjs-com';
import * as html2pdf from 'html2pdf.js'; 

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [NgFor, ReactiveFormsModule, RouterLink, DatePipe, CommonModule, RecaptchaModule],
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

  captcha: string = '';
  recaptchaDone: boolean = false;

  isLoading: boolean = true;

  constructor(public OrderService: OrderService, public CartService: CartService, @Inject('BASE_URL') private baseUrl: string, private http: HttpClient, private ShoppingCart: ShoppingCartComponent, private snackBar: MatSnackBar, private router: Router, private datePipe: DatePipe){
    this.captcha = '';
  }

  paymentForm = new FormGroup({
    paymentMethod: new FormControl('', Validators.required),
    coupon: new FormControl(''),
  });

  resolved(captchaResponse: string){
    this.captcha = captchaResponse;
    this.recaptchaDone = !!captchaResponse;
  }

  onRadioChange(event: any){
    this.paymentForm.get('paymentMethod')?.setValue(event.target.value);
  }

  applyCoupon(){
    const couponControl = this.paymentForm.get('coupon');
    if(this.paymentForm.value.coupon == "BESTSHOP"){
      this.appliedCoupon = true;
      this.couponButtonText = "Applied";
      
      this.totalPrice /= 2; 
      couponControl.setErrors(null);
      couponControl.disable();
    }
    else{
      this.snackBar.open("Invalid coupon", "", { duration: 1500, });
      couponControl.setErrors({invalidCoupon: true});
    }
  }

  onSubmit(){
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let orderVerificationKey: string = '';
    if(this.paymentForm.valid && this.selectedProducts.length > 0 && this.OrderService.order != null && this.recaptchaDone){
      let payment = this.paymentForm.value.paymentMethod;
      let {name, surname, email, phoneNumber, address, postalCode, city, country, deliveryOption, orderNote} = this.OrderService.order;

      this.OrderService.order.payment = payment;

      for(let i = 0; i < 32; i++){
        let randomIndex = Math.floor(Math.random() * characters.length);
        orderVerificationKey += characters[randomIndex];
      }

      this.createOrder(name, surname, email, phoneNumber, address, postalCode, city, country, deliveryOption, payment, this.totalPrice, orderVerificationKey, this.currentDate, "Pending", orderNote, this.captcha).subscribe(
        () => {
          this.getOrderId(orderVerificationKey).subscribe(result => {
            this.isLoading = false;
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
    }else if(this.paymentForm.invalid){
      this.snackBar.open("You forgot to choose payment option!", "", { duration: 1500, });
      const paymentControl = this.paymentForm.get('paymentMethod');
      paymentControl.markAsTouched();
    }else if(!this.recaptchaDone){
      this.snackBar.open("You forgot to complete re-captcha!", "", { duration: 1500, });
    }
  }

  generateProductsTable(): string {
    return this.selectedProducts.map(product => {
      return `
        <tr>
          <td style="padding: 8px;">${product.productName}</td>
          <td style="padding: 8px;">${product.amount}x</td>
          <td style="padding: 8px;">${(product.price - ((product.price / 100)) * product.productDiscount).toFixed(2)}€ (-${product.productDiscount}%)</td>
          <td style="padding: 8px;">${(product.amount * (product.price - ((product.price / 100) * product.productDiscount))).toFixed(2)}€</td>
        </tr>
      `;
    }).join('');
  }

  generateInvoice() {
    const discount = this.appliedCoupon ? '-50% zľava z kupónu' : '';
    const invoiceHTML = `
    <div style="width: 100%;box-sizing: border-box; padding: 50px">
      <div class="title-element" style="font-family: Arial, Helvetica, sans-serif; text-align: center;">
        <img src="../../assets/favicon.ico" alt="astroshop-icon" title="astroshop-icon" height="50px" width="50px">
        <h2>Číslo objednávky: <strong>${this.orderId}</strong></h2>
      </div>
      <div class="first-table">
        <table style="width: 100%; border: 1px solid #ccc; border-collapse: collapse; text-align: center;">
          <tr>
            <th style="padding: 8px; text-align: left; background-color: #0d6efd; color: white;">Dátum</th>
            <td style="padding: 8px;">${this.currentDate}</td>
          </tr>
          <tr>
            <th style="padding: 8px; text-align: left; background-color: #0d6efd; color: white;">Celkový počet produktov</th>
            <td style="padding: 8px;">${this.selectedProducts.reduce((sum, product) => sum + product.amount, 0)} ks</td>
          </tr>
        </table>
      </div>
      <div class="second-table" style="margin-top: 10px">
        <h3>Objednané produkty</h3>
        <table style="width: 100%; border: 1px solid #ccc; border-collapse: collapse; text-align: center;">
          <tr style="background-color: #0d6efd; color: white;">
            <th style="padding: 8px;">Názov produktu</th>
            <th style="padding: 8px;">Cena/ks</th>
            <th style="padding: 8px;">Ks</th>
            <th style="padding: 8px;">Celkom</th>
          </tr>
          ${this.selectedProducts.map(product => `
            <tr>
              <td style="padding: 8px;">${product.productName}</td>
              <td style="padding: 8px;">${(product.price - ((product.price / 100)) * product.productDiscount).toFixed(2) }€ (-${product.productDiscount}%)</td>
              <td style="padding: 8px;">${product.amount}x</td>
              <td style="padding: 8px;">${(product.amount * (product.price - ((product.price / 100) * product.productDiscount))).toFixed(2)}€</td>
            </tr>
          `).join('')}
          <tr>
            <td style="font-weight: bold; padding: 8px;">CELKOM:</td>
            <td style="padding: 8px;"></td>
            <td style="padding: 8px;"></td>
            <td style="font-weight: bold; padding: 8px"> ${discount ? ((this.CartService.totalPrice() / 2).toFixed(2) + '€ (' + discount + ')') : (this.CartService.totalPrice().toFixed(2) + '€')}</td>
          </tr>
        </table>
      </div>
      <div class="third-table" style="margin-top: 10px">
        <h3>Objednávateľ</h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ccc;">
          <tr>
            <th style="padding: 8px; text-align: left; background-color: #0d6efd; color: white;">Meno</th>
            <td style="padding: 8px;">${this.OrderService.order.name} ${this.OrderService.order.surname}</td>
          </tr>
          <tr>
            <th style="padding: 8px; text-align: left; background-color: #0d6efd; color: white;">Adresa</th>
            <td style="padding: 8px;">${this.OrderService.order.address}, ${this.OrderService.order.postalCode}, ${this.OrderService.order.city}</td>
          </tr>
          <tr>
            <th style="padding: 8px; text-align: left; background-color: #0d6efd; color: white;">E-mail</th>
            <td style="padding: 8px;">${this.OrderService.order.email}</td>
          </tr>
          <tr>
            <th style="padding: 8px; text-align: left; background-color: #0d6efd; color: white;">Tel.č.</th>
            <td style="padding: 8px;">${this.OrderService.order.phoneNumber}</td>
          </tr>
          <tr>
            <th style="padding: 8px; text-align: left; background-color: #0d6efd; color: white;">Štát</th>
            <td style="padding: 8px;">${this.OrderService.order.country}</td>
          </tr>
        </table>
      </div>
    </div>
  `;

    const emailParams = {
      customer_name: `${this.OrderService.order.name} ${this.OrderService.order.surname}`,
      customer_phoneNumber: this.OrderService.order.phoneNumber,
      customer_email: this.OrderService.order.email,
      customer_address: this.OrderService.order.address,
      customer_city: this.OrderService.order.city,
      customer_postalCode: this.OrderService.order.postalCode,
      customer_country: this.OrderService.order.country,
      delivery_option: this.OrderService.order.deliveryOption,
      payment_option: this.OrderService.order.payment,
      order_id: this.orderId,
      order_date: this.currentDate,
      products_table: this.generateProductsTable(),
      total_price: this.appliedCoupon ? `${((this.CartService.totalPrice()) / 2).toFixed(2)}€ (${discount})` : `${this.CartService.totalPrice().toFixed(2)}€`,
      subject: 'Order Information'
    };

    console.log(emailParams.products_table);

    emailjs.init('vvvXsO3WEU729fqbQ');
    emailjs.send('service_cleravy', 'template_5nu9fji', emailParams);

    const element = document.createElement('div');
    element.innerHTML = invoiceHTML;
    html2pdf().from(element).toPdf().get('pdf').then((pdf)=>{
      pdf.save(`Faktura_č${this.orderId}.pdf`);
    })
  }

  createOrder(nameBE: string, surnameBE: string, emailBE: string, phoneNumberBE: number, addressBE: string, postalCodeBE: number, cityBE: string, countryBE: string, deliveryOptionBE: string, paymentOptionBE: string, totalPriceBE: number, orderVerificationKeyBE: string, currentDateBE: string, orderStatusBE: string, orderNoteBE: string, recaptchaResponse: string) {
    const url = `${this.baseUrl}orders/create-order`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(url, { Name: nameBE, Surname: surnameBE, Email: emailBE, PhoneNumber: phoneNumberBE, Address: addressBE, PSC: postalCodeBE, City: cityBE, Country: countryBE, DeliveryOption: deliveryOptionBE, Payment: paymentOptionBE, TotalPrice: totalPriceBE, OrderVerificationKey: orderVerificationKeyBE, OrderDate: currentDateBE, OrderStatus: orderStatusBE, OrderNote: orderNoteBE, RecaptchaResponse: recaptchaResponse }, { headers });
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
    if(this.orderCompleted){
      this.selectedProducts = [];
      this.orderCompleted = false;
      this.ShoppingCart.clearCart();
    }
  }
}