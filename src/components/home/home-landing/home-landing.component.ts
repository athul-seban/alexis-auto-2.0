
import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-landing',
  imports: [CommonModule],
  templateUrl: './home-landing.component.html'
})
export class HomeLandingComponent {
  navigate = output<string>();
  
  partnerBrands = ['Michelin', 'Pirelli', 'Continental', 'Bridgestone', 'Goodyear', 'Dunlop'];
}
