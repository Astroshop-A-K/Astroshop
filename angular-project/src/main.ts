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


export function getBaseUrl() {
  return 'https://astroshop.bsite.net/api/';
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
        { path: '', component: HomeComponent},
        { path: 'login', component: LoginComponent},
        { path: 'register', component: RegistrationComponent},
        { path: 'dashboard', component: DashboardComponent},
        { path: 'home', component: HomeComponent },
        { path: 'products', component: ProductsComponent },
        { path: 'contact', component: ContactPageComponent },
        { path: 'products/:productName', component: ProductsDetailComponent },
        { path: 'shopping-cart', component: ShoppingCartComponent},
        { path: 'order', component: OrderPageComponent},
        { path: 'order/order-summary', component: OrderSummaryComponent},,
        { path: 'user-orders', component: UserOrdersComponent},
        { path: 'user-orders/:orderId', component: UserOrderDetailsComponent },
        { path: 'favorite-products', component: FavoriteProductsComponent},
        { path: '', redirectTo: '/home', pathMatch: 'full' }, // default redirect
      ])
    ]
})
  .catch(err => console.error(err));
