import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormsModule, FormControl, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationService, RoleDTO, UserDTO } from '../api-authorization/authentication.service';
import { CommonModule, DatePipe, NgFor, NgForOf } from '@angular/common';

@Component({
  selector: 'app-contact-page',
  templateUrl: './contact-page.component.html',
  styleUrls: ['./contact-page.component.css'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterLink, NgFor, NgForOf, DatePipe, CommonModule],
  providers: [DatePipe]
})

export class ContactPageComponent implements OnInit {
  public problemsData: ProblemsDTO[] = [];
  currentDate: number = 0;

  authService = inject(AuthenticationService);
  user: UserDTO;
  role: RoleDTO;
  roleName: string = '';

  imageUrls: string[] = [
    "https://www.freeiconspng.com/uploads/x-png-22.png",
    "https://www.iconpacks.net/icons/2/free-check-icon-3278-thumb.png"
  ];

  currentImageUrlIndex: number = 1;
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

      this.createProblem(nameSurnameBE, emailBE, problemBE, problemDateBE).subscribe();
      this.router.navigate(['/home']);

      this.snackBar.open('Vaša správa bola úspešne odoslaná!', '', {duration: 1000});
    }else{
      this.validateAllFormFields(this.contactForm);
      this.snackBar.open('Zadané údaje nie sú správne alebo polia označené hviezdičkou boli vynechané!', '', {duration: 2000});
    }
  }
  changeStatus(problemId: number){
    this.changeProblemStatus(problemId).subscribe();
    const problem = this.problemsData.find(p => p.problemId === problemId);
    problem.currentImageUrlIndex = 1;
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
    const url = `${this.baseUrl}contact/create`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(url, { NameSurname: nameSurnameBE, Email: emailBE, Problem: problemBE, ProblemDate: problemDateBE }, { headers });
  }
  changeProblemStatus(problemId: number){
    const url = `${this.baseUrl}contact/changeProblemStatus/${problemId}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(url, { ProblemId: problemId}, { headers });
  }
  getProblems(){
    return this.http.get<ProblemsDTO[]>(this.baseUrl + 'contact');
  }

  ngOnInit(): void {
    if(this.authService.authenticated()){
      this.authService.getCurrentUser().subscribe(result =>{
          this.user = result;
          this.authService.getRole(this.user.id).subscribe(result => {
              this.role = result;
              if(this.role != null){
                  this.roleName = this.role.name;
              }
          })
      })
   }

   this.getProblems().subscribe(result => {
    this.problemsData = result.map(problem => ({
      ...problem, //arrow function
      currentImageUrlIndex: problem.currentImageUrlIndex ?? 0 //vrati nulu ak je null / undefined to dava tomu povodnemu objektu
    })
    )
   })
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

