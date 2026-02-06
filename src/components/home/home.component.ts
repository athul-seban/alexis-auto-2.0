
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormsModule } from '@angular/forms';
import { ChatbotComponent } from '../chatbot/chatbot.component';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { HomeLandingComponent } from './home-landing/home-landing.component';
import { HomeContactComponent } from './home-contact/home-contact.component';
import { DataService, Car, TyreProduct } from '../../services/data.service';

type Page = 'home' | 'services' | 'tyres' | 'cars' | 'contact' | 'about';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule, 
    ChatbotComponent, 
    NavbarComponent, 
    FooterComponent, 
    ReactiveFormsModule, 
    FormsModule,
    HomeLandingComponent,
    HomeContactComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private router = inject(Router);
  public dataService = inject(DataService);
  private fb = inject(FormBuilder);

  currentPage = signal<Page>('home');
  
  // Search state
  tyreSearchQuery = '';
  foundTyres = signal<TyreProduct[]>([]);

  // Car Modal state
  selectedCar = signal<Car | null>(null);

  // Booking Modal state
  isBookingModalOpen = signal(false);
  bookingSubmitted = signal(false);

  bookingForm = this.fb.group({
    customerName: ['', Validators.required],
    contact: ['', Validators.required],
    serviceType: ['', Validators.required],
    date: ['', Validators.required],
    notes: ['']
  });

  navigateTo(page: string) {
    this.currentPage.set(page as Page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
}
