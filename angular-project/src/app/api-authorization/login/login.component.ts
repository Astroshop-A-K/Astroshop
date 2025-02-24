import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthenticationService } from '../authentication.service';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ResourceLoader } from '@angular/compiler';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  isAuthSuccessful: boolean = false;
  isLoading: boolean = false;

  constructor(public authService: AuthenticationService, private router: Router, private snackbar: MatSnackBar){}

  login() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.authService.loginUser({...this.loginForm.value}).subscribe(
        (response) => {
          if(response.isAuthSuccessful){
            this.authService.storeUserCredentials(response.token, response.username);
            this.router.navigate(['/home']).then(() => {
              this.authService.getRole(response.userId).subscribe((result) => {
                let role = result;
                if(role.name === 'admin'){
                  this.authService.storeAdminCredentials(true);
                  this.isLoading = false;
                }
              })
              this.snackbar.open("Prihlásovanie prebehlo úspešne!", "", { duration: 1500 });
            });
          }
        },(error) => {
          this.isLoading = false;

          this.loginForm.reset();
          this.loginForm.markAllAsTouched();

          this.snackbar.open("E-mailová adresa alebo heslo nie je správne!", "", { duration: 1500 });
          console.log('An error have occurred while trying to login.', error);
        } 
      );
    }else{
      this.snackbar.open("Zadané údaje nie sú správne alebo polia označené hviezdičkou boli vynechané!", "", { duration: 1500 });
      this.loginForm.markAllAsTouched();
    }
  }

  emailValidator(control: any) {
    const email = control.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email && !emailRegex.test(email)) {
      return { invalidEmail: true };
    }
    return null;
  }

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email, this.emailValidator]),
      password: new FormControl('', Validators.required)
    });
  }
}