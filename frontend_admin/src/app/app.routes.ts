import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ShellComponent } from './shell/shell.component';
import { UserRequestsComponent } from './user-requests/user-requests.component';
import { SearchUserComponent } from './search-user/search-user.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', redirectTo: 'shell', pathMatch: 'full' },
      { path: 'shell', component: ShellComponent },
      { path: 'requests', component: UserRequestsComponent },
      { path: 'search', component: SearchUserComponent },
    ],
  },
];
