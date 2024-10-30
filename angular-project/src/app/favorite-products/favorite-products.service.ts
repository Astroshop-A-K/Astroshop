import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductsDTO } from '../shopping-cart/cart.service';

@Injectable({
  providedIn: 'root'
})
export class FavoriteProductsService {
  countNum = signal(0);

  constructor(@Inject('BASE_URL') private baseUrl: string, private http: HttpClient) { }

  addFavoriteProduct(productId: number, userId: string){
    this.countNum.update(value => value + 1);
    const url = `${this.baseUrl}products/add-favorite-product`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(url, { ProductId: productId, UserId: userId }, { headers });
  }
  getFavoriteProducts(userId: string): Observable<ProductsDTO[]>{
    let queryParams = new HttpParams();
    queryParams = queryParams.append("userId", userId);
    return this.http.get<ProductsDTO[]>(this.baseUrl + 'products/getFavoriteProducts', { params: queryParams });
  }
  removeFavoriteProduct(userId: string, productId: number){
    this.countNum.update(value => value - 1);
    let queryParams = new HttpParams().set("userId", userId).set("productId", productId);
    const url = `${this.baseUrl}products/remove-favorite-product`;        
    return this.http.delete(url, { params: queryParams });
  }
}
