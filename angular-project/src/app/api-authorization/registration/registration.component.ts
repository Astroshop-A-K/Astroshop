import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { equalValuesValidator, passwordStrengthValidator } from '../password-validators';
import { Router, RouterLink } from '@angular/router';
import emailjs from 'emailjs-com';
import { RecaptchaComponent, RecaptchaModule } from 'ng-recaptcha';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, RecaptchaModule, CommonModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css'
})
export class RegistrationComponent implements OnInit {
  registerForm: FormGroup;

  captcha: string = '';
  recaptchaDone: boolean = false;
  @ViewChild(RecaptchaComponent) recaptchaComponent!: RecaptchaComponent;

  constructor(public authService: AuthenticationService, private router: Router, private snackBar: MatSnackBar){}

  resolved(captchaResponse: string){
    this.captcha = captchaResponse;
    this.recaptchaDone = true;
  }

  validateForm(){
    this.registerForm.reset();
    this.registerForm.markAllAsTouched();
  }

  emailValidator(control: any) {
    const email = control.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email && !emailRegex.test(email)) {
      return { invalidEmail: true };
    }
    return null;
  }

  register() {    
    if(this.registerForm.valid && this.recaptchaDone && (this.registerForm.value.password === this.registerForm.value.confirmPassword)) {
      const userData = {
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        recaptchaResponse: this.captcha
      }
      this.authService.registerUser(userData).subscribe(
        (response) => {
          let token = response.encodedToken;
          const emailParams = {
            to_email: this.registerForm.value.email,
            verification_link: `http://astroshopsoc.web.app/verification/verify?token=${token}`,
            subject: 'Overte vašu e-mailovú adresu'
          };
          emailjs.init('vvvXsO3WEU729fqbQ');
          emailjs.send('service_cleravy', 'template_s8wrvm5', emailParams);
          this.router.navigate(['/verification']);
        },(error) => {
          console.log('An error have occurred while trying to register.', error);
          if(error.errorMessage = 'This user already exists'){
            this.snackBar.open("Používateľ so zadaným e-mailom už existuje!", "", { duration: 2000, });
            this.validateForm();
          }
        },
      );
    }else if(this.registerForm.value.password !== this.registerForm.value.confirmPassword){
      this.snackBar.open("Heslá sa nezhodujú!", "", { duration: 1500, });
      this.registerForm.markAllAsTouched();
    }else if(!this.recaptchaDone){
      this.snackBar.open("Zabudli ste na overenie reCAPTCHA!", "", { duration: 2000, });
    }else if(this.registerForm.controls['password'].errors){
      this.snackBar.open("Heslo musí obsahovať veľké písmeno, malé písmeno, číslo a špeciálny znak!", "", { duration: 2000 });
    }else{
      this.snackBar.open("Zadané údaje nie sú správne alebo polia označené hviezdičkou boli vynechané!", "", { duration: 1500 });
    }
  }

  ngOnInit(): void {
    this.registerForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email, this.emailValidator]),
      password: new FormControl('', [Validators.required, passwordStrengthValidator()]),
      confirmPassword: new FormControl('', [Validators.required, equalValuesValidator('password')])
    });
  }
}
