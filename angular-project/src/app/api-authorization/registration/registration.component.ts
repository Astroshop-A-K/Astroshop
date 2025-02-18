import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { equalValuesValidator, passwordStrengthValidator } from '../password-validators';
import { Router, RouterLink } from '@angular/router';
import emailjs from 'emailjs-com';
import { user } from '@angular/fire/auth';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css'
})
export class RegistrationComponent implements OnInit {
  registerForm: FormGroup;

  constructor(public authService: AuthenticationService, private router: Router){}

  register() {
    if(this.registerForm.valid) {
      const userData = {
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
      }
      this.authService.registerUser(userData).subscribe({
        next: (response) => {
          let token = response.encodedToken;
          const emailParams = {
            to_email: this.registerForm.value.email,
            verification_link: `http://localhost:4200/verification/verify?token=${token}`,
            subject: 'Verify your email address'
          };
          emailjs.init('vvvXsO3WEU729fqbQ');
          emailjs.send('service_cleravy', 'template_s8wrvm5', emailParams);
          console.log(token);
          this.router.navigate(['/verification']);
        },
        error: (err: HttpErrorResponse) => console.log('Oops, something went wrong!', err)
      });
    }
  }

  ngOnInit(): void {
    this.registerForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', passwordStrengthValidator()),
      confirmPassword: new FormControl('', equalValuesValidator('password'))
    });
  }
}
