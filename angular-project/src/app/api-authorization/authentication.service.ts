import { inject, Inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegistrationResponse, UserLogin, UserLoginResponse, UserRegistration } from './user-registration';
import { JwtHelperService } from '@auth0/angular-jwt';
import { FavoriteProductsService } from '../favorite-products/favorite-products.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private jwtHelper = inject(JwtHelperService);

  authenticated = signal(this.isAuthenticated());

  constructor(@Inject('BASE_URL') private baseUrl: string, private favoriteProductsService: FavoriteProductsService, private http: HttpClient) {  }

  registerUser(userData: UserRegistration): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(this.baseUrl + 'user/register', userData);
  }

  loginUser(userData: UserLogin): Observable<UserLoginResponse> {
    return this.http.post<UserLoginResponse>(this.baseUrl + 'user/login', userData);
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("adminLogged");

    this.authenticated.set(false);
    this.favoriteProductsService.countNum.set(0);
  }

  storeUserCredentials(token: string, username: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);

    this.authenticated.set(true);
  }

  storeAdminCredentials(adminLogged: boolean){
    localStorage.setItem('adminLogged', String(adminLogged));
  }
  
  getCurrentUser(){
    return this.http.get<UserDTO>(this.baseUrl + 'user/get-user');
  }

  getRole(userId: string): Observable<RoleDTO>{
    return this.http.get<RoleDTO>(this.baseUrl + `user/role/${userId}`);
  }

  public isAuthenticated() {
    const token = localStorage.getItem('token');

    return token && !this.jwtHelper.isTokenExpired(token);
  }
  public isAdminAuthenticated() {
    const adminLogged = localStorage.getItem('adminLogged');

    return Boolean(adminLogged);
  }
}
export interface UserDTO{
  userName: string;
  id: string;
  normalizedUserName: string;
  email: string;
  normalizedEmail: string;
  emailConfirmed: boolean;
  passwordHash: string;
  securityStamp: string;
  concurrencyStamp: string;
  phoneNumber: string | null;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  lockoutEnd: Date | null;
  lockoutEnabled: boolean;
  accessFailedCount: number;
}
export interface RoleDTO{
  id: number;
  name: string;
  normalizedName: string;
  concurrencyStamp: string;
}