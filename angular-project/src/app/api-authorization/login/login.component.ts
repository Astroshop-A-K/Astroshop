import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthenticationService } from '../authentication.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(public authService: AuthenticationService, private router: Router){}

  login() {
    if (this.loginForm.valid) {
      this.authService.loginUser({...this.loginForm.value}).subscribe({
        next: (response) => {
          this.authService.storeUserCredentials(response.token, response.username);
          this.router.navigate(['/']);
        },
        error: (err) => console.log("Oops, something went wrong", err)
      });
    }
  }

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required]),
      password: new FormControl('', Validators.required)
    });
  }
}