import { Component } from '@angular/core';
import { CartService } from '../shopping-cart/cart.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrderService } from './order.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-order-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './order-page.component.html',
  styleUrl: './order-page.component.css'
})
export class OrderPageComponent {
  products = this.CartService.getProducts();
  totalPrice = this.CartService.totalPrice();

  constructor(private CartService: CartService, private OrderService: OrderService){}

  orderForm = new FormGroup({
    name: new FormControl('', Validators.required),
    surname: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email, this.emailValidator]),
    phoneNumber: new FormControl(0, Validators.required),
    address: new FormControl('', Validators.required),
    psc: new FormControl(0, Validators.required),
    city: new FormControl('', Validators.required),
    country: new FormControl('', Validators.required),
    deliveryOption: new FormControl('', Validators.required),
  });

  onSelectChange(event: any){
    this.orderForm.get('country')?.setValue(event.target.value);
  }
  onRadioChange(event: any){
    this.orderForm.get('deliveryOption')?.setValue(event.target.value);
  }

  emailValidator(control: any) {
    const email = control.value;
    if (email && email.indexOf('@') === -1 && email.indexOf('.') === -1) {
      return { invalidEmail: true };
    }
    return null;
  }

  onSubmit(){
    if(this.orderForm.valid && this.products.length > 0 && this.OrderService.order ){
      this.OrderService.order = {
        name: this.orderForm.value.name,
        surname: this.orderForm.value.surname,   
        email: this.orderForm.value.email,     
        phoneNumber: this.orderForm.value.phoneNumber,    
        address: this.orderForm.value.address,  
        postalCode: this.orderForm.value.psc,    
        city: this.orderForm.value.city,  
        country: this.orderForm.value.country,
        deliveryOption: this.orderForm.value.deliveryOption,          
        totalPrice: this.totalPrice,
      }
  }
  }
}
