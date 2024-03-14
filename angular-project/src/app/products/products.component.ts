import { Component, Inject, NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { NgClass, NgFor, NgIf} from '@angular/common';
import { SearchPipe } from './search.pipe';
import { NgModel, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
  standalone: true,
  imports: [RouterLink, NgClass, NgIf, NgFor, SearchPipe, FormsModule]
})
export class ProductsComponent {
  public productData: ProductsDTO[] = [];
  public ourFilteredProducts: ProductsDTO[] = [];

  searchText: any;

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) {
    this.getData();
  }

  filterProducts(category: string) {
    this.ourFilteredProducts = this.productData.filter(product => product.productCategory === category);
  }

  showAllProducts() {
    this.ourFilteredProducts = this.productData;
  }

  filtersProducts() {
    if (!this.searchText) {
      this.ourFilteredProducts = this.productData;
    } else {
      this.ourFilteredProducts = this.productData.filter(product =>
        product.productName.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }
  }

  onSortChange(event: any) {
    const selectedValue = event.target.value;
    if (selectedValue === 'mostExpensive') {
      this.sortData('mexp');
    } else if (selectedValue === 'leastExpensive') {
      this.sortData('lexp');
    } else if (selectedValue === 'isAvailable') {
      this.sortData('isa');
    } else if (selectedValue === 'all') {
      this.sortData('asa');
    }
    // tu ked tak pridat ostatne sorting
  }

  private sortData(order: string) {
    if (order === 'lexp') {
      this.ourFilteredProducts.sort((a, b) => a.price - b.price);
    } else if (order === 'mexp') {
      this.ourFilteredProducts.sort((a, b) => b.price - a.price);
    } else if (order === 'isa') {
      this.ourFilteredProducts = this.ourFilteredProducts.filter(product => product.quantity > 0);
    } else if (order === 'asa') {
      this.showAllProducts();
    }
  }

  getData() {
    this.http.get<ProductsDTO[]>(this.baseUrl + 'products').subscribe(result => {
      this.productData = result;
      this.filtersProducts();
    }, error => console.error(error));
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
