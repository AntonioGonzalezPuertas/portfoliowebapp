import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProfilesService } from './profiles.service'; // Import the ProfileService
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userInfoSubject = new BehaviorSubject<any>(null); // Holds user information
  public profile$ = this.userInfoSubject.asObservable();

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private profileService = inject(ProfilesService); // Inject the ProfileService
  private isSignUpSubject = new BehaviorSubject<boolean>(false);
  public enabledSignUp$ = this.isSignUpSubject.asObservable();

  private token: string | null = null; // Holds the authentication token
  private sessionId: string = ''; // Holds the session ID

  constructor() {}

  get isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }
  set isLoggedIn(value: boolean) {
    this.isLoggedInSubject.next(value);
  }

  get isSignUp(): boolean {
    return this.isSignUpSubject.value;
  }
  set isSignUp(value: boolean) {
    this.isSignUpSubject.next(value);
  }

  async authUser(email: string, password: string): Promise<any> {
    const result: any = await this.profileService.authProfile(email, password);
    if (result) {
      this.isLoggedInSubject.next(true);
    }

    return result; // Return the profile object if authentication is successful
  }

  async logout(): Promise<any> {
    const result: any = await this.profileService.logout(
      this.sessionId,
      this.token
    );
    if (result) {
      this.isLoggedInSubject.next(false);
    }
    return result; // Return the profile object if authentication is successful
  }

  getToken(): string | null {
    return this.token;
  }

  setProfileInfo(userInfo: any, token?: string, sessionId?: string): void {
    if (token !== undefined) {
      this.token = token;
    }
    if (sessionId !== undefined) {
      this.sessionId = sessionId;
    }
    this.userInfoSubject.next(userInfo);
  }

  getProfileInfo(): any {
    return this.userInfoSubject.value;
  }

  async sendResetPasswordEmail(email: string): Promise<any> {
    const result: any = await this.profileService.sendResetPasswordEmail(email);
    if (result) {
      return result; // Return the result of sending the reset password email
    } else {
      throw new Error('Failed to send reset password email');
    }
  }
}
