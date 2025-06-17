import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Session } from '../models/session.model';
import { environment } from '../environement';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private baseUrl = environment.BASE_URL + '/sessions';

  constructor(private http: HttpClient) {
    console.log('constructor SessionService');
  }

  getSessions(): Observable<Session[]> {
    console.log('sessionService / getSessions');
    return this.http.post<Session[]>(
      this.baseUrl,
      {},
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      }
    );  
  }
}
