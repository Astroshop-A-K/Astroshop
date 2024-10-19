import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgClass, NgFor, NgIf} from '@angular/common';
import { SearchPipe } from './search.pipe';
import { FormsModule } from '@angular/forms';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { PaginationComponent } from '../pagination/pagination.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
  standalone: true,
  imports: [RouterLink, NgClass, NgIf, NgFor, SearchPipe, FormsModule, StarRatingComponent, PaginationComponent, MatProgressSpinnerModule],
})
export class ProductsComponent implements OnInit {
  public productData: ProductsDTO[] = [];
  public ourFilteredProducts: ProductsDTO[] = [];
  public categoryFilteredProducts: ProductsDTO[] = [];
  public sortedProducts: ProductsDTO[] = [];

  searchText: any;
  currentPage: number = 1;
  totalItems: number = 0;
  limit: number = 8;
  selectedCategory: string = '';

  isActive: boolean = false;
  isLoading: boolean = true;

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private route: ActivatedRoute) {}

  toggleSidebar(){
    this.isActive = !this.isActive;
  }

  onPageChange(page: number){
    this.currentPage = page;
    this.updateCurrentProducts();
  }
  updateCurrentProducts(){
    const startIndex = (this.currentPage - 1) * this.limit;
    const endIndex = startIndex + this.limit;
    this.ourFilteredProducts = this.sortedProducts.slice(startIndex, endIndex);
  }

  filterProducts(category: string) {
    this.categoryFilteredProducts = this.productData.filter(product => product.productCategory === category);
    this.sortedProducts = this.categoryFilteredProducts.slice();
    this.totalItems = this.sortedProducts.length;
    this.currentPage = 1;
    this.updateCurrentProducts();
    this.selectedCategory = category;
  }

  showAllProducts() {
    this.categoryFilteredProducts = [];
    this.sortedProducts = this.productData.slice();
    this.currentPage = 1;
    this.totalItems = this.sortedProducts.length;
    this.updateCurrentProducts();
    this.selectedCategory = '';
  }

  filtersProducts() {
    if (!this.searchText) {
      this.ourFilteredProducts = this.productData;
    } else {
      this.ourFilteredProducts = this.productData.filter(product =>
        product.productName.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }

    this.totalItems = this.ourFilteredProducts.length;
    this.currentPage = 1;
    this.updateCurrentProducts();
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
    } else if (selectedValue === 'top') {
      this.sortData('rew');
    }
  }

  private sortData(order: string) {
    let productsToSort = this.sortedProducts.length > 0 ? this.sortedProducts : this.productData; //kontroluje ci ma produkty a ak hej tak assigne to tej novej array ak ak je sortedProducts prazdne tak to da productData

    if (order === 'lexp') {
      this.sortedProducts = productsToSort.sort((a, b) => a.price - b.price);
    } else if (order === 'mexp') {
      this.sortedProducts = productsToSort.sort((a, b) => b.price - a.price);
    } else if (order === 'isa') {
      this.sortedProducts = productsToSort.filter(product => product.quantity > 0);
      console.log(this.sortedProducts);
    } else if (order === 'asa') {
      this.showAllProducts();
    } else if(order === 'rew') {
      this.sortedProducts = productsToSort.sort((a, b) => b.averageStarRating - a.averageStarRating);
    }
    this.totalItems = this.sortedProducts.length;
    this.currentPage = 1;
    this.updateCurrentProducts();
  }

  getData() {
    this.http.get<ProductsDTO[]>(this.baseUrl + 'products').subscribe(result => {
      this.productData = result;
      this.isLoading = false;
      this.sortedProducts = this.productData;
      this.filtersProducts();
      this.totalItems = this.productData.length;
      this.updateCurrentProducts();
      this.route.queryParams.subscribe(params => {
        let tempCategory = params['category'];
        if(tempCategory){
          this.filterProducts(tempCategory);
        }else{
          this.showAllProducts();
        }
      })
    }, error => console.error(error));
  }

  @HostListener('window:scroll', []) 
  onWindowScroll(){ 
    const offset = window.pageYOffset;

    if(offset > 1){
      this.isActive = false;
    }
    else{
      this.isActive = false;
    }
  }

  ngOnInit(): void {
    this.searchText = localStorage.getItem('searchText') || '';

    this.getData();

    this.filtersProducts();

    localStorage.removeItem('searchText');
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
  averageStarRating: number;
  reviewsCount: number;
}
