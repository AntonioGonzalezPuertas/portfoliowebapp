import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonFabButton } from '@ionic/angular/standalone';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonList,
  IonChip,
  IonAvatar,
  IonIcon,
  IonToast,
  IonFab,
} from '@ionic/angular/standalone';
import { ProjectsService } from 'src/app/services/projects.service';
import { ProfilesService } from 'src/app/services/profiles.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from 'src/app/models/project.model';

@Component({
  selector: 'app-form-project',
  templateUrl: './form-project.component.html',
  styleUrls: ['./form-project.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonList,
    IonChip,
    IonAvatar,
    IonIcon,
    IonToast,
    IonFab,
    IonFabButton,
  ],
})
export class FormProjectComponent implements OnInit {
  @Input() mode: any; // 'new' or 'edit'
  @Input() id: any; // if new -> id of profile connected - if edit -> id of project
  @Output() formSubmitted = new EventEmitter<Project>();
  private router = inject(Router);
  project: any = {};

  pageTitle = '';
  private projectService = inject(ProjectsService);
  private profilesService = inject(ProfilesService);
  projectForm!: FormGroup;
  private fb = inject(FormBuilder);

  categories: any[] = [];

  Profiles: any[] = [];
  filteredProfiles: any[] = [];
  selectedProfiles: any[] = [];
  authorsInput: string = '';
  authorsId: string[] = [];

  photos: any[] = [];

  http = inject(HttpClient);
  techFound = false;
  techIconUrl: string = '';
  technologies: any[] = [];

  isToastOpen = false;
  messageToast = '';
  colorToast = '';
  isNew: boolean = true;

  constructor(private route: ActivatedRoute) {}

  async ngOnInit() {
    this.categories = this.projectService.getCategoriesAll();
    this.projectForm = this.fb.group(
      {
        title: ['', Validators.required],
        category: ['', Validators.required],
        date: ['', Validators.required],
        description: [''],
        link: [
          '',
          [
            Validators.pattern(
              /^(https?:\/\/)?([\w\-]+\.)+[\w\-]{2,}(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/i
            ),
          ],
        ],
        techName: [''],
        techVersion: [''],
        authors: [''], //voir comment faire la validation
        photos: [[]],
      },
      { validators: [this.othersValidators()] }
    );
    this.Profiles = await this.profilesService.getProfilesAll();

    ///
    ////
    /// TESTER LE MODE SI NEW METTRE JUSTE L'AUTEUR
    //// si edit charger
    if (this.mode === 'edit') {
      //mettre le chargement
      this.project = await this.projectService.getProjectById(this.id);
      this.project = this.project[0]; // Assuming getProjectById returns an array
      this.chargeProject();
      //this.chargeProject();
      this.isNew = false;
    } else {
      this.isNew = true;
      const profileConnected = this.Profiles.find((p) => p._id === this.id);
      this.authorsId.push(this.id); // Assuming id is the profile ID of the connected user
      this.selectedProfiles.push(profileConnected);
    }
  }

  othersValidators() {
    return (formGroup: FormGroup) => {
      const errors: any = {};

      //validation Date
      const dateValue = formGroup.get('date')?.value;
      if (dateValue) {
        const inputDate = new Date(dateValue);
        const today = new Date();

        // Réinitialiser heures/minutes/secondes pour comparaison uniquement sur la date
        inputDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (inputDate > today) {
          errors.futureDateNotAllowed = true;
        }
      }

      // Validation auteurs
      if (!this.authorsId || this.authorsId.length === 0) {
        errors.authorsRequired = true;
      }

      // Validation technologies
      if (!this.technologies || this.technologies.length === 0) {
        errors.technologiesRequired = true;
      }

      if (this.photos.length === 0) {
        errors.photosRequired = true;
      }

      // Validation Photos

      // S'il y a des erreurs, on les retourne, sinon null
      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  async chargeProject() {
    const dateOnly = this.project.date
      ? this.project.date.substring(0, 10)
      : '';
    this.pageTitle = 'Edit Project';
    this.projectForm.patchValue({
      title: this.project.title,
      category: this.project.category,
      date: dateOnly,
      description: this.project.description,
      link: this.project.link,
    });
    this.photos = [...this.project.photos];
    this.chargeAuthors();
    this.technologies = [...this.project.technologies];
  }

  chargeAuthors() {
    for (let i = 0; i < this.project.authors.length; i++) {
      const authorId = this.project.authors[i];
      const profile = this.Profiles.find((p) => p._id === authorId);
      if (profile) {
        this.selectedProfiles.push(profile);
        this.authorsId.push(profile._id);
      }
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

  async checkUrlExists() {
    let url = this.getIconUrl(this.projectForm.value.techName);
    if (this.projectForm.value.techName === '') {
      this.techFound = false;
      this.techIconUrl = '';
      return;
    }

    await this.http
      .head(url)
      .toPromise()
      .then(
        (response) => {
          this.techFound = true;
          this.techIconUrl = url; // Store the response data
        },
        (error: HttpErrorResponse) => {
          if (error.status === 403) {
            // Suppress the error log for 403 Forbidden
            this.techFound = false;
            this.techIconUrl = '';
          } else {
            // Log other errors for debugging purposes
            this.techFound = false;
            this.techIconUrl = '';
            console.error('Error fetching URL:', error);
          }
        }
      );
  }

  addTech() {
    const nameTech = this.projectForm.value.techName;
    const versionTech = this.projectForm.value.techVersion;

    if (!nameTech || nameTech.trim() === '') {
      this.messageToast = 'Technology name cannot be empty.';
      this.colorToast = 'danger';
      this.setOpen(true);
      return;
    }
    const exist = this.technologies.some(
      (tech) =>
        tech.name.toLowerCase().trim() === nameTech.toLowerCase().trim() &&
        (tech.version?.toString().toLowerCase().trim() || '') ===
          (versionTech?.toLowerCase().trim() || '')
    );
    if (!exist) {
      this.technologies.push({
        name: nameTech,
        version: versionTech,
      });
      this.projectForm.patchValue({ techName: '', techVersion: '' });
      this.techIconUrl = '';
      this.projectForm.updateValueAndValidity(); // Recalcule les erreurs
    } else {
      this.messageToast = 'Technology already exists in the list.';
      this.colorToast = 'danger';
      this.setOpen(true);
    }
  }

  removeTech(tech: any) {
    this.technologies = this.technologies.filter(
      (sel) => sel.name !== tech.name
    );
    this.projectForm.updateValueAndValidity(); // Recalcule les erreurs
  }

  onAuthorInput(event: any) {
    this.authorsInput = event.target.value;
    this.searchFilterProfiles(this.authorsInput);
  }

  searchFilterProfiles(textSearch: string) {
    if (this.authorsInput.length < 1) {
      this.filteredProfiles = [];
    } else {
      this.filteredProfiles = this.Profiles.filter(
        (profile) =>
          (profile.name
            .toLowerCase()
            .startsWith(this.authorsInput.toLocaleLowerCase()) ||
            profile.surname
              .toLowerCase()
              .startsWith(this.authorsInput.toLocaleLowerCase())) &&
          !this.selectedProfiles.some((sel) => sel._id === profile._id)
      );
    }
  }

  removeAuthor(profile: any) {
    this.selectedProfiles = this.selectedProfiles.filter(
      (sel) => sel._id !== profile._id
    );
    this.authorsId = this.authorsId.filter((id) => id !== profile._id);
    this.searchFilterProfiles(this.authorsInput);
    this.projectForm.updateValueAndValidity(); // Recalcule les erreurs
  }

  selectAuthor(profile: any) {
    this.selectedProfiles.push(profile);
    this.authorsId.push(profile._id);
    this.authorsInput = '';
    this.filteredProfiles = [];
    this.projectForm.patchValue({ autors: '' });
    this.projectForm.updateValueAndValidity(); // Recalcule les validations
  }

  // Utile pour le redimensionnement + compression
  resizeAndConvertToBase64(
    file: File,
    maxWidth = 800,
    quality = 0.7
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = () => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const scaleFactor = Math.min(maxWidth / img.width, 1); // ne pas agrandir
          canvas.width = img.width * scaleFactor;
          canvas.height = img.height * scaleFactor;

          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('Canvas not supported');

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL('image/jpeg', quality);
          resolve(base64);
        };
        img.src = reader.result as string;
      };

      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  async onPhotosSelected(event: any) {
    const files = event.target.files;
    for (let file of files) {
      try {
        const compressedBase64 = await this.resizeAndConvertToBase64(file);
        this.photos.push(compressedBase64);
      } catch (error) {
        console.error('Erreur lors de la compression de l’image :', error);
      }
    }

    this.projectForm.updateValueAndValidity();
  }

  removePhoto(url: string) {
    this.photos = this.photos.filter((photo) => photo !== url);
    this.projectForm.updateValueAndValidity(); // Recalcule les validations
  }

  //Faire les requêtes necessaires
  async onSubmit() {
    const newProjectData: {
      _id?: string;
      title: any;
      category: any;
      date: any;
      description: any;
      technologies: any[];
      authors: string[];
      link: any;
      photos?: any[];
    } = {
      title: this.projectForm.get('title')?.value,
      category: this.projectForm.get('category')?.value,
      date: this.projectForm.get('date')?.value,
      description: this.projectForm.get('description')?.value,
      technologies: this.technologies,
      authors: this.authorsId,
      link: this.projectForm.get('link')?.value,
      photos: [],
    };
    //Enregistre le project
    if (this.isNew) {
      console.log('Creating new project with data:', newProjectData);
      const response = await this.projectService.createProject(newProjectData);
      console.log('Project creation response:', response);
      //récupérer l'id du projet créé
      //boucle sur this.photos et ajouter une a une les photos

      for (const photo of this.photos) {
        const response2 = await this.projectService.uploadPhotoProject(
          response._id,
          photo
        );
        console.log('Photo upload response:', response2);
      }
      this.messageToast = 'Project created successfully.';
      this.colorToast = 'success';
      this.setOpen(true);
      this.router.navigate(['/tabs/account'], {
        queryParams: { reload: true },
      });
      /*
      this.messageToast = 'Failed to create the project. Please try again.';
      this.colorToast = 'danger';
      this.setOpen(true);
      */
    } else {
      newProjectData._id = this.project._id;
      // tester this.photos si base 64 enregistrer dans une array et supprimer de this.photos
      //faire le update du projet normalement
      //faire upload des photos base64

      const arrayPhotosBase64: string[] = this.photos.filter((photo) =>
        photo.startsWith('data:image/jpeg;base64,')
      );
      const arrayPhotosUrl: string[] = this.photos.filter((photo) =>
        photo.startsWith('http')
      );
      newProjectData.photos = arrayPhotosUrl;
      const response = await this.projectService.updateProject(newProjectData);
      console.log('Project update response:', response);
      for (const photo of arrayPhotosBase64) {
        await this.projectService.uploadPhotoProject(
          newProjectData._id!,
          photo
        );
      }
      this.messageToast = 'Project updated successfully.';
      this.colorToast = 'success';
      this.setOpen(true);
      this.router.navigate(['/tabs/account'], {
        queryParams: { reload: true },
      });

      /*
      this.messageToast = 'Failed to update the project. Please try again.';
      this.colorToast = 'sucess';
      this.setOpen(true);
      */
    }
  }

  onCancel() {
    this.router.navigate(['/tabs/account']); // Navigate back to the account page
  }

  setOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }
}
