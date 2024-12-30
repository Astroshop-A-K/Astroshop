import { Component, Inject, OnInit, inject, signal} from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase, DatePipe, ViewportScroller } from '@angular/common';
import { CartService } from '../shopping-cart/cart.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { AuthenticationService, RoleDTO, UserDTO } from '../api-authorization/authentication.service';
import { ProductsDTO } from '../shopping-cart/cart.service';
import { MainNavComponent } from '../main-nav/main-nav.component';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FavoriteProductsService } from '../favorite-products/favorite-products.service';

@Component({
    selector: 'app-products-detail',
    templateUrl: './products-detail.component.html',
    styleUrls: ['./products-detail.component.css'],
    standalone: true,
    imports: [NgIf, NgFor, NgClass, NgSwitch, NgSwitchCase, ReactiveFormsModule, RouterLink, StarRatingComponent, DatePipe, FontAwesomeModule],
    providers: [MatSnackBar, StarRatingComponent, DatePipe, MainNavComponent]
})
export class ProductsDetailComponent implements OnInit {
    public productInfo: ProductsDTO = { //namiesto array vytvorim objekt, ktory ma ProductsDTO interface 
        productId: 0,
        productName: '',
        productDescription: '',
        price: 0,
        productCategory: '',
        productImage0: '',
        productImage1: '',
        productImage2: '',
        quantity: 0,
        averageStarRating: 0,
        reviewsCount: 0,
        amount: 0,
        productDiscount: 0
    }; 
    public productName: string = '';
    public currentImagePosition: number = 0;
    public currentPageURL: string = '';

    public reviewsData: ReviewsDTO[] = [];
    reviewCreator: string = '';
    sharingReviewText: string = '';
    repeatedReviewCreator: boolean = false;

    productRating: number = 0;

    averageStarRatingSignal = signal(0);
    reviewsCountSignal = signal(0);

    authService = inject(AuthenticationService);
    user: UserDTO;
    role: RoleDTO;
    roleName: string = '';

    currentDate: string = '';

    favoriteProductsData: ProductsDTO[] = [];
    favoriteProductExists: boolean = false;
    faHeart = faHeart;
    isClicked: boolean;

    charactersCount: number = 0;
    userMessage: string = '';

    isLoading: boolean = true;

    constructor(private http: HttpClient, private FProductsService: FavoriteProductsService, @Inject('BASE_URL') private baseUrl: string, private router: Router, private route: ActivatedRoute, private CartService: CartService, private snackBar: MatSnackBar, private StarRating: StarRatingComponent, private datePipe: DatePipe, private viewportScroller: ViewportScroller) {}

    reviewForm = new FormGroup({
        reviewComment: new FormControl('', Validators.required),
    });

    scrollToRating(){
        this.viewportScroller.scrollToAnchor('review-form-id'); //mimo hash navigacii co funguje pri vanilla HTML a JS tak tu nas nepresmeruje na home page kedze nemame akoby default trasu a Angular pouziva to tak ze do URL da ten hash a to nas da na home page kedze nemame ziadnu defaultnu trasu nastavenu, t.j. puzijeme tento import on angularu viewportScroller a tak sa scrollneme dole.
    }

    update(){
        this.charactersCount = this.userMessage.length;
    }
    
    addToCart(){
        if(this.productInfo.quantity > 0){
            this.CartService.addToCart(this.productInfo);
        }
        else{
            this.snackBar.open("This product is not avaiable!", "", { duration: 1500, }); 
        }
    }

    addToFavorite(){
        if(this.authService.authenticated()){
            let userId = this.user.id;
            if(!this.favoriteProductExists){
                this.isClicked = true;
                this.FProductsService.addFavoriteProduct(this.productInfo.productId, userId).subscribe();
                this.favoriteProductExists = true;
            }
            else{
                this.isClicked = false;
                this.favoriteProductExists = false;
                this.FProductsService.removeFavoriteProduct(userId, this.productInfo.productId).subscribe();
            }
        }
        else{
            this.router.navigate(['/login']);
        }
    }
    checkFavoriteProduct() : boolean{
        if(this.authService.authenticated()){
            if(this.favoriteProductsData){
              return this.favoriteProductsData.some(p => p.productName === this.productInfo.productName); //vrati true ak sa najde
            }
        }
        return false;
    }

    positionLeft(){
        if(this.currentImagePosition > 0){
            this.currentImagePosition -= 1;
        }
        else{
            this.currentImagePosition = 2;
        }
    }
    positionRight(){
        if(this.currentImagePosition < 2){
            this.currentImagePosition += 1;
        }
        else{
            this.currentImagePosition = 0;
        }
    }
    setImagePosition(position: number){
        this.currentImagePosition = position;
    }

    shareReview(reviewCreator: string, reviewComment: string, reviewDate: string){
        this.sharingReviewText = `<${reviewCreator}> wrote: <${reviewComment}> on <${reviewDate}>`;

        const textArea = document.createElement('textarea');

        textArea.value = this.sharingReviewText;

        document.body.appendChild(textArea);

        textArea.focus();
        textArea.select();

        document.execCommand('copy');
        this.snackBar.open("Copied!", "", { duration: 1500, }); 

        document.body.removeChild(textArea);
    }

    onSubmit(){
        if(this.authService.authenticated()){
            const repeatedReviewCreator = this.reviewsData.find(r => r.reviewCreator === this.reviewCreator);
        if(!repeatedReviewCreator){
            if(this.reviewForm.valid && this.productRating > 0){
                const routeParams = this.route.snapshot.paramMap;
                this.productName = String(routeParams.get('productName'));
    
                let reviewComment = this.reviewForm.value.reviewComment;
                let starRating = this.productRating;
    
                let averageStarRating = 0;
                let reviewsCount = 0;
    
                this.createReview(reviewComment, this.reviewCreator, this.productName, starRating, this.currentDate).subscribe(newReview =>{
                    const reviewDto: ReviewsDTO = newReview as ReviewsDTO; //povedat newReview ze je typu ReviewsDTO
                    this.reviewsData.push(reviewDto);
    
                    if(this.reviewsData.length > 0){
                        averageStarRating = Math.round(this.reviewsData.reduce((acc, review) => acc + review.starRating, 0) / this.reviewsData.length); //call back funkcia
                        this.averageStarRatingSignal.update(value => averageStarRating);
                    }
                    reviewsCount = this.reviewsData.length;
                    this.reviewsCountSignal.update(value => this.reviewsData.length);
                    this.updateAverageStarRating(this.productName, averageStarRating, reviewsCount).subscribe();
                    this.getReviews(this.productName).subscribe(result => {
                        this.reviewsData = result;
                        this.filterReviews();
                    });
                    this.snackBar.open("Your review was successfully created!", "", { duration: 1500, }); 
                }
                );
    
                this.reviewForm.reset();
                this.productRating = 0;
                this.userMessage = '';
            }
        }
        else{
            this.snackBar.open("You already have a review here!", "", { duration: 1500, })
        }
        }
        else{
            this.router.navigate(['/login']);
        }
    }

    removeReview(reviewId: number){
        let averageStarRating = 0;
        let reviewsCount = 0;

        if(reviewId != null){
            this.deleteReview(reviewId).subscribe(
                () => {
                    const index = this.reviewsData.findIndex(review => review.reviewId === reviewId);
                    this.reviewsData.splice(index, 1);

                    if(this.reviewsData.length > 0){
                        averageStarRating = Math.round(this.reviewsData.reduce((acc, review) => acc + review.starRating, 0) / this.reviewsData.length); //call back funkcia
                        this.averageStarRatingSignal.update(value => averageStarRating);
                    }

                    this.snackBar.open("Your review was successfully removed!", "", { duration: 1500, }); 

                    reviewsCount = this.reviewsData.length;
                    this.reviewsCountSignal.update(value => this.reviewsData.length);
                    this.updateAverageStarRating(this.productName, averageStarRating, reviewsCount).subscribe();
                }
            );
        }
    }

    refreshData(){
        const routeParams = this.route.snapshot.paramMap;
        this.productName = String(routeParams.get('productName'));

        let averageStarRating = 0;
        let reviewsCount = 0;
        
        if(this.reviewsData.length > 0){
            averageStarRating = Math.round(this.reviewsData.reduce((acc, review) => acc + review.starRating, 0) / this.reviewsData.length); //call back funkcia
            this.averageStarRatingSignal.update(value => averageStarRating);
        }
        reviewsCount = this.reviewsData.length;
        this.reviewsCountSignal.update(value => this.reviewsData.length);

        this.updateAverageStarRating(this.productName, averageStarRating, reviewsCount).subscribe();
    }

    onRatingChange(rating: number) {
        this.productRating = rating;
    }

    filterReviews(){
        const index = this.reviewsData.findIndex(r => r.reviewCreator === this.reviewCreator);
        if(index !== -1){
            const review = this.reviewsData.splice(index, 1)[0];
            this.reviewsData.unshift(review);
        }
    }

    createReview(reviewCommentBE: string, reviewCreatorBE: string, reviewdProductBE: string, starRatingBE: number, reviewDateBE: string) {
        const url = `${this.baseUrl}reviews/create-review`;
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        return this.http.put(url, { ReviewComment: reviewCommentBE, ReviewCreator: reviewCreatorBE, ReviewedProduct: reviewdProductBE, StarRating: starRatingBE, ReviewDate: reviewDateBE }, { headers });
    }

    getReviews(productName: string): Observable<ReviewsDTO[]> { 
        let queryParams = new HttpParams();
        queryParams = queryParams.append("productName", productName);
        return this.http.get<ReviewsDTO[]>(this.baseUrl + 'reviews/getReviews', { params: queryParams });
    }
    getCurrentReview(reviewId: number): Observable<ReviewsDTO>{
        let queryParams = new HttpParams();
        queryParams = queryParams.append("reviewId", reviewId);
        return this.http.get<ReviewsDTO>(this.baseUrl + 'reviews/getCurrentReview', { params: queryParams});
    }

    deleteReview(reviewId: number): Observable<any>{
        const url = `${this.baseUrl}reviews/${reviewId}`;
        return this.http.delete(url);
    }
    
    getProductInfo(productName: string): Observable<ProductsDTO> { 
        let queryParams = new HttpParams();
        queryParams = queryParams.append("productName", productName);
        return this.http.get<ProductsDTO>(this.baseUrl + 'products/getProductInfo', { params: queryParams });
    }
    updateAverageStarRating(productNameBE: string, ratingBE: number, reviewsCountBE: number){
        const url = `${this.baseUrl}products/update-rating`;
        const headers = new HttpHeaders({'Content-Type': 'application/json' });
        return this.http.put(url, { ProductName: productNameBE, Rating: ratingBE, ReviewsCount: reviewsCountBE }, { headers });
    }

    ngOnInit(): void {
        const routeParams = this.route.snapshot.paramMap;
        this.productName = String(routeParams.get('productName'));

        this.getProductInfo(this.productName).subscribe(
            result => {
                this.productInfo = result;
                this.isLoading = false;
            },
            error => console.error(error)
        );
        this.getReviews(this.productName).subscribe(
           result => {
               this.reviewsData = result;
               this.refreshData();
               if(this.authService.authenticated()){
                this.authService.getCurrentUser().subscribe(result =>{
                    this.user = result;
                    this.reviewCreator = this.user.userName;
                    this.filterReviews();
                    this.authService.getRole(this.user.id).subscribe(result => {
                        this.role = result;
                        if(this.role != null){
                            this.roleName = this.role.name;
                        }
                    })
                    this.FProductsService.getFavoriteProducts(this.user.id).subscribe(result => {
                        this.favoriteProductsData = result;
                        if(this.checkFavoriteProduct()){
                            this.favoriteProductExists = true;
                        }
                        else{
                            this.favoriteProductExists = false;
                        }
                    })
                })
            }
           },
           error => console.error(error)
        );
        this.currentDate = this.datePipe.transform(new Date(), 'MMM d, y, h:mm a');
    }
}
export interface ReviewsDTO{
    reviewId: number;
    reviewComment: string;
    reviewCreator: string;
    reviewedProduct: string;
    starRating: number;
    reviewDate: string;
}