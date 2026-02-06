
import { Component, output } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-home-landing',
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './home-landing.component.html',
  styleUrl: './home-landing.component.scss'
})
export class HomeLandingComponent {
  navigate = output<string>();
  
  partnerBrands = ['Michelin', 'Pirelli', 'Continental', 'Bridgestone', 'Goodyear', 'Dunlop'];
}
