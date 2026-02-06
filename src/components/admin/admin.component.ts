
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { AdminBookingsComponent } from './admin-bookings/admin-bookings.component';
import { AdminInventoryComponent } from './admin-inventory/admin-inventory.component';
import { AdminTyresComponent } from './admin-tyres/admin-tyres.component';
import { AdminContentComponent } from './admin-content/admin-content.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';

@Component({
  selector: 'app-admin',
  imports: [
    CommonModule, 
    AdminLoginComponent,
    AdminBookingsComponent,
    AdminInventoryComponent,
    AdminTyresComponent,
    AdminContentComponent,
    AdminUsersComponent
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  authService = inject(AuthService);
  dataService = inject(DataService);
  router = inject(Router);

  activeTab = signal<'bookings' | 'inventory' | 'tyres' | 'banner' | 'users' | 'content'>('bookings');

  goHome() {
    this.router.navigate(['/']);
  }

  getPendingCount(): number {
    return this.dataService.bookings().filter(b => b.status === 'Pending').length;
  }
}
