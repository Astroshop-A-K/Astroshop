import { Component, OnInit } from '@angular/core';
import { MainNavComponent } from './main-nav/main-nav.component';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [MainNavComponent, RouterOutlet, CommonModule, FormsModule],
})
export class AppComponent {
  title = 'angular-project';
  searchText: string = '';

  constructor(private router: Router){
    this.searchText = '';
  }

  onSearch(){
    if(this.searchText){
      localStorage.setItem('searchText', this.searchText);
      this.router.navigate(['/products']);
    }else{
      this.router.navigate(['/products']);
    }
  }
}
