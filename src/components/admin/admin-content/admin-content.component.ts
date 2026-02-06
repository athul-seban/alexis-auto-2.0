
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { DataService, ServiceItem } from '../../../services/data.service';

@Component({
  selector: 'app-admin-content',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-content.component.html'
})
export class AdminContentComponent {
  dataService = inject(DataService);
  fb = inject(FormBuilder);

  editingServiceId = signal<number | null>(null);

  contactForm: FormGroup = this.fb.group({
     phone: ['', Validators.required],
     email: ['', [Validators.required, Validators.email]],
     whatsapp: ['', Validators.required]
  });

  serviceForm: FormGroup = this.fb.group({
     name: ['', Validators.required],
     description: ['', Validators.required]
  });

  constructor() {
    const info = this.dataService.companyInfo();
    this.contactForm.patchValue({
       phone: info.contact.phone,
       email: info.contact.email,
       whatsapp: info.contact.whatsapp
    });
  }

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
}
