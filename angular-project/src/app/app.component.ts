import { Component, Inject, OnInit } from '@angular/core';
import { MainNavComponent } from './main-nav/main-nav.component';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule, AsyncPipe } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ProductsDTO } from './shopping-cart/cart.service';
import { map, Observable, startWith } from 'rxjs';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Analytics, getAnalytics, logEvent, setAnalyticsCollectionEnabled } from '@angular/fire/analytics';
import { initializeApp } from '@angular/fire/app';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [MainNavComponent, RouterOutlet, CommonModule, FormsModule, FormsModule, MatAutocompleteModule, ReactiveFormsModule, AsyncPipe, RouterLink],
})
export class AppComponent implements OnInit{
  title = 'angular-project';
  searchText: string = '';

  productsData: ProductsDTO[] = [];
  searchBar = new FormControl('');
  filteredProducts: Observable<ProductsDTO[]>;

  isHidden: boolean = false;

  constructor(private router: Router, private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private snackBar: MatSnackBar, private analytics: Analytics){}

  acceptCookies(){
    localStorage.setItem('cookiesAccepted', 'true');
    this.isHidden = true;
  }
  declineCookies(){
    localStorage.setItem('cookiesAccepted', 'false');
    this.isHidden = true;
  }

  onSearch(){
    if(this.searchText.trim()){
      localStorage.setItem('searchText', this.searchText);
      if(this.router.url === '/products'){
        window.location.reload();
      }else{
        this.router.navigate(['/products']); //, {  queryParams: {searchText: this.searchText },
      }
      this.searchText = '';
    }else{
      this.snackBar.open("Prosím zadajte hodnotu pre vyhľadávanie!", "", { duration: 1500, }); 
    }
  }
  private filterProducts(value: string): ProductsDTO[]{
    const filteredValue = this.normalizeValue(value);
    return this.productsData.filter(product => this.normalizeValue(product.productName).includes(filteredValue));
  }
  private normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, ''); // /\s/g da prec prazdne miesta
  }

  onProductSelected(product: ProductsDTO){
    this.searchBar.setValue(product.productName);

    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => { //celkovo metoda spravi ze vynuti reloadnutie stranky v Angular aj ked sme na rovnakom komponente ale davame do URL adresy ine parametre a skipLocationChange: true, zabezpeci ze sa ta URL nezmeni a "/" je jako medziciel nech spravime Angular mysliet ze sme opustili stranku celkovo tento trik resetuje routing.
      this.router.navigate(['/products', product.productCategory, product.productName]);
    })

    this.filteredProducts = this.searchBar.valueChanges.pipe(
      startWith(''),
      map(value => value ? this.filterProducts(value) : [])
    );
  }

  getData(){
    this.http.get<ProductsDTO[]>(this.baseUrl + 'products').subscribe(result => {
      this.productsData = result;
    })
  }

  ngOnInit(): void {
    let cookiesAccepted = JSON.parse(localStorage.getItem('cookiesAccepted'));
    if(cookiesAccepted){
      this.isHidden = true;
    }

    this.searchText = '';
    
    this.getData();

    this.filteredProducts = this.searchBar.valueChanges.pipe(
      startWith(''), //ma zacinat ako empty string ked zacina ten input cez pipe prichadzat
      map(value => {
        if(!value){
          return [];
        }else{
          return this.filterProducts(value || '');
        }
      }),
    );
    
    this.router.events.subscribe((event) => {
      if(event instanceof NavigationEnd) {
        logEvent(this.analytics, 'page_view', { page: event.urlAfterRedirects });
      }
    })
  }
}