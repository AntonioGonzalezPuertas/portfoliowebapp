import { inject, Injectable } from '@angular/core';
import dummyProjectsData from 'src/app/services/dummyData/dummyProjectsData.json'; // Import JSON file
import dummyCategoriesData from 'src/app/services/dummyData/dummyCategoriesData.json'; // Import JSON file
import { ProfilesService } from './profiles.service';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service'; // Import the AuthService if needed

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private authService = inject(AuthService);
  private httpClient = inject(HttpClient);
  private projects: any[] = [];
  private categories: any[] = [];

  private headers = { headers: { 'Content-Type': 'application/json' } };
  private findAllProjectUrl = environment.BASE_URL + '/projects/findAll';
  private createProjectUrl = environment.BASE_URL + '/projects/';
  private updateProjectUrl = environment.BASE_URL + '/projects/';

  constructor() {
    if (!environment.production) {
      this.projects = dummyProjectsData;
    }
    this.categories = dummyCategoriesData;
  }

  async getProjectsAll(): Promise<any> {
    if (environment.production) {
      const projects = await firstValueFrom(
        this.httpClient.post(this.findAllProjectUrl, {}, this.headers)
      );
      if (projects) {
        this.projects = <any>projects;
      } else {
        console.error('Error fetching projects:', projects);
      }
    } else {
      /////// Using Mock Data //////////
      console.log('Using mock data for profiles');
      // Dynamically import the dummy data only if useMockData is true
      const { default: dummyProjectsData } = await import(
        'src/app/services/dummyData/dummyProjectsData.json'
      );
      this.projects = dummyProjectsData;
    }
    return this.projects;
  }

  async createProject(projectData: any): Promise<any> {
    console.log('createProject', projectData);
    if (environment.production) {
      try {
        const response = await firstValueFrom(
          this.httpClient.post(
            this.createProjectUrl + '/' + this.authService.getToken(),
            projectData,
            this.headers
          )
        );
        console.log('Success:', response);
        return response; // retourne le project
      } catch (error) {
        console.error('Error:', error);
        throw error; //voir ce qu'on retourne pour la gestion des erreurs
      }
    } else {
      /////// Using Mock Data //////////
      console.log('Using mock data for profiles');
      // Dynamically import the dummy data only if useMockData is true
      const { default: dummyProjectsData } = await import(
        'src/app/services/dummyData/dummyProjectsData.json'
      );
      return dummyProjectsData;
    }
  }

  //tester si on a l'id dans projectData
  async updateProject(projectData: any): Promise<any> {
    console.log('update', projectData);
    if (environment.production) {
      try {
        const response = await firstValueFrom(
          this.httpClient.put(
            this.updateProjectUrl +
              projectData._id +
              '/' +
              this.authService.getToken(),
            projectData,
            this.headers
          )
        );
        console.log('Update Success:', response);
        return response; // ✅ retourne la réponse de l’API
      } catch (error) {
        console.error('Update Error:', error);
        throw error; // ou return null selon ton usage
      }
    } else {
      console.log('Using mock data for update');
      const { default: dummyProjectsData } = await import(
        'src/app/services/dummyData/dummyProjectsData.json'
      );
      // Optionnel : mets à jour localement le projet si besoin
      const index = dummyProjectsData.findIndex(
        (p: any) => p.id === projectData.id
      );
      if (index !== -1) {
        dummyProjectsData[index] = projectData;
      }
      return dummyProjectsData[index] || null;
    }
  }

  async getProjectById(id: string): Promise<any> {
    const project = await this.projects.filter((project) => project._id === id);
    return project;
  }

  async getProjectsByAuthor(authorId: string): Promise<any[]> {
    if (this.projects.length === 0) {
      this.projects = await this.getProjectsAll();
    }
    return this.projects.filter((project) =>
      project.authors.includes(authorId)
    );
  }

  getCategoriesAll() {
    return this.categories;
  }

  async removeAuthorFromProject(projectId: string, authorsId: string) {
    const projectToUpdate = this.projects.find(
      (project) => project._id === projectId
    );
    const newAuthors = projectToUpdate.authors.filter(
      (id: String) => id !== authorsId
    );
    const data = { _id: projectId, authors: newAuthors };
    await this.updateProject(data);
  }

  async removeProject(projectId: string): Promise<any> {
    if (environment.production) {
      try {
        const response = await firstValueFrom(
          this.httpClient.delete(
            this.updateProjectUrl +
              projectId +
              '/' +
              this.authService.getToken(),
            this.headers
          )
        );
        console.log('response :', response);
        return response;
      } catch (error) {
        console.error('Error:', error);
        throw error; // ou return null selon ton usage
      }
    } else {
      // Simulate the deletion of a project
      const projectIndex = this.projects.findIndex(
        (project) => project.id === projectId
      );
      if (projectIndex !== -1) {
        this.projects.splice(projectIndex, 1);
      }
    }
  }
}
