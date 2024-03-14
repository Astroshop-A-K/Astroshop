import { Component, Inject, NgModule } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';

@Component({
    selector: 'app-products-detail',
    templateUrl: './products-detail.component.html',
    styleUrls: ['./products-detail.component.css'],
    standalone: true,
    imports: [NgIf, NgFor]
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

    constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private route: ActivatedRoute) {
        const routeParams = this.route.snapshot.paramMap;
        this.productName = String(routeParams.get('productName'));

        this.getProductsInfo(this.productName).subscribe(
            result => {
                this.productInfo = result; 
                console.log(this.productInfo);
            },
            error => console.error(error)
        );
    }

    getProductsInfo(productName: string): Observable<ProductsDTO> { 
        let queryParams = new HttpParams();
        queryParams = queryParams.append("productName", productName);

        return this.http.get<ProductsDTO>(this.baseUrl + 'products/getProductsInfo', { params: queryParams });
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
