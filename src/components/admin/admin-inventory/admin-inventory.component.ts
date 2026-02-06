
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { DataService, Car } from '../../../services/data.service';

@Component({
  selector: 'app-admin-inventory',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-inventory.component.html'
})
export class AdminInventoryComponent {
  dataService = inject(DataService);
  fb = inject(FormBuilder);
  
  editingCarId = signal<number | null>(null);

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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64String = e.target.result;
        this.carForm.patchValue({ image: base64String });
      };
      reader.readAsDataURL(file);
    }
  }
}
