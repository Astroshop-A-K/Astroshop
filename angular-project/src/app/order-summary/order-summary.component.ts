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
  orderCompleted: boolean = false;
  appliedCoupon: boolean = false;
  couponButtonText: string = "Uplatniť";
  
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
      this.couponButtonText = "Uplatnené";
      
      this.totalPrice /= 2; 
      couponControl.setErrors(null);
      couponControl.disable();
    }
    else{
      this.snackBar.open("Nesprávny kupón", "", { duration: 1500, });
      couponControl.setErrors({invalidCoupon: true});
    }
  }

  onSubmit(){
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let orderVerificationKey: string = '';
    if(this.paymentForm.valid && this.selectedProducts.length > 0 && this.OrderService.order != null && this.recaptchaDone){
      this.isLoading = this.orderCompleted = true;
      let payment = this.paymentForm.value.paymentMethod;
      let {name, surname, email, phoneNumber, address, postalCode, city, country, deliveryOption, orderNote} = this.OrderService.order;

      this.OrderService.order.payment = payment;

      for(let i = 0; i < 32; i++){
        let randomIndex = Math.floor(Math.random() * characters.length);
        orderVerificationKey += characters[randomIndex];
      }

      this.createOrder(name, surname, email, phoneNumber, address, postalCode, city, country, deliveryOption, payment, this.totalPrice, orderVerificationKey, this.currentDate, "Čakajúce", orderNote, this.captcha).subscribe(
        (response: number) => {
            this.isLoading = false;
            this.orderId = response;
            this.generateInvoice();
            this.CartService.clearCart();
        }
      );
    }else if(this.paymentForm.invalid){
      this.snackBar.open("Zabudli ste zvoliť spôsob platby!", "", { duration: 1500, });
      const paymentControl = this.paymentForm.get('paymentMethod');
      paymentControl.markAsTouched();
    }else if(!this.recaptchaDone){
      this.snackBar.open("Zabudli ste na overenie reCAPTCHA!", "", { duration: 1500, });
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
    <div style="width: 100%; margin: 10px auto; box-sizing: border-box; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
  <div style="background-color: #f8f9fa; padding: 10px; text-align: center; border-bottom: 1px solid #e0e0e0;">
    <img src="../../assets/favicon.ico" alt="astroshop-icon" title="astroshop-icon" height="50px" width="50px">
    <h2 style="margin-top: 5px;">Číslo objednávky: <strong>${this.orderId}</strong></h2>
  </div>
  <div style="padding: 20px;">
    <div style="margin-bottom: 20px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <th style="padding: 10px; text-align: left; background-color: #0d6efd; color: white; border-bottom: 1px solid #0d6efd;">Dátum vystavenia faktúry</th>
          <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${this.currentDate}</td>
        </tr>
        <tr>
          <th style="padding: 10px; text-align: left; background-color: #0d6efd; color: white; border-bottom: 1px solid #0d6efd;">Číslo faktúry</th>
          <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${this.orderId}</td>
        </tr>
        <tr>
          <th style="padding: 10px; text-align: left; background-color: #0d6efd; color: white;">Celkový počet produktov</th>
          <td style="padding: 10px;">${this.selectedProducts.reduce((sum, product) => sum + product.amount, 0)} ks</td>
        </tr>
      </table>
    </div>

    <div style="margin-bottom: 20px;">
      <h3 style="margin-bottom: 10px; font-weight: bold;">Objednané produkty</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead style="background-color: #0d6efd; color: white;">
          <tr>
            <th style="padding: 10px; text-align: left;">Názov produktu</th>
            <th style="padding: 10px; text-align: center;">Cena/ks</th>
            <th style="padding: 10px; text-align: center;">Množstvo</th>
            <th style="padding: 10px; text-align: center;">Celkom (€)</th>
          </tr>
        </thead>
        <tbody>
          ${this.selectedProducts.map(product => `
            <tr>
              <td style="padding: 10px; text-align: left; border-bottom: 1px solid #f0f0f0;">${product.productName}</td>
              <td style="padding: 10px; text-align: center; border-bottom: 1px solid #f0f0f0;">${product.price}€</td>
              <td style="padding: 10px; text-align: center; border-bottom: 1px solid #f0f0f0;">${product.amount} ks</td>
              <td style="padding: 10px; text-align: center; border-bottom: 1px solid #f0f0f0;">${(product.amount* (product.price - ((product.price / 100) * product.productDiscount))).toFixed(2)}€</td>
            </tr>
          `).join('')}
          <tr>
            <td style="padding: 10px; font-weight: bold; text-align: left;">CELKOM:</td>
            <td style="padding: 10px;"></td>
            <td style="padding: 10px;"></td>
            <td style="font-weight: bold; padding: 10px" style="text-align: center"> ${discount ? ((this.CartService.totalPrice() / 2).toFixed(2) + '€ (' + discount + ')') : (this.CartService.totalPrice().toFixed(2) + '€')}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div style="margin-bottom: 20px;">
      <h3 style="margin-bottom: 10px; font-weight: bold;">Objednávateľ</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <th style="padding: 10px; text-align: left; background-color: #0d6efd; color: white; border-bottom: 1px solid #0d6efd;">Meno a priezvisko</th>
          <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;"> ${this.OrderService.order.name} ${this.OrderService.order.surname}</td>
        </tr>
        <tr>
          <th style="padding: 10px; text-align: left; background-color: #0d6efd; color: white; border-bottom: 1px solid #0d6efd;">Adresa</th>
          <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${this.OrderService.order.address}, ${this.OrderService.order.postalCode}, ${this.OrderService.order.city}</td>
        </tr>
        <tr>
          <th style="padding: 10px; text-align: left; background-color: #0d6efd; color: white; border-bottom: 1px solid #0d6efd;">E-mail</th>
          <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${this.OrderService.order.email}</td>
        </tr>
        <tr>
          <th style="padding: 10px; text-align: left; background-color: #0d6efd; color: white;">Tel.č.</th>
          <td style="padding: 10px;">${this.OrderService.order.phoneNumber}</td>
        </tr>
      </table>
    </div>
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
      subject: 'Informácie objednávky'
    };

    emailjs.init('vvvXsO3WEU729fqbQ');
    emailjs.send('service_cleravy', 'template_5nu9fji', emailParams);

    const options = {
      margin: [5, 5, 5, 5],
      filename: `Faktúra_č${this.orderId}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: {unit: 'mm', format: 'a4', orientation: 'portrait'}
    };

    const element = document.createElement('div');
    element.innerHTML = invoiceHTML;
    html2pdf().set(options).from(element).toPdf().get('pdf').then((pdf)=>{
      pdf.save(`Faktura_č${this.orderId}.pdf`);
    })
  }

  createOrder(nameBE: string, surnameBE: string, emailBE: string, phoneNumberBE: number, addressBE: string, postalCodeBE: number, cityBE: string, countryBE: string, deliveryOptionBE: string, paymentOptionBE: string, totalPriceBE: number, orderVerificationKeyBE: string, currentDateBE: string, orderStatusBE: string, orderNoteBE: string, recaptchaResponse: string) {
    const url = `${this.baseUrl}orders/create-order`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const orderProducts = this.selectedProducts.map(product => ({
      ProductId: product.productId,
      Quantity: product.amount
    }))
    return this.http.post(url, { Name: nameBE, Surname: surnameBE, Email: emailBE, PhoneNumber: phoneNumberBE, Address: addressBE, PSC: postalCodeBE, City: cityBE, Country: countryBE, DeliveryOption: deliveryOptionBE, Payment: paymentOptionBE, TotalPrice: totalPriceBE, OrderVerificationKey: orderVerificationKeyBE, OrderDate: currentDateBE, OrderStatus: orderStatusBE, OrderNote: orderNoteBE, RecaptchaResponse: recaptchaResponse, OrderProducts: orderProducts }, { headers });
  }
  getOrderId(orderVerificationKeyBE: string){
    return this.http.get<number>(this.baseUrl + `orders/${orderVerificationKeyBE}`);
  }

  ngOnInit(): void {
    this.selectedProducts = this.CartService.products;
    if(this.selectedProducts.length === 0 || this.OrderService.order == null){
      this.router.navigate(['/products']);
    }
    this.currentDate = this.datePipe.transform(new Date(), 'dd.MM.yyyy HH:mm:ss');
  }
  ngOnDestroy(): void{
    if(this.orderCompleted){
      this.selectedProducts = [];
      this.orderCompleted = false;
      this.ShoppingCart.clearCart();
    }
  }
}