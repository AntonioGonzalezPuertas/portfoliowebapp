import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  ModalController,
  IonContent,
  IonCard,
  IonAvatar,
  IonChip,
  IonIcon,
  IonLabel,
  IonCardContent,
  IonItem,
  IonButton,
  IonInput,
  IonTextarea,
  IonFab,
  IonFabButton,
} from '@ionic/angular/standalone';
import { ProfilesService } from 'src/app/services/profiles.service';
import { addIcons } from 'ionicons';
import { close, add, pencil, save } from 'ionicons/icons';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AlertController, ToastController } from '@ionic/angular';
import { ChangePasswordComponent } from '../../components/change-password/change-password.component';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonContent,
    IonTextarea,
    IonAvatar,
    IonCard,
    IonChip,
    IonIcon,
    IonLabel,
    IonCardContent,
    IonItem,
    IonButton,
    IonInput,
    IonLabel,
    IonFab,
    IonFabButton,
  ],
})
export class EditProfilePage implements OnInit {
  public profile: any;

  private router = inject(Router);
  private profilesService = inject(ProfilesService);
  private auth = inject(AuthService);

  private alertController = inject(AlertController);
  private modalController = inject(ModalController);
  private toastController = inject(ToastController);

  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  public profileForm: FormGroup;
  public avatarPreview: string | ArrayBuffer | null = null;
  public techName: string = '';
  public techVersion: string = '';
  public techIconUrl: string = '';

  constructor() {
    addIcons({ close, add, pencil, save });

    this.profileForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      surname: ['', Validators.required],
      role: [''],
      email: ['', [Validators.email]],
      phone: [''],
      bio: [''],
      photo: [''],
      technologies: this.fb.array([]), // Initialize as a FormArray
      techName: [''],
      techVersion: [''],
    });
  }

  ngOnInit() {
    this.profile = this.auth.getProfileInfo();
    this.profileForm.patchValue({
      id: this.profile?._id,
      name: this.profile?.name,
      surname: this.profile?.surname,
      role: this.profile?.role,
      email: this.profile?.email,
      phone: this.profile?.phone,
      bio: this.profile?.bio,
      photo: this.profile?.photo,
    });
    // Populate the technologies FormArray
    const technologiesArray = this.profile?.technologies || [];
    technologiesArray.forEach((tech: any) => {
      const technologies = this.profileForm.get('technologies') as FormArray;
      technologies.push(
        this.fb.group({
          name: [tech.name || '', Validators.required],
          version: [tech.version || ''],
        })
      );
    });
  }

  async openChangePasswordModal() {
    const modal = await this.modalController.create({
      component: ChangePasswordComponent,
    });

    await modal.present();

    // Retrieve data when the modal is dismissed
    const { data } = await modal.onDidDismiss();
    if (data && typeof data === 'object') {
      const result = await this.profilesService.changePassword(
        this.profile._id,
        this.auth.getToken(),
        data
      );
      if (result) {
        // Handle successful password change
        console.log('Password changed successfully');
        this.presentToast('Password changed successfully!', 'success');
      } else {
        // Handle password change failure
        console.log('Failed to change password');
        this.presentToast('Failed to change password', 'danger');
      }
    } else if (data && typeof data === 'string') {
      // Handle modal dismissal with error
      this.presentToast(data, 'danger');
    } else {
      // Handle modal dismissal without data
      console.log('Cancelled password change');
      this.presentToast('Cancelled password change', 'warning');
    }
  }

  get technologies(): FormArray {
    return this.profileForm.get('technologies') as FormArray;
  }

  createTechnologyGroup(tech: any): FormGroup {
    return this.fb.group({
      name: [tech.name || '', Validators.required],
      version: [tech.version || ''],
    });
  }

  onAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        this.avatarPreview = reader.result; // Preview the selected image
        this.profileForm.patchValue({ photo: this.avatarPreview }); // Update the form value with the selected image
      };

      reader.readAsDataURL(file); // Read the file as a data URL
    }
  }

  async onSubmit() {
    if (this.profileForm.valid) {
      const formValue = { ...this.profileForm.value }; // Create a copy of the form value
      delete formValue.techName; // Remove techName
      delete formValue.techVersion; // Remove techVersion (if needed)

      const token = this.auth.getToken();
      this.profile = await this.profilesService.updateProfile(formValue, token);
      this.auth.setProfileInfo(this.profile); // Update the profile in AuthService
      this.router.navigate(['/tabs/account'], {
        queryParams: { reload: true },
      }); // Navigate back to the account page
    } else {
      console.log('Invalid form data');
    }
  }

  getIconUrl(skillName: string): string {
    const baseUrl =
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/';
    const primaryUrl = `${baseUrl}${skillName
      .toLowerCase()
      .replace('.', '')}/${skillName
      .toLowerCase()
      .replace('.', '')}-original.svg`;
    return primaryUrl;
  }

  removeTech(index: number) {
    const technologies = this.profileForm.get('technologies') as FormArray;
    technologies.removeAt(index);
  }

  addTech() {
    const technologies = this.profileForm.get('technologies') as FormArray;
    technologies.push(
      this.fb.group({
        name: [this.profileForm.value.techName || '', Validators.required],
        version: [this.profileForm.value.techVersion || ''],
      })
    );
  }

  async checkUrlExists() {
    let url = this.getIconUrl(this.profileForm.value.techName);
    if (this.profileForm.value.techName === '') {
      this.techIconUrl = 'assets/icon/favicon.png'; // Default icon URL
      return;
    }

    await this.http
      .head(url)
      .toPromise()
      .then(
        (response) => {
          this.techIconUrl = url; // Store the response data
        },
        (error: HttpErrorResponse) => {
          if (error.status === 403) {
            // Suppress the error log for 403 Forbidden
            console.log(
              'tech "',
              this.profileForm.value.techName,
              '" does not exist. Please try again.'
            );
            //this.techIconUrl = 'assets/icon/favicon.png';
          } else {
            // Log other errors for debugging purposes
            console.error('Error fetching URL:', error);
          }
        }
      );
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000, // Toast will disappear after 2 seconds
      position: 'bottom', // Position of the toast
      color: color, // Success, danger, etc.
    });

    await toast.present();
  }

  public onCancelEdit() {
    this.router.navigate(['/tabs/account']); // Navigate back to the account page
  }

  logout() {
    this.auth.isLoggedIn = false;
    this.router.navigate(['/tabs/account/login'], {
      queryParams: { reload: true },
    }); // Add a query parameter
  }

  async deleteAccount() {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message:
        'Are you sure you want to delete your account? This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {},
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.profilesService.deleteProfile(
              this.profile.id,
              this.auth.getToken()
            );
            this.logout();
          },
        },
      ],
    });

    await alert.present();
  }
}
