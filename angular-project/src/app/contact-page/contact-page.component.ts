import { Component, Inject, NgModule } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, FormControl, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contact-page',
  templateUrl: './contact-page.component.html',
  styleUrls: ['./contact-page.component.css'],
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule],
  providers: [MatSnackBar]
})

export class ContactPageComponent {

  constructor(@Inject('BASE_URL') private baseUrl: string, private http: HttpClient, private router: Router, private _snackBar: MatSnackBar) { }

  contactForm = new FormGroup({
    nameSurname: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email, this.emailValidator]),
    problem: new FormControl('', Validators.required),
  });
  onSubmit() {
    console.log(this.contactForm.value);
    if (this.contactForm.valid) {
      let nameSurnameBE = this.contactForm.value.nameSurname ?? '';
      let emailBE = this.contactForm.value.email ?? '';
      let problemBE = this.contactForm.value.problem ?? '';

      this.createProblem(nameSurnameBE, emailBE, problemBE).subscribe();
      //this._snackBar.open("Succes!", "Redirecting...", { duration: 2000, });
      this.router.navigate(['/home']);
    }
  }
  emailValidator(control: any) {
    const email = control.value;
    if (email && email.indexOf('@') === -1 && email.indexOf('.') === -1) {
      return { invalidEmail: true };
    }
    return null;
  }
  createProblem(nameSurnameBE: string, emailBE: string, problemBE: string) {
    const url = `${this.baseUrl}contact/create`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(url, { NameSurname: nameSurnameBE, Email: emailBE, Problem: problemBE }, { headers });
  }
}
export interface ProblemsDTO {
  nameSurname: string;
  email: string;
  problem: string;
}

