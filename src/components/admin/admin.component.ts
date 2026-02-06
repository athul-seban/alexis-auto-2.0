
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DataService, Booking, Car, TyreProduct, ServiceItem } from '../../services/data.service';
import { AdminLoginComponent } from './admin-login/admin-login.component';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AdminLoginComponent],
  templateUrl: './admin.component.html',
  styles: [`
    .font-michroma { font-family: 'Michroma', sans-serif; }
    .glass-panel {
      background: rgba(20, 20, 23, 0.9);
      backdrop-filter: blur(12px);
    }
  `]
})
export class AdminComponent {
  authService = inject(AuthService);
  dataService = inject(DataService);
  fb: FormBuilder = inject(FormBuilder);
  router = inject(Router);

  activeTab = signal<'bookings' | 'inventory' | 'tyres' | 'banner' | 'users' | 'content'>('bookings');
  passwordMsg = signal('');
  
  // Edit State
  editingCarId = signal<number | null>(null);
  editingTyreId = signal<number | null>(null);
  editingServiceId = signal<number | null>(null);

  selectedBooking = signal<Booking | null>(null);

  contactForm: FormGroup = this.fb.group({
     phone: ['', Validators.required],
     email: ['', [Validators.required, Validators.email]],
     whatsapp: ['', Validators.required]
  });

  serviceForm: FormGroup = this.fb.group({
     name: ['', Validators.required],
     description: ['', Validators.required]
  });

  carForm: FormGroup = this.fb.group({
    model: ['', Validators.required],
    year: [2024, Validators.required],
    engine: ['', Validators.required],
    price: [null, Validators.required],
    image: ['https://picsum.photos/seed/newcar/800/600', Validators.required],
    mileage: [0, Validators.required],
    transmission: ['Automatic', Validators.required],
    description: ['', Validators.required],
    features: ['', Validators.required]
  });

  tyreProductForm: FormGroup = this.fb.group({
    brand: ['', Validators.required],
    model: ['', Validators.required],
    size: ['', Validators.required],
    category: ['Premium', Validators.required],
    price: [null, Validators.required],
    offerPrice: [null],
    quantity: [10, Validators.required],
    specFuel: ['C', Validators.required],
    specWet: ['B', Validators.required],
    specNoise: [72, Validators.required],
    image: ['https://picsum.photos/seed/tyre/300/300']
  });

  userForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  constructor() {
    // Initial fetch handled by DataService but we might need to refresh forms if data changes
    const info = this.dataService.companyInfo();
    this.contactForm.patchValue({
       phone: info.contact.phone,
       email: info.contact.email,
       whatsapp: info.contact.whatsapp
    });
  }

  goHome() {
    this.router.navigate(['/']);
  }

  getPendingCount(): number {
    return this.dataService.bookings().filter(b => b.status === 'Pending').length;
  }

  updateStatus(id: number, status: Booking['status']) {
    this.dataService.updateBookingStatus(id, status).subscribe();
  }

  // --- Content Management ---
  saveContact() {
     if(this.contactForm.valid) {
        this.dataService.updateCompanyContact(this.contactForm.value);
        alert('Contact details updated successfully!');
     }
  }

  saveService() {
     if(this.serviceForm.valid) {
        if (this.editingServiceId()) {
           this.dataService.updateService(this.editingServiceId()!, this.serviceForm.value).subscribe(() => {
              this.editingServiceId.set(null);
              this.serviceForm.reset();
           });
        } else {
           this.dataService.addService(this.serviceForm.value).subscribe(() => {
              this.serviceForm.reset();
           });
        }
     }
  }

  removeService(id: number) {
     if(confirm('Delete this service?')) {
        this.dataService.removeService(id).subscribe();
     }
  }

  editService(service: ServiceItem) {
     this.editingServiceId.set(service.id);
     this.serviceForm.patchValue(service);
  }

  cancelServiceEdit() {
     this.editingServiceId.set(null);
     this.serviceForm.reset();
  }

  // --- Car Management ---
  saveCar() {
    if (this.carForm.valid) {
      const formVal = this.carForm.value;
      const featuresArray = typeof formVal.features === 'string' 
         ? formVal.features.split(',').map((f: string) => f.trim()).filter((f: string) => f.length > 0)
         : formVal.features;

      const carData = { ...formVal, features: featuresArray };

      if (this.editingCarId()) {
         this.dataService.updateCar(this.editingCarId()!, carData).subscribe(() => {
             this.editingCarId.set(null);
             this.resetCarForm();
         });
      } else {
         this.dataService.addCar(carData).subscribe(() => {
             this.resetCarForm();
         });
      }
    }
  }

  removeCar(id: number) {
     if(confirm('Delete this car?')) {
        this.dataService.removeCar(id).subscribe();
     }
  }

  editCar(car: Car) {
    this.editingCarId.set(car.id);
    this.carForm.patchValue({
       ...car,
       features: car.features.join(', ')
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelCarEdit() {
    this.editingCarId.set(null);
    this.resetCarForm();
  }

  resetCarForm() {
    this.carForm.reset({
      year: 2024,
      image: 'https://picsum.photos/seed/newcar/800/600',
      mileage: 0,
      transmission: 'Automatic',
      description: '',
      features: ''
   });
  }

  // --- Tyre Management ---
  saveTyreProduct() {
    if (this.tyreProductForm.valid) {
       const formVal = this.tyreProductForm.value;
       const product = {
          brand: formVal.brand,
          model: formVal.model,
          size: formVal.size,
          category: formVal.category,
          price: formVal.price,
          offerPrice: formVal.offerPrice || undefined,
          quantity: formVal.quantity,
          image: formVal.image || `https://picsum.photos/seed/${formVal.brand.toLowerCase()}/300/300`,
          specs: {
             fuel: formVal.specFuel,
             wet: formVal.specWet,
             noise: formVal.specNoise
          }
       };

       if (this.editingTyreId()) {
          this.dataService.updateTyreProduct(this.editingTyreId()!, product).subscribe(() => {
             this.editingTyreId.set(null);
             this.resetTyreForm();
          });
       } else {
          this.dataService.addTyreProduct(product).subscribe(() => {
             this.resetTyreForm();
          });
       }
    }
  }

  removeTyre(id: number) {
     if(confirm('Delete this tyre stock?')) {
        this.dataService.removeTyreProduct(id).subscribe();
     }
  }

  editTyre(tyre: TyreProduct) {
     this.editingTyreId.set(tyre.id);
     this.tyreProductForm.patchValue({
        ...tyre,
        specFuel: tyre.specs.fuel,
        specWet: tyre.specs.wet,
        specNoise: tyre.specs.noise
     });
     window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelTyreEdit() {
     this.editingTyreId.set(null);
     this.resetTyreForm();
  }

  resetTyreForm() {
    this.tyreProductForm.reset({ category: 'Premium', quantity: 10, specFuel: 'C', specWet: 'B', specNoise: 72, image: 'https://picsum.photos/seed/tyre/300/300' });
  }

  addTyreBrand(input: HTMLInputElement) {
    if (input.value.trim()) {
      this.dataService.addTyreBrand(input.value.trim());
      input.value = '';
    }
  }

  // --- Settings ---
  toggleBanner() {
    const current = this.dataService.banner();
    this.dataService.updateBanner(!current.active, current.reason);
  }

  updateBannerMsg(msg: string) {
    const current = this.dataService.banner();
    this.dataService.updateBanner(current.active, msg);
  }

  // --- Users ---
  addUser() {
    if (this.userForm.valid) {
      this.dataService.addUser(this.userForm.value).subscribe(() => {
         this.userForm.reset();
         alert('User added');
      }, err => alert('Error adding user (username might exist)'));
    }
  }

  changePassword(input: HTMLInputElement) {
    const newPass = input.value;
    const currentUser = this.authService.currentUser();
    if (newPass && currentUser) {
      this.dataService.changePassword(currentUser, newPass).subscribe(() => {
         input.value = '';
         this.passwordMsg.set('Password updated successfully');
         setTimeout(() => this.passwordMsg.set(''), 3000);
      });
    }
  }

  onFileSelected(event: any, type: 'car' | 'tyre') {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64String = e.target.result;
        if (type === 'car') {
          this.carForm.patchValue({ image: base64String });
        } else {
          this.tyreProductForm.patchValue({ image: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  }
}
