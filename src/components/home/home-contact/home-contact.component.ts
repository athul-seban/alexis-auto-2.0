
import { Component, inject, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-home-contact',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home-contact.component.html',
  styleUrl: './home-contact.component.css'
})
export class HomeContactComponent {
  dataService = inject(DataService);
  fb = inject(FormBuilder);
  
  isAbout = input<boolean>(false);
  bookingSubmitted = signal(false);

  bookingForm: FormGroup = this.fb.group({
    customerName: ['', Validators.required],
    contact: ['', Validators.required],
    serviceType: ['', Validators.required],
    date: ['', Validators.required],
    notes: ['']
  });

  getWhatsAppLink(number: string): string {
    return `https://wa.me/${number.replace(/[^0-9]/g, '')}`;
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
           this.bookingForm.reset();
           this.bookingSubmitted.set(false);
        }, 5000);
      });
    }
  }
}
