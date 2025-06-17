import { Component, inject } from '@angular/core';
import {
  IonApp,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonLabel,
  IonRouterOutlet,
  IonToolbar,
  IonButtons,
  IonButton,
} from '@ionic/angular/standalone';
import { AuthService } from './services/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  logOut,
  arrowBackOutline,
  sadOutline,
  save,
  closeCircleOutline,
  calendarOutline,
} from 'ionicons/icons';
import {
  imagesOutline,
  informationCircleOutline,
  openOutline,
  close,
  add,
} from 'ionicons/icons';

import { Location } from '@angular/common';

addIcons({
  'images-outline': imagesOutline,
  'information-circle-outline': informationCircleOutline,
  'open-outline': openOutline,
  close: close,
  add: add,
  'sad-outline': sadOutline,
  save: save,
  'close-circle-outline': closeCircleOutline,
  'calendar-outline': calendarOutline,
});
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    CommonModule,
    IonApp,
    IonRouterOutlet,
    IonLabel,
    IonIcon,
    IonHeader,
    IonContent,
    IonToolbar,
    IonImg,
    IonButtons,
    IonButton,
  ],
})
export class AppComponent {
  public auth = inject(AuthService);
  private router = inject(Router);
  public profile: any;

  private location = inject(Location);
  public showBackButton: boolean = false;
  public isSignUp: boolean = false; // Flag to toggle between login and signup
  public isAccountPage: boolean = false; // Flag to check if the current page is an account page
  constructor() {
    addIcons({ logOut, arrowBackOutline });
  }

  ngOnInit() {
    // Subscribe to profile updates
    this.auth.profile$.subscribe((updatedProfile) => {
      this.profile = updatedProfile;
    });

    this.auth.enabledSignUp$.subscribe((value: any) => {
      this.showBackButton = value;
      this.isSignUp = value;
    });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isAccountPage = this.location.path().includes('/account');
        if (this.location.isCurrentPathEqualTo('/tabs/account/login')) {
          this.showBackButton = this.isSignUp; // Hide back button on login page
        } else if (
          this.location.path().includes('/projectDetails/') ||
          this.location.path().includes('/profileDetails/') ||
          this.location.path().includes('/newProject') ||
          this.location.path().includes('/editProject') ||
          this.location.path().includes('/editProfile')
        )
          this.showBackButton = true;
        // Show back button on project details page
        else {
          this.showBackButton = false; // Show back button on other pages
        }
      }
    });
  }

  goBack() {
    if (this.location.path().includes('/tabs/account/login')) {
      this.auth.isSignUp = false; // Reset the sign-up flag
    } else if (
      this.location.path().includes('/projectDetails/') ||
      this.location.path().includes('/profiles?id') ||
      this.location.path().includes('/profileDetails/') ||
      this.location.path().includes('/newProject') ||
      this.location.path().includes('/editProject') ||
      this.location.path().includes('/editProfile')
    ) {
      this.location.back(); // Navigate back to the previous page
    }
  }

  logout() {
    this.auth.logout();
    this.auth.isLoggedIn = false;
    this.router.navigate(['/tabs/account/login'], {
      queryParams: { reload: true },
    }); // Add a query parameter
  }
}
