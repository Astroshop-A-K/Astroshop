import { Component } from '@angular/core';
import { CartService } from '../shopping-cart/cart.service';

@Component({
  selector: 'app-order-page',
  standalone: true,
  imports: [],
  templateUrl: './order-page.component.html',
  styleUrl: './order-page.component.css'
})
export class OrderPageComponent {
  totalPrice = this.CartService.totalPrice();
  products = this.CartService.getProducts();

  constructor(private CartService: CartService){}

  orderForm = new FormGroup({
    name: new FormControl(''),
    surname: new FormControl(''),
    email: new FormControl(''),
    phoneNumber: new FormControl(''),
    address: new FormControl(''),
    psc: new FormControl(''),
    city: new FormControl(''),
    country: new FormControl(''),
    deliveryOption: new FormControl(''),
  });

  onSelectChange(event: any){
    this.orderForm.get('country')?.setValue(event.target.value);
  }
  onRadioChange(event: any){
    this.orderForm.get('deliveryOption')?.setValue(event.target.value);
  }
}
