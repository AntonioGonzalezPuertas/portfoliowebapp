import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  IonContent,
  IonNavLink,
  IonButton,
  ModalController,
  ToastController,
} from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';
import { ProfilesService } from 'src/app/services/profiles.service';
import { ForgotPasswordModalComponent } from '../forgot-password-modal/forgot-password-modal.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    IonContent,
    IonButton,
    IonNavLink,
  ],
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private profilesService: ProfilesService = inject(ProfilesService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private activatedRoute = inject(ActivatedRoute);
  public loginForm: FormGroup;
  public isSignUp: boolean = false; // Flag to toggle between login and signup
  private modalCtrl = inject(ModalController);
  private toastController = inject(ToastController);

  constructor() {
    addIcons({ arrowBackOutline });
    this.loginForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]], // Email field with validation
      password: ['', [Validators.required, Validators.minLength(4)]], // Password field with validation
    });
    this.loginForm.get('name')?.disable(); // Disable the name field
  }

  public ngOnInit() {
    this.clearForm(); // Clear the form when the component is initialized

    this.activatedRoute.queryParams.subscribe((params) => {
      if (params['reload']) {
        this.clearForm(); // Clear the form if "reload" is present in query params
      }
    });

    this.authService.enabledSignUp$.subscribe((isSignUp) => {
      this.clearForm(); // Clear the form when the sign-up state changes
      if (isSignUp) {
        this.isSignUp = true; // Set the flag to false to show the login form
        this.loginForm.get('name')?.enable(); // Disable the name field
      } else {
        this.isSignUp = false; // Set the flag to false to show the login form
        this.loginForm.get('name')?.disable(); // Disable the name field
      }
    });
  }

  public async onSubmit(): Promise<void> {
    if (this.loginForm.valid) {
      const formData = this.loginForm.value;

      if (this.isSignUp) {
        this.onSignUp(formData);
      } else {
        this.onLogIn(formData);
      }
    } else {
      console.log('Form is invalid');
      this.showError('Form is invalid. Please check your input.');
    }
  }

  private async onLogIn(formData: any): Promise<void> {
    try {
      const result = await this.authService.authUser(
        formData.email,
        formData.password
      );
      if (result) {
        let profile = await this.profilesService.getProfilesById(
          result.user.id
        );
        this.authService.setProfileInfo(profile);
        this.router.navigate(['/tabs/account/']);
      } else {
        console.error('Login failed: Invalid credentials');
        this.showError('Login failed: Invalid credentials');
      }
    } catch (error) {
      console.error('Error during login:', error);
      this.showError(
        'An error occurred while logging in. Please try again later.'
      );
    }
  }

  private async onSignUp(formData: any): Promise<void> {
    try {
      // Check if the email already exists
      const existingProfiles = await this.profilesService.getProfilesAll();
      const emailExists = existingProfiles.some(
        (profile: { email: string }) => profile.email === formData.email
      );

      if (emailExists) {
        this.showError(
          'This email is already registered. Please use a different email.'
        );
      } else {
        // Add the new profile
        const newProfile: any = {
          name: formData.name,
          email: formData.email,
          password: formData.password, // You may want to hash the password before sending it to the backend
        };
        const result = await this.profilesService.addProfile(newProfile); //await firstValueFrom(this.profilesService.addProfile(newProfile));
        if (result) {
          // Redirect to the login page after successful registration
          this.showMessage(
            'An email has been sent to confirm your account, please check your inbox.'
          );
          this.authService.isSignUp = false; // Reset the sign-up flag
        } else {
          console.error('Signup failed: Unable to create profile');
          this.showError('Signup failed: Unable to create profile');
        }
      }
    } catch (error) {
      console.error('Error during signup:', error);
      this.showError(
        'An error occurred while registering. Please try again later.'
      );
    }
  }

  public enableSignUp() {
    this.authService.isSignUp = true;
  }

  public clearForm(): void {
    this.loginForm.reset();
  }

  public async byPass(): Promise<void> {
    const userInfo = {
      id: 6,
      email: 'tester@gmail.com',
      password: '1234',
      name: 'Tester',
    };
    const result = await this.authService.authUser(
      userInfo.email,
      userInfo.password
    );
    if (result) {
      this.profilesService.getProfilesById(result.user.id).then((profile) => {
        this.authService.setProfileInfo(profile);
        this.router.navigate(['/tabs/account/']);
      });
    }
  }

  public async showError(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color: 'danger',
      position: 'bottom',
    });
    await toast.present();
  }

  public async showMessage(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color: 'success',
      position: 'bottom',
    });
    await toast.present();
  }

  async openForgotPasswordModal() {
    const modal = await this.modalCtrl.create({
      component: ForgotPasswordModalComponent,
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data?.valid) {
      try {
        const result = await this.authService.sendResetPasswordEmail(
          data.email
        );
        console.log('Reset password email result:', result);
        if (result) {
          this.showError('Email sent successfully' + result);
        } else {
          this.showError('Email not sent');
        }
      } catch (error) {
        console.error('Error sending reset password email:', error);
        this.showError('Email not sent: ' + <string>error);
      }
    }
  }
}
