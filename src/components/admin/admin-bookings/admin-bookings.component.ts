
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, Booking } from '../../../services/data.service';

@Component({
  selector: 'app-admin-bookings',
  imports: [CommonModule],
  templateUrl: './admin-bookings.component.html'
})
export class AdminBookingsComponent {
  dataService = inject(DataService);

  updateStatus(id: number, status: Booking['status']) {
    this.dataService.updateBookingStatus(id, status).subscribe();
  }
}
