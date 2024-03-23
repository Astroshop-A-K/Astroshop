import { Component, Inject, NgModule } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { CartService } from '../shopping-cart/cart.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-products-detail',
    templateUrl: './products-detail.component.html',
    styleUrls: ['./products-detail.component.css'],
    standalone: true,
    imports: [NgIf, NgFor, NgClass, NgSwitch, NgSwitchCase],
    providers: [MatSnackBar]
})
export class ProductsDetailComponent {
    public productInfo: ProductsDTO = { //namiesto array vytvorim objekt, ktory ma ProductsDTO interface 
        productId: 0,
        productName: '',
        productDescription: '',
        price: 0,
        productCategory: '',
        productImage0: '',
        productImage1: '',
        productImage2: '',
        quantity: 0
    }; 
    public productName: string = '';
    public currentImagePosition: number = 0;

    constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private route: ActivatedRoute, private CartService: CartService, private snackBar: MatSnackBar) {
        const routeParams = this.route.snapshot.paramMap;
        this.productName = String(routeParams.get('productName'));

        this.getProductInfo(this.productName).subscribe(
            result => {
                this.productInfo = result; 
                console.log(this.productInfo);
            },
            error => console.error(error)
        );
    }

    addToCart(){
        this.CartService.addToCart(this.productInfo);
        this.snackBar.open("Your product has been added to the cart!", "", { duration: 1500, }); // v ms
    }

    positionLeft(){
        if(this.currentImagePosition > 0){
            this.currentImagePosition -= 1;
        }
    }
    positionRight(){
        if(this.currentImagePosition < 2){
            this.currentImagePosition += 1;
        }
    }

    getProductInfo(productName: string): Observable<ProductsDTO> { 
        let queryParams = new HttpParams();
        queryParams = queryParams.append("productName", productName);

        return this.http.get<ProductsDTO>(this.baseUrl + 'products/getProductInfo', { params: queryParams });
    }
}
export interface ProductsDTO {
    productId: number;
    productName: string;
    productDescription: string;
    price: number;
    productCategory: string;
    productImage0: string;
    productImage1: string;
    productImage2: string;
    quantity: number;
}
