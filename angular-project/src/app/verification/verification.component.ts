import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import emailjs from 'emailjs-com';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [],
  templateUrl: './verification.component.html',
  styleUrl: './verification.component.css'
})
export class VerificationComponent {
  verificationStatus: string = '';

  constructor(@Inject('BASE_URL') private baseUrl: string, private http: HttpClient, private route: ActivatedRoute){}

  sendVerificationEmail(userEmail: string, verificationToken){
    const emailParams = {
      to_email: userEmail,
      verification_link: `http://localhost:4200/verification/verify?token=${verificationToken}`,
      subject: 'Verify your email address'
    };
    emailjs.init('vvvXsO3WEU729fqbQ');
    emailjs.send('service_cleravy', 'template_s8wrvm5', emailParams);
  }

  verifyEmail(token: string): Observable<any>{
    const url = `${this.baseUrl}/user/verify`;
    const params = new HttpParams().set('token', token);
    return this.http.get(url, { params });
  }

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if(token){
      this.verifyEmail(token).subscribe(() => {
        this.verificationStatus = 'Email successfully verified!';
      }, (error) => {
        console.error('Verification failed. Invalid or expired token.', error);
      });
    }else{
      
      this.verificationStatus = 'Invalid token.';
    }
  }
}
