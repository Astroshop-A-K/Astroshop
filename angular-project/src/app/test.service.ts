import { inject, Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TestService {
  private httpClient = inject(HttpClient);

  constructor(@Inject('BASE_URL') private baseUrl: string) { }

  getNames() {
    return this.httpClient.get<string[]>(this.baseUrl + 'home');
  }
}
