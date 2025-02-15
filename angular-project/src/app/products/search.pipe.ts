import { Pipe, PipeTransform } from '@angular/core';
import { ProductsDTO } from './products.component';

@Pipe({
  name: 'search',
  standalone: true
})

export class SearchPipe implements PipeTransform {

  transform(value: ProductsDTO[], args?: any): any {
    if (!value) return null;
    if (!args) return value;

    args = args.toLowerCase();
    return value.filter(function (item) {
      return item.productName.toLowerCase().includes(args);
    });
  }
}
