import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProfilesService {
  private profiles: any[] = [];

  // Urls
  private findAllProfilesUrl = environment.BASE_URL + '/profiles/findAll';
  private newProfilesUrl = environment.BASE_URL + '/profiles/';
  private updateProfilesUrl = environment.BASE_URL + '/profiles/';
  private deleteProfilesUrl = environment.BASE_URL + '/profiles/';

  private httpClient = inject(HttpClient);

  constructor() {}

  async ngOnInit() {
    await this.getProfilesAll();
  }

  public async getProfilesAll(): Promise<any> {
    if (environment.production) {
      const headers = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer `,
        },
      };
      const profiles = await firstValueFrom(
        this.httpClient.post(this.findAllProfilesUrl, {}, headers)
      );
      if (profiles) {
        this.profiles = <any>profiles;
      } else {
        console.error('Error fetching profiles:', profiles);
      }
    } else {
      /////// Using Mock Data //////////
      console.log('Using mock data for profiles');
      // Dynamically import the dummy data only if useMockData is true
      const { default: dummyProfilesData } = await import(
        'src/app/services/dummyData/dummyProfilesData.json'
      );
      this.profiles = dummyProfilesData;
    }
    return this.profiles;
  }

  async getProfilesById(authorId: string) {
    if (this.profiles.length === 0) {
      await this.getProfilesAll();
    }
    return this.profiles.filter((profile) => profile._id === authorId)[0];
  }

  async getProfilesByEmail(email: string) {
    if (this.profiles.length === 0) {
      await this.getProfilesAll();
    }
    return this.profiles.filter((profile) => profile.email === email)[0];
  }

  async addProfile(profile: any): Promise<any> {
    //console.log('addProfile', profile);
    if (environment.production) {
      const headers = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer `,
        },
      };
      const result: any = await firstValueFrom(
        this.httpClient.post(this.newProfilesUrl, profile, headers)
      );
      //console.log('Profile added :', result);
      if (result) {
        profile['_id'] = result._id;
        //console.log('Profile added :', profile);
        this.profiles.push(profile);
      } else {
        console.error('Error adding profile:');
      }
    } else {
      /////// Using Mock Data //////////
      console.log('Using mock data for adding a profile');
      this.profiles.push(profile);
    }
    return profile;
  }

  async updateProfile(profile: any, token: string | null): Promise<any> {
    //console.log('updateProfile', profile);

    if (environment.production) {
      const headers = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      const result = await firstValueFrom(
        this.httpClient.put(
          this.updateProfilesUrl + profile.id,
          profile,
          headers
        )
      );
      if (result) {
        const index = this.profiles.findIndex(
          (profileToUpdate) => profileToUpdate._id === profile.id
        );
        //console.log('Index:', index);
        if (index !== -1) {
          for (const key in profile) {
            if (profile.hasOwnProperty(key)) {
              this.profiles[index][key] = profile[key]; // Update the field
            }
          }
          return this.profiles[index];
        }
        return null;
      } else {
        console.error('Error adding profile:', result);
        return null;
      }
    } else {
      /////// Using Mock Data //////////
      console.log('Using mock data for adding a profile');
      const index = this.profiles.findIndex(
        (profileToUpdate) => profileToUpdate.id === profile.id
      );
      if (index !== -1) {
        for (const key in profile) {
          if (profile.hasOwnProperty(key)) {
            this.profiles[index][key] = profile[key]; // Update the field
          }
        }
        return this.profiles[index];
      }
      return null;
    }
  }

  async deleteProfile(id: string, token: string | null): Promise<boolean> {
    if (environment.production) {
      const headers = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      const result = await firstValueFrom(
        this.httpClient.delete(
          this.deleteProfilesUrl + id + '/' + token,
          headers
        )
      );
      if (result) {
        console.log('Profile deleted:', result);
        return true;
      } else {
        console.error('Error deleting profile:', result);
        return false;
      }
    } else {
      /////// Using Mock Data //////////
      console.log('Using mock data for deleting a profile');
      const index = this.profiles.findIndex((profile) => profile.id === id);
      if (index !== -1) {
        this.profiles.splice(index, 1);
        return true;
      }
      return false;
    }
  }

  async authProfile(email: string, password: string) {
    if (environment.production) {
      const headers = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer `,
        },
      };
      const authData = { email: email, password: password };
      const valid = await firstValueFrom(
        this.httpClient.post(
          environment.BASE_URL + '/auth/login',
          authData,
          headers
        )
      );
      return valid;
    } else {
      /////// Using Mock Data //////////
      if (this.profiles.length === 0) {
        await this.getProfilesAll();
      }
      const profile = this.profiles.find(
        (profile) => profile.email === email && profile.password === password
      );
      if (profile) {
        return profile;
      } else {
        return null;
      }
    }
  }

  async logout(sessionId: string, token: string | null) {
    if (environment.production) {
      const headers = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      const authData = { sessionId: sessionId };
      const result = await firstValueFrom(
        this.httpClient.post(
          environment.BASE_URL + '/auth/logout',
          authData,
          headers
        )
      );
    }
  }

  getTechnologiesFromUsers() {
    const allTechnologies: any[] = [];
    this.profiles.forEach((profile) => {
      if (profile.technologies) {
        profile.technologies.forEach((tech: any) => {
          if (!allTechnologies.some((t: any) => t.name === tech.name)) {
            allTechnologies.push(tech);
          }
        });
      }
    });
    return allTechnologies;
  }

  async changePassword(
    id: string,
    token: string | null,
    data: any
  ): Promise<boolean> {
    if (environment.production) {
      const changePasswordData = {
        id: id,
        currentPassword: data.password,
        newPassword: data.newPassword,
      };
      const headers = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      return await firstValueFrom(
        this.httpClient.post(
          environment.BASE_URL + '/auth/changePassword' + '/' + token,
          changePasswordData,
          headers
        )
      )
        .then((response) => {
          console.log('Password changed successfully:', response);
          return true; // Password changed successfully
        })
        .catch((error) => {
          console.error('Error changing password:', error);
          return false; // Password change failed
        });
    } else {
      /////// Using Mock Data //////////}
      const { currentPassword, newPassword } = data;
      const profile = this.profiles.find((profile) => profile.id === id);
      if (profile) {
        if (profile.password === currentPassword) {
          profile.password = newPassword;
          return true; // Password changed successfully
        } else {
          return false; // Current password is incorrect
        }
      }
      return false; // Profile not found
    }
  }

  async sendResetPasswordEmail(email: string): Promise<any> {
    const data = { email: email };
    const headers = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer `,
      },
    };
    return await firstValueFrom(
      this.httpClient.post(
        environment.BASE_URL + '/auth/sendResetPasswordEmail',
        data,
        headers
      )
    )
      .then((response) => {
        console.log('Reset password email sent:', response);
        return response; // Return the response from the server
      })
      .catch((error) => {
        console.error('Error sending reset password email:', error);
        return null; // Return null in case of error
      });
  }

  async getPreviewProfile(profiles: string[]): Promise<any[]> {
    const authorsPreview: any[] = [];
    profiles.forEach(async (authorId: string) => {
      const foundProfile = await this.getProfilesById(authorId);
      const profile = Array.isArray(foundProfile)
        ? foundProfile[0]
        : foundProfile;
      if (profile) {
        authorsPreview.push({
          id: profile._id,
          name: profile.name,
          surname: profile.surname,
          photo: profile.photo,
        });
      }
    });
    return authorsPreview;
  }

  async sendAdminMessage(
    id: string,
    token: string | null,
    category: string,
    message: string
  ): Promise<any[]> {
    const data = {
      userId: id,
      type: category,
      message: message,
    };
    const headers = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
    const result = await firstValueFrom(
      this.httpClient.post(
        environment.BASE_URL + '/requests' + '/' + token,
        data,
        headers
      )
    )
      .then((response) => {
        console.log('Message sent to admin:', response);
        return response as any[];
      })
      .catch((error) => {
        console.error('Error sending message to admin:', error);
        return [];
      });
    return result;
  }
}
