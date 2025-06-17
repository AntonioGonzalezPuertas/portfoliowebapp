import { Component, inject } from '@angular/core';
import {
  IonCard,
  IonFab,
  IonFabButton,
  IonContent,
  IonIcon,
  IonLabel,
  AlertController,
  ToastController,
} from '@ionic/angular/standalone';
import { ProfileComponent } from '../components/profile/profile.component';
import { ProfilesService } from '../services/profiles.service';
import { AuthService } from '../services/auth.service';
import { addIcons } from 'ionicons';
import { logOut, close, add, pencil } from 'ionicons/icons';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProjectsService } from '../services/projects.service';
import { ContactAdminComponent } from '../components/contact-admin/contact-admin.component';
@Component({
  selector: 'app-account',
  templateUrl: 'account.page.html',
  styleUrls: ['account.page.scss'],
  imports: [
    CommonModule,
    IonFab,
    IonFabButton,
    IonCard,
    IonContent,
    IonIcon,
    IonLabel,
    ProfileComponent,
    ContactAdminComponent,
  ],
})
export class AccountPage {
  private profilesService = inject(ProfilesService);
  private projectsService = inject(ProjectsService);
  private auth = inject(AuthService);
  public profile: any = null;
  private router = inject(Router);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private route = inject(ActivatedRoute);

  public projectsPreview: any[] = [];

  constructor() {
    addIcons({ logOut, close, add, pencil });
    this.profilesService.getProfilesAll(); // Initialize profiles data
    this.projectsService.getProjectsAll(); // Initialize projects data
  }

  async ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['reload']) {
        this.refreshData();
      }
    });

    this.profile = this.auth.getProfileInfo();
    this.projectsPreview = await this.projectsService.getProjectsByAuthor(
      this.profile._id
    );
  }

  logout() {
    this.auth.isLoggedIn = false;
    this.router.navigate(['/tabs/account/login'], {
      queryParams: { reload: true },
    }); // Add a query parameter
  }

  async refreshData() {
    this.profile = await this.profilesService.getProfilesById(this.profile._id);
    let projects = await this.projectsService.getProjectsAll();
    await this.projectsService.getProjectsAll();
    await this.profilesService.getProfilesAll();
    this.profile = await this.profilesService.getProfilesById(this.profile._id);
    this.projectsPreview = await this.projectsService.getProjectsByAuthor(
      this.profile._id
    );
  }

  async removeProject(projectId: string, isOnlyAuthor: boolean) {
    if (isOnlyAuthor) {
      await this.projectsService.removeProject(projectId);
    } else {
      await this.projectsService.removeAuthorFromProject(
        projectId,
        this.profile._id
      );
    }
    this.refreshData();
  }

  async confirmDeleteProject(event: MouseEvent, projectId: string) {
    event.stopPropagation();
    let project = await this.projectsService.getProjectById(projectId);
    let warning = '';
    let isOnlyAuthor = false;
    if (project[0].authors.length === 1) {
      isOnlyAuthor = true;
      warning =
        'You are the only author of this project. Deleting it will remove it permanently.';
    } else {
      isOnlyAuthor = false;
      warning =
        'You are going to be removed form this project. The project will not be deleted.';
    }
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message:
        'Are you sure you want to remove this author from the project? ' +
        warning,

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
            this.removeProject(projectId, isOnlyAuthor); // Call the delete method
          },
        },
      ],
    });

    await alert.present();
  }

  editProject(event: MouseEvent, projectId: string) {
    event.stopPropagation();
    this.router.navigate(['/tabs/account/editProject', projectId]);
  }

  newProject(event: MouseEvent, profileId: string) {
    event.stopPropagation();
    this.router.navigate(['/tabs/account/newProject', profileId]);
  }

  showProject(projectId: string) {
    this.router.navigate(['tabs/projects/projectDetails', projectId]);
  }

  async handleAdminMessage(event: { category: string; message: string }) {
    // Envoyer au backend ou afficher une notification
    let result = await this.profilesService.sendAdminMessage(
      this.profile._id,
      this.auth.getToken(),
      event.category,
      event.message
    );
    const toast = await this.toastController.create({
      message: <any>result,
      duration: 2000,
    });
    toast.present();
  }

  goEditProfile() {
    this.router.navigate(['/tabs/account/editProfile']);
  }
}
