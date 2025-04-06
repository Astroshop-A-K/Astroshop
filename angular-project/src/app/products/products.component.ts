import { Component, HostListener, inject, Inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgClass, NgFor, NgIf} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { PaginationComponent } from '../pagination/pagination.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { Analytics, logEvent, setAnalyticsCollectionEnabled } from '@angular/fire/analytics';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
  standalone: true,
  imports: [RouterLink, NgClass, NgIf, NgFor, FormsModule, StarRatingComponent, PaginationComponent, MatProgressSpinnerModule],
})
export class ProductsComponent implements OnInit {
  productData: ProductsDTO[] = [];
  ourFilteredProducts: ProductsDTO[] = [];
  categoryFilteredProducts: ProductsDTO[] = [];
  sortedProducts: ProductsDTO[] = [];

  searchText: any;
  currentPage: number = 1;
  totalItems: number = 0;
  limit: number = 8;

  selectedCategory: string = '';
  selectedSortOption: string = '';

  isActive: boolean = false;
  isLoading: boolean = true;

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private route: ActivatedRoute, private router: Router, private analytics: Analytics) {}

  toggleSidebar(){
    this.isActive = !this.isActive;
  }

  onPageChange(page: number){
    this.currentPage = page;
    this.updateCurrentProducts();
    this.scrollToTop();
  }
  updateCurrentProducts(){
    const startIndex = (this.currentPage - 1) * this.limit;
    const endIndex = startIndex + this.limit;
    this.ourFilteredProducts = this.sortedProducts.slice(startIndex, endIndex);
  }
  scrollToTop(){
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  filterProducts(category: string) {
    if(this.productData.length > 0){
      this.categoryFilteredProducts = this.productData.filter(product => product.productCategory === category);
      this.sortedProducts = this.categoryFilteredProducts.slice();
      this.totalItems = this.sortedProducts.length;
      this.currentPage = 1;
      this.updateCurrentProducts();
      this.selectedCategory = category;
      this.searchText = this.selectedSortOption = '';
      this.isActive = false;

      this.router.navigate([], {
        queryParams: { category: this.selectedCategory },
      });
    }
  }

  showAllProducts() {
    if(this.productData.length > 0){
      this.categoryFilteredProducts = [];
      this.sortedProducts = this.productData.slice();
      this.currentPage = 1;
      this.totalItems = this.sortedProducts.length;
      this.updateCurrentProducts();
      this.selectedCategory = '';
      this.searchText = this.selectedSortOption = '';
      this.isActive = false;

      this.router.navigate([], {
          queryParams: { category: null },
      });
    }
  }

  filtersProducts() {
    if (!this.searchText || this.searchText.trim() === '') {
      this.sortedProducts = this.selectedCategory ? this.categoryFilteredProducts : this.productData;
    } else {
      let productsToSearch = this.selectedCategory ? this.categoryFilteredProducts : this.productData;

      this.sortedProducts = productsToSearch.filter(product =>
        product.productName.toLowerCase().includes(this.searchText.toLowerCase())
      );

      this.selectedSortOption = '';
    }

    this.totalItems = this.sortedProducts.length;
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

    const getDiscountPrice = (product): number => {
      return product.productDiscount ? product.price * (1 - product.productDiscount / 100) : product.price;
    };

    if (order === 'lexp') {
      this.sortedProducts = productsToSort.sort((a, b) => getDiscountPrice(a) - getDiscountPrice(b));
    } else if (order === 'mexp') {
      this.sortedProducts = productsToSort.sort((a, b) => getDiscountPrice(b) - getDiscountPrice(a));
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

  getCategoryName(category: string): string {
    const categoryMap: { [key: string]: string } = {
        'TELE': 'Teleskopy',
        'MONT': 'Montáže',
        'BINO': 'Binokuláre',
        'OTHR': 'Ostatné'
    };
    return categoryMap[category] || category;
  }

  getData() {
    this.http.get<ProductsDTO[]>(this.baseUrl + 'products').subscribe(result => {
      this.productData = result;
      this.isLoading = false;
      this.sortedProducts = this.productData;
      this.totalItems = this.productData.length;
      this.updateCurrentProducts();
      this.route.queryParams.subscribe(params => {
        let tempCategory = params['category'];
        if(tempCategory){
          this.filterProducts(tempCategory);
        }else{
          
        }
        if (this.searchText) {
          this.filtersProducts();
        }
      })
    }, error => console.error(error));
  }

  ngOnInit(): void {
    this.getData();

    this.route.queryParams.subscribe(() => {
      const storedSearch = localStorage.getItem('searchText');
      const queryCategory = localStorage.getItem('category');
  
      if (storedSearch) {
        this.searchText = storedSearch;
        this.filtersProducts();
        localStorage.removeItem('searchText');

        this.router.navigate([], {
          queryParams: { searchText: null }, //vymazeme queryParams z aktualnej url preto dame [] to znamena current url
        });
      }
      if(queryCategory){
        this.filterProducts(queryCategory);
      }
    });

    setAnalyticsCollectionEnabled(this.analytics, true);

    logEvent(this.analytics, 'page_view', {
      page_location: window.location.href, 
      page_title: document.title, 
      page_path: window.location.pathname,
      screen_resolution: `${window.screen.width}x${window.screen.height}`, 
      screen_name: 'Produkty',
      referrer: document.referrer,
      history_length: history.length,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      device_pixel_ratio: window.devicePixelRatio,
    });
    logEvent(this.analytics, 'device_info', {
      language: navigator.language, 
      platform: navigator.platform,
      user_agent: navigator.userAgent, 
      screen_size: `${window.innerWidth}x${window.innerHeight}`,
      available_ram: (navigator as any).deviceMemory, 
      cpu_cores: navigator.hardwareConcurrency, 
      do_not_track: navigator.doNotTrack, 
      online: navigator.onLine, 
      max_touch_points: navigator.maxTouchPoints,
    });
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
  productDiscount: number;
}
