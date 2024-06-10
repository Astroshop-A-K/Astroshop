import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

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

  range(start: number, end: number): number[]{
    return [...Array(end).keys()].map(el => el + start);
  }
  calculatePages(){
    const pagesCount = Math.ceil(this.total / this.limit);
    this.pages = this.range(1, pagesCount);
  }

  ngOnInit(): void {
    this.calculatePages();
  }
  ngOnChanges(): void {
    this.calculatePages();
  }
}
