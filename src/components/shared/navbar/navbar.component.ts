
import { Component, inject, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  dataService = inject(DataService);
  
  // Inputs/Outputs
  currentPage = input<string>('home');
  navigate = output<string>();
  
  mobileMenuOpen = signal(false);
  menuItems = ['Home', 'Service', 'Tyres', 'Buy a Car', 'Contact', 'About'];

  resolvePage(item: string): string {
    switch (item) {
      case 'Home': return 'home';
      case 'Service': return 'services';
      case 'Tyres': return 'tyres';
      case 'Buy a Car': return 'cars';
      case 'Contact': return 'contact';
      case 'About': return 'about';
      default: return 'home';
    }
  }

  onMobileNavigate(item: string) {
    this.navigate.emit(this.resolvePage(item));
    this.mobileMenuOpen.set(false);
  }
}
