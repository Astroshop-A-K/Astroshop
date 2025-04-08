import { Component, Inject } from '@angular/core';
import { FormsModule, FormControl, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, DatePipe, NgFor, NgForOf } from '@angular/common';

@Component({
  selector: 'app-contact-page',
  templateUrl: './contact-page.component.html',
  styleUrls: ['./contact-page.component.css'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterLink, NgFor, NgForOf, DatePipe, CommonModule],
  providers: [DatePipe]
})

export class ContactPageComponent {
  public problemsData: ProblemsDTO[] = [];
  currentDate: number = 0;

  userMessage: string = '';
  charactersCount: number = 0;

  constructor(@Inject('BASE_URL') private baseUrl: string, private http: HttpClient, private datePipe: DatePipe, private snackBar: MatSnackBar, private router: Router) { }

  update(){
    this.charactersCount = this.userMessage.length;
  }

  contactForm = new FormGroup({
    nameSurname: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email, this.emailValidator]),
    problem: new FormControl('', Validators.required),
  });

  validateAllFormFields(formGroup: FormGroup){
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if(control?.invalid){
        control.markAsTouched(); 
      }
    })
  }

  onSubmit() {
    if (this.contactForm.valid) {
      let nameSurnameBE = this.contactForm.value.nameSurname ?? '';
      let emailBE = this.contactForm.value.email ?? '';
      let problemBE = this.contactForm.value.problem ?? '';

      let problemDateBE = this.datePipe.transform(new Date(), 'MMM d, yyyy, h:mm a');

      this.createProblem(nameSurnameBE, emailBE, problemBE, problemDateBE).subscribe(() => {
        this.router.navigate(['/home']);
        this.snackBar.open('Vaša správa bola úspešne odoslaná!', '', {duration: 1000});
      });
    }else{
      this.validateAllFormFields(this.contactForm);
      this.snackBar.open('Zadané údaje nie sú správne alebo polia označené hviezdičkou boli vynechané!', '', {duration: 2000});
    }
  }

  emailValidator(control: any) {
    const email = control.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //nastroj na overenie ci email splna zakladne poziadavky

    if (email && !emailRegex.test(email)) {
      return { invalidEmail: true };
    }
    return null;
  }

  createProblem(nameSurnameBE: string, emailBE: string, problemBE: string, problemDateBE: string) {
    const url = `${this.baseUrl}contact/create-problem`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(url, { NameSurname: nameSurnameBE, Email: emailBE, Problem: problemBE, ProblemDate: problemDateBE }, { headers });
  }
}
export interface ProblemsDTO {
  problemId: number;
  nameSurname: string;
  email: string;
  problem: string;
  problemDate: string;
  problemStatus: string;
  currentImageUrlIndex: number;
}

