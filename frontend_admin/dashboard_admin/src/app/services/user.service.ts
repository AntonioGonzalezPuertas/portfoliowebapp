import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private userUrl = '/assets/users.json';

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.userUrl);
  }
}
