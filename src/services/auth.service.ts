
import { Injectable, signal, inject } from '@angular/core';
import { DataService } from './data.service';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private dataService = inject(DataService);
  
  isLoggedIn = signal<boolean>(false);
  currentUser = signal<string | null>(null);

  constructor() {
    const storedUser = sessionStorage.getItem('alexis_admin_user');
    const token = sessionStorage.getItem('alexis_token');
    
    if (storedUser && token) {
      this.isLoggedIn.set(true);
      this.currentUser.set(storedUser);
      // Load protected data now that we know we are logged in
      this.dataService.loadBookings();
    }
  }

  login(username: string, password: string): Observable<any> {
    return this.dataService.login(username, password).pipe(
      tap((res: any) => {
         if (res.access_token) {
           this.isLoggedIn.set(true);
           this.currentUser.set(res.username);
           sessionStorage.setItem('alexis_admin_user', res.username);
           sessionStorage.setItem('alexis_token', res.access_token);
           this.dataService.loadBookings();
         }
      })
    );
  }

  logout(): void {
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
    sessionStorage.removeItem('alexis_admin_user');
    sessionStorage.removeItem('alexis_token');
  }
}
