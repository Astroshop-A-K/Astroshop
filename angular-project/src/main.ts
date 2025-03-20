import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { RegistrationComponent } from './app/api-authorization/registration/registration.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { LoginComponent } from './app/api-authorization/login/login.component';
import { DashboardComponent } from './app/dashboard/dashboard.component';
import { JwtModule } from '@auth0/angular-jwt';
import { errorHandlerInterceptor } from './app/api-authorization/error-handler.interceptor';
import { jwtInterceptor } from './app/api-authorization/jwt.interceptor';
import { HomeComponent } from './app/home/home.component';import { ProductsComponent } from './app/products/products.component';
import { ContactPageComponent } from './app/contact-page/contact-page.component';
import { ProductsDetailComponent } from './app/products-detail/products-detail.component';
import { ShoppingCartComponent } from './app/shopping-cart/shopping-cart.component';
import { OrderPageComponent } from './app/order-page/order-page.component';
import { OrderSummaryComponent } from './app/order-summary/order-summary.component';
import { UserOrdersComponent } from './app/user-orders/user-orders.component';
import { UserOrderDetailsComponent } from './app/user-order-details/user-order-details.component';
import { FavoriteProductsComponent } from './app/favorite-products/favorite-products.component';
import { authGuard } from './app/api-authorization/auth.guard';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAnalytics, provideAnalytics, ScreenTrackingService } from '@angular/fire/analytics';
import { VerificationComponent } from './app/verification/verification.component';
import { unauthGuard } from './app/api-authorization/unauth.guard';
import { guestGuard } from './app/api-authorization/guest.guard';


export function getBaseUrl() {
  return 'https://astroshop.bsite.net/api/'; //test
}

export function tokenGetter() {
  return localStorage.getItem("token");
}

const providers = [
  { provide: 'BASE_URL', useFactory: getBaseUrl, deps: [] }
];

bootstrapApplication(AppComponent, {
    providers: [
      providers,
      importProvidersFrom(BrowserModule, JwtModule.forRoot({
        config: {
          tokenGetter: tokenGetter,
          allowedDomains: ['https://localhost:7186/', 'https://astroshop.bsite.net/api/'],
          disallowedRoutes: [],
        },
      })),
      provideAnimations(),
      provideHttpClient(withInterceptors([errorHandlerInterceptor, jwtInterceptor])),
      provideRouter([
        { path: '', component: HomeComponent },
        { path: 'login', component: LoginComponent, canActivate: [guestGuard]} ,
        { path: 'register', component: RegistrationComponent, canActivate: [guestGuard]},
        { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard]},
        { path: 'home', component: HomeComponent },
        { path: 'products', component: ProductsComponent },
        { path: 'favorite-products', component: FavoriteProductsComponent, canActivate: [authGuard]},
        { path: 'contact', component: ContactPageComponent },
        { path: 'products/:productName', component: ProductsDetailComponent },
        { path: 'shopping-cart', component: ShoppingCartComponent },
        { path: 'order', component: OrderPageComponent },
        { path: 'order/order-summary', component: OrderSummaryComponent },
        { path: 'user-orders', component: UserOrdersComponent, canActivate: [authGuard] },
        { path: 'user-orders/:orderId', component: UserOrderDetailsComponent, canActivate: [authGuard] },
        { path: 'verification', component: VerificationComponent },
        { path: 'verification/:token', component: VerificationComponent, canDeactivate: [unauthGuard] },
        { path: '', redirectTo: '/home', pathMatch: 'full' }, // default redirect
      ]), provideFirebaseApp(() => initializeApp({"projectId":"astroshopsoc","appId":"1:856605368007:web:0a261edcfb9baacf03e8e2","storageBucket":"astroshopsoc.firebasestorage.app","apiKey":"AIzaSyDx3F1BMXOwJwr96wwmk65eAImd9TsPkpc","authDomain":"astroshopsoc.firebaseapp.com","messagingSenderId":"856605368007","measurementId":"G-PXMJCTGV77"})), provideAnalytics(() => getAnalytics()), ScreenTrackingService
    ]
})
  .catch(err => console.error(err));
