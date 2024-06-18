import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ProductsDetailComponent } from '../products-detail/products-detail.component';
import { ProductsComponent } from '../products/products.component';
import { FavoriteProductsComponent } from '../favorite-products/favorite-products.component';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css'
})
export class PaginationComponent implements OnInit {
  @Input() currentPage: number = 1;
  @Input() total: number = 0;
  @Input() limit: number = 4;
  @Output() changePage = new EventEmitter<number>();

  pages: number[] = [];
  currentPPage: number = 1;
  p_page: ProductsComponent;

  constructor(private products: ProductsComponent){
    this.p_page = products;
  }

  range(start: number, end: number): number[]{
    return [...Array(end).keys()].map(el => el + start);
  }
  calculatePages(){
    const pagesCount = Math.ceil(this.total / this.limit);
    this.pages = this.range(1, pagesCount);
  }
  changePages(direction: string){
    if(direction == 'right'){
      if(this.p_page.currentPage < this.pages.length){
        this.p_page.currentPage++;
        this.p_page.updateCurrentProducts();
      } 
      else{
      }
    }
    else{
      if(this.p_page.currentPage > 1){
        this.p_page.currentPage--;
        this.p_page.updateCurrentProducts();
      } 
      else{
      }
    }
  }

  ngOnInit(): void {
    this.calculatePages();
  }
  ngOnChanges(): void {
    this.calculatePages();
  }
}
