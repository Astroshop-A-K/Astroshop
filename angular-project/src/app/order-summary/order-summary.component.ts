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
import { jsPDF } from 'jspdf'
import 'jspdf-autotable';

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
          });
        }
      );
      this.orderCompleted = true;
    } 
  }
  generateInvoice() {
    const doc = new jsPDF();
    const marginLeft = 10;
    let cursorY = 20; //budeme mat miesto na vrchu page

    doc.setFontSize(19);
    doc.text('Faktura', 105, cursorY, { align: 'center' });

    cursorY += 10;
    doc.setFontSize(12);
    doc.text(`Fakturacne cislo: ${this.orderId}`, marginLeft, cursorY);
    doc.text(`Dátum: ${this.currentDate.toString()}`, 142, cursorY);

    cursorY += 10;
    doc.setFontSize(10);
    doc.text(`Od: Astroshop.sk`, marginLeft, cursorY);
    cursorY += 5;
    doc.text(`123 Universe Rd, Suite 120`, marginLeft, cursorY);
    cursorY += 5;
    doc.text(`Las Vegas, BS 54321`, marginLeft, cursorY);
    cursorY += 5;
    doc.text(`Tel.c.: +060 (800) 801-582`, marginLeft, cursorY);
    cursorY += 5;
    doc.text(`Emailova adresa: astroshop.sk@gmail.com`, marginLeft, cursorY);

    cursorY += 10;
    doc.text(`Sprava pre: ${this.OrderService.order.name} ${this.OrderService.order.surname}`, marginLeft, cursorY);
    cursorY += 5;
    doc.text(`${this.OrderService.order.address}`, marginLeft, cursorY);
    cursorY += 5;
    doc.text(`${this.OrderService.order.city}, ${this.OrderService.order.country}`, marginLeft, cursorY);
    cursorY += 5;
    doc.text(`Email: ${this.OrderService.order.email}`, marginLeft, cursorY);

    const products = this.selectedProducts.map(product => [ //kazdy produkt sa zmapuje do riadkov ktore budu mat 4 stlpce
      product.productName,
      `${product.amount.toString()}`,
      `${product.price.toFixed(2)}€`,
      `${(product.amount * product.price).toFixed(2)}`
    ]);

    cursorY += 10;
    (doc as any).autoTable({ //doc as any znamena ze to bude typu ANY aby sme mohli aplikovat autoTable funkciu
      startX: cursorY,
      startY: cursorY,
      head: [['Popis', 'Mnozstvo', 'Cena', 'Celkovo']],
      body: products,
      theme: 'grid',
      headStyles: { fillColor: [13, 110, 253]},
      styles: { fontSize: 10, cellPadding: 2},
      columnStyles: {
        0: { cellWidth: 70, fontSize: 8},
        1: { cellWidth: 30, halign: 'left'},
        2: { cellWidth: 30, halign: 'left'},
        3: { cellWidth: 30, halign: 'left'}
      }
    });

    cursorY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Celkovo: ${this.totalPrice.toFixed(2)}€`, 160, cursorY);

    doc.save(`Faktura_č${this.orderId}.pdf`);
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