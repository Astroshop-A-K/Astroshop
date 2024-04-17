import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { ProductsDetailComponent } from '../products-detail/products-detail.component';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './star-rating.component.html',
  styleUrl: './star-rating.component.css'
})
export class StarRatingComponent {
  faStar = faStar;
  @Input() rating: number = 0;
  @Input() readOnly: boolean = false;
  @Output() ratingChange: EventEmitter<number> = new EventEmitter<number>();

  productRating: number = 0;

  constructor(){}

  setRating(value: number){
    if(this.readOnly){
      return;
    }
    this.rating = value;
    this.ratingChange.emit(this.rating); 
  }
}
