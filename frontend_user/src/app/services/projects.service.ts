import { inject, Injectable } from '@angular/core';
import dummyProjectsData from 'src/app/services/dummyData/dummyProjectsData.json'; // Import JSON file
import dummyCategoriesData from 'src/app/services/dummyData/dummyCategoriesData.json'; // Import JSON file
import { ProfilesService } from './profiles.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private profilesService = inject(ProfilesService);
  private projects: any[] = [];
  private categories: any[] = [];
  constructor() { 
    this.projects = dummyProjectsData;
    this.categories = dummyCategoriesData;
    //this.addPreviewProfileToProjects();
  } 

  getProjectWithAuthorsPreview(){
    const dataReturn = this.projects;
    dataReturn.forEach((project) => {
      const previewAuthors: { userId: string; name: string; surname: string, photo : string}[] = [];
      project.authors.forEach((authorId: string) => {
        const profiles = this.profilesService.getProfilesById(authorId);
        const profile = Array.isArray(profiles) ? profiles[0] : profiles;
        if (profile) {
          previewAuthors.push({
            userId: profile.userId,
            name: profile.name,
            surname: profile.surname,
            photo: profile.photo,
          });
        }
      });
      project.authors = previewAuthors;
    });
    return dataReturn;
  }

  /*
  addPreviewProfileToProjects(){
    this.projects.forEach((project) => {
      const previewAuthors: { userId: string; name: string; surname: string, photo : string}[] = [];
      project.authors.forEach((authorId: string) => {
        const profiles = this.profilesService.getProfilesById(authorId);
        const profile = Array.isArray(profiles) ? profiles[0] : profiles;
        if (profile) {
          previewAuthors.push({
            userId: profile.userId,
            name: profile.name,
            surname: profile.surname,
            photo: profile.photo,
          });
        }
      });
      project.authors = previewAuthors;
    });
  }
  */

  getProjectsAll(){
    return this.projects
  }

  getProjectById(id: string) {
    const project = this.projects.filter(project => project.id === id)
    return project;
  }
  
  getProjectsByAuthor(authorId: string) {
    return this.projects.filter(project => project.authors.includes(authorId));
  }

  getCategoriesAll(){
    return this.categories;
  }
}
