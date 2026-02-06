
import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
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

  aboutForm: FormGroup = this.fb.group({
    about: ['', Validators.required]
  });

  brandingForm: FormGroup = this.fb.group({
    facebook: [''],
    instagram: [''],
    logoDark: [''],
    logoLight: ['']
  });

  hoursForm: FormGroup = this.fb.group({
    hours: this.fb.array([])
  });

  facilitiesForm: FormGroup = this.fb.group({
    newFacility: ['']
  });

  serviceForm: FormGroup = this.fb.group({
     name: ['', Validators.required],
     description: ['', Validators.required]
  });

  constructor() {
    effect(() => {
      const info = this.dataService.companyInfo();
      this.contactForm.patchValue({
         phone: info.contact.phone,
         email: info.contact.email,
         whatsapp: info.contact.whatsapp
      }, { emitEvent: false });
      
      this.aboutForm.patchValue({
        about: info.about
      }, { emitEvent: false });

      this.brandingForm.patchValue({
        facebook: info.socialMedia?.facebook || '',
        instagram: info.socialMedia?.instagram || '',
        logoDark: info.logos?.dark || '',
        logoLight: info.logos?.light || ''
      }, { emitEvent: false });

      if (this.hoursArray.length === 0 && info.openingHours.length > 0) {
        this.initHours();
      }
    });
  }

  // --- BRANDING MANAGEMENT ---
  onLogoSelected(event: any, mode: 'dark' | 'light') {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64String = e.target.result;
        if (mode === 'dark') {
          this.brandingForm.patchValue({ logoDark: base64String });
        } else {
          this.brandingForm.patchValue({ logoLight: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  }

  saveBranding() {
    if (this.brandingForm.valid) {
      const info = this.dataService.companyInfo();
      const val = this.brandingForm.value;
      
      this.dataService.updateCompanySettings({
        ...info,
        socialMedia: {
          facebook: val.facebook,
          instagram: val.instagram
        },
        logos: {
          dark: val.logoDark,
          light: val.logoLight
        }
      });
      alert('Branding settings updated');
    }
  }

  // --- HOURS MANAGEMENT ---
  get hoursArray() {
    return this.hoursForm.get('hours') as FormArray;
  }

  initHours() {
    const hours = this.dataService.companyInfo().openingHours;
    this.hoursArray.clear();
    hours.forEach(h => {
      this.hoursArray.push(this.fb.group({
        day: [h.day, Validators.required],
        hours: [h.hours, Validators.required]
      }));
    });
  }

  addHourRow() {
    this.hoursArray.push(this.fb.group({ day: '', hours: '' }));
  }

  removeHourRow(index: number) {
    this.hoursArray.removeAt(index);
  }

  saveHours() {
    if (this.hoursForm.valid) {
      const info = this.dataService.companyInfo();
      const newHours = this.hoursForm.value.hours;
      this.dataService.updateCompanySettings({
        ...info,
        openingHours: newHours
      });
      alert('Opening hours updated');
    }
  }

  // --- ABOUT MANAGEMENT ---
  saveAbout() {
    if (this.aboutForm.valid) {
      const info = this.dataService.companyInfo();
      this.dataService.updateCompanySettings({
        ...info,
        about: this.aboutForm.value.about
      });
      alert('About text updated');
    }
  }

  // --- FACILITIES MANAGEMENT ---
  addFacility() {
    const val = this.facilitiesForm.value.newFacility?.trim();
    if (val) {
      const info = this.dataService.companyInfo();
      // avoid dupes
      if (!info.facilities.includes(val)) {
        this.dataService.updateCompanySettings({
          ...info,
          facilities: [...info.facilities, val]
        });
      }
      this.facilitiesForm.reset();
    }
  }

  removeFacility(facility: string) {
    const info = this.dataService.companyInfo();
    this.dataService.updateCompanySettings({
      ...info,
      facilities: info.facilities.filter(f => f !== facility)
    });
  }


  // --- CONTACT & SERVICES (Existing) ---
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
