import { Component, inject, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthenticationService } from '../authentication.service';
import { AsyncPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FavoriteProductsService } from 'src/app/favorite-products/favorite-products.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatButton,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    AsyncPipe,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  authService = inject(AuthenticationService);
  private router = inject(Router);

  loginForm: FormGroup;
  adminAuthenticated: boolean = false;

  constructor(){}

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required]),
      password: new FormControl('', Validators.required)
    });
  }

  login() {
    if (this.loginForm.valid) {
      this.authService.loginUser({...this.loginForm.value}).subscribe({
        next: (response) => {
          this.authService.storeUserCredentials(response.token, response.username);
          this.router.navigate(['/']);
          this.adminAuthenticated = true;
        },
        error: (err) => console.log("Oops, something went wrong", err)
      });
    }
  }
}