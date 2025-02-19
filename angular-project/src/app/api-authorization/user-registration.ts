export interface UserRegistration {
  email: string,
  password: string,
  recaptchaResponse: string;
}

export interface RegistrationResponse {
  isSuccessfulRegistration: boolean;
  errors: string[];
  encodedToken: string;
  username: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserLoginResponse {
  isAuthSuccessful: boolean;
  errorMessage: string;
  userId: string;
  token: string;
  username: string;
}