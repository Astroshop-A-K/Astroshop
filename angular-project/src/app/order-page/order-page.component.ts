import { Component, OnInit } from '@angular/core';
import { CartService } from '../shopping-cart/cart.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrderService } from './order.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-order-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './order-page.component.html',
  styleUrl: './order-page.component.css'
})
export class OrderPageComponent implements OnInit {
  products = this.CartService.getProducts();
  totalPrice = this.CartService.totalPrice();

  userMessage: string = '';
  charactersCount: number = 0;

  constructor(private CartService: CartService, private OrderService: OrderService, private router: Router, private snackBar: MatSnackBar){}

  orderForm = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email, this.emailValidator]),
    phoneNumber: new FormControl('', [Validators.required, Validators.pattern(/^\d+$/)]),
    address: new FormControl('', Validators.required),
    postalCode: new FormControl('', [Validators.required, Validators.pattern(/^\d+$/)]),
    city: new FormControl('', Validators.required),
    country: new FormControl('', Validators.required),
    note: new FormControl(''),
    deliveryOption: new FormControl('', Validators.required),
  });

  update(){
    this.charactersCount = this.userMessage.length;
  }

  onSelectChange(event: any){
    this.orderForm.get('country')?.setValue(event.target.value);
  }
  onRadioChange(event: any){
    this.orderForm.get('deliveryOption')?.setValue(event.target.value);
  }

  validateAllFormFields(formGroup: FormGroup){
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if(control?.invalid){
        control.markAsTouched(); 
      }
    })
  }

  emailValidator(control: any) {
    const email = control.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email && !emailRegex.test(email)) {
      return { invalidEmail: true };
    }
    return null;
  }

  onSubmit(){
    if(this.orderForm.valid && this.products.length > 0 && this.OrderService.order ){
      this.OrderService.order = {
        name: this.orderForm.value.firstName,
        surname: this.orderForm.value.lastName,   
        email: this.orderForm.value.email,     
        phoneNumber: Number(this.orderForm.value.phoneNumber),    
        address: this.orderForm.value.address,  
        postalCode: Number(this.orderForm.value.postalCode),    
        city: this.orderForm.value.city,  
        country: this.orderForm.value.country,
        deliveryOption: this.orderForm.value.deliveryOption,          
        totalPrice: this.totalPrice,
        orderNote: this.orderForm.value.note
      }
      this.router.navigate(['/order/order-summary'])
  }else{
    this.validateAllFormFields(this.orderForm);
    this.snackBar.open('Entered values are incorrect or fields with a star were skipped!', '', {duration: 1000});
  }
  }
  ngOnInit(): void{
    if(this.products.length === 0){
      this.router.navigate(['/products']);
    }
  }
}
