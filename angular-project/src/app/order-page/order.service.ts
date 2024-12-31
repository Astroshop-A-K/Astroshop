import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  order: OrdersDTO = {
    name: '',
    surname: '',
    email: '',
    phoneNumber: 0,
    address: '',
    postalCode: 0,
    city: '',
    country: '',
    deliveryOption: '',
    payment: '',
    orderNote: '',
    totalPrice: 0,
  }

  constructor() { }
}
export interface OrdersDTO{
  name?: string;
  surname?: string;
  email?: string;
  phoneNumber?: number;
  address?: string;
  postalCode?: number;
  city?: string;
  country?: string;
  deliveryOption?: string;
  payment?: string;
  orderNote?: string;
  totalPrice?: number;
}
