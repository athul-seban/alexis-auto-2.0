
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { ChatbotComponent } from '../chatbot/chatbot.component';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { DataService, Car, TyreProduct } from '../../services/data.service';

type Page = 'home' | 'services' | 'tyres' | 'cars' | 'contact' | 'about';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ChatbotComponent, NavbarComponent, FooterComponent, ReactiveFormsModule, FormsModule],
  templateUrl: './home.component.html',
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.6s ease-out forwards;
    }
    @keyframes slide-in-right {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .animate-slide-in-right {
      animation: slide-in-right 0.8s ease-out forwards;
    }
    .liquid-chrome-text {
      background: linear-gradient(to right, #fff, #aaa, #fff);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      background-size: 200% auto;
      animation: shine 4s linear infinite;
    }
    @keyframes shine {
      to { background-position: 200% center; }
    }
    .custom-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .custom-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .brand-font { font-family: 'Michroma', sans-serif; }
    .sub-brand-font { font-family: 'Montserrat', sans-serif; }
  `]
})
export class HomeComponent {
  private router = inject(Router);
  public dataService = inject(DataService);
  private fb = inject(FormBuilder);

  currentPage = signal<Page>('home');
  mobileMenuOpen = signal(false);
  
  // Search state
  tyreSearchQuery = '';
  foundTyres = signal<TyreProduct[]>([]);

  // Car Modal state
  selectedCar = signal<Car | null>(null);

  // Booking Modal state
  isBookingModalOpen = signal(false);
  bookingSubmitted = signal(false);

  // Static
  partnerBrands = ['Michelin', 'Pirelli', 'Continental', 'Bridgestone', 'Goodyear', 'Dunlop'];

  bookingForm = this.fb.group({
    customerName: ['', Validators.required],
    contact: ['', Validators.required],
    serviceType: ['', Validators.required],
    date: ['', Validators.required],
    notes: ['']
  });

  resolvePage(item: string): Page {
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

  navigateTo(page: string) {
    this.currentPage.set(page as Page);
    this.mobileMenuOpen.set(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update(v => !v);
  }

  searchTyres() {
    this.foundTyres.set(this.dataService.searchTyres(this.tyreSearchQuery));
  }

  viewCarDetails(car: Car) {
    this.selectedCar.set(car);
    document.body.style.overflow = 'hidden';
  }

  closeCarDetails() {
    this.selectedCar.set(null);
    document.body.style.overflow = 'auto';
  }

  enquireCar(car: Car) {
    this.closeCarDetails();
    this.openBookingModal(`Car Enquiry: ${car.model}`);
  }

  openBookingModal(serviceName?: string) {
    this.isBookingModalOpen.set(true);
    this.bookingSubmitted.set(false);
    if (serviceName) {
      this.bookingForm.patchValue({ serviceType: serviceName });
    }
    document.body.style.overflow = 'hidden';
  }

  closeBookingModal() {
    this.isBookingModalOpen.set(false);
    this.bookingForm.reset();
    document.body.style.overflow = 'auto';
  }

  submitBooking() {
    if (this.bookingForm.valid) {
      const formVal = this.bookingForm.value;
      this.dataService.addBooking({
        customerName: formVal.customerName!,
        contact: formVal.contact!,
        serviceType: formVal.serviceType!,
        date: formVal.date!,
        notes: formVal.notes || undefined
      }).subscribe(() => {
        this.bookingSubmitted.set(true);
        setTimeout(() => {
           this.closeBookingModal();
        }, 3000);
      });
    }
  }
  
  getWhatsAppLink(number: string): string {
    return `https://wa.me/${number.replace(/[^0-9]/g, '')}`;
  }

  navigateToAdmin() {
    this.router.navigate(['/admin']);
  }
}
