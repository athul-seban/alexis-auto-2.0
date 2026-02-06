
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.component.html'
})
export class FooterComponent {
  dataService = inject(DataService);
  router = inject(Router);

  getWhatsAppLink(number: string): string {
    return `https://wa.me/${number.replace(/[^0-9]/g, '')}`;
  }

  navigateToAdmin() {
    this.router.navigate(['/admin']);
  }
}
