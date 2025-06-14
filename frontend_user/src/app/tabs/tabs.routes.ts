import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { AuthGuard } from '../guards/auth.guard';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'projects',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('../tab-projects/projects.page').then(
                (m) => m.ProjectsPage
              ),
          },
          {
            path: 'projectDetails/:id',
            loadComponent: () =>
              import(
                '../components/project-details/project-details.component'
              ).then((m) => m.ProjectDetailsComponent),
          },
        ],
      },
      {
        path: 'profiles',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('../tab-profiles/profiles.page').then(
                (m) => m.ProfilesPage
              ),
          },
          {
            path: 'profileDetails/:id',
            loadComponent: () =>
              import('../pages/detail-profile/detail-profile.page').then(
                (m) => m.DetailProfilePage
              ),
          },
        ],
      },
      {
        path: 'account',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('../tab-account/account.page').then((m) => m.AccountPage),
            canActivate: [AuthGuard], // Protect the account route
          },
          {
            path: 'login',
            loadComponent: () =>
              import('../components/login/login.component').then(
                (m) => m.LoginComponent
              ),
          },
          {
            path: 'editProfile',
            loadComponent: () =>
              import('../pages/edit-profile/edit-profile.page').then(
                (m) => m.EditProfilePage
              ),
          },
          {
            path: 'newProject/:id',
            loadComponent: () =>
              import('../pages/new-project/new-project.page').then(
                (m) => m.NewProjectPage
              ),
          },
          {
            path: 'editProject/:id',
            loadComponent: () =>
              import('../pages/edit-project/edit-project.page').then(
                (m) => m.EditProjectPage
              ),
          },
        ],
      },
      {
        path: '',
        redirectTo: '/tabs/projects',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/projects',
    pathMatch: 'full',
  },
];
