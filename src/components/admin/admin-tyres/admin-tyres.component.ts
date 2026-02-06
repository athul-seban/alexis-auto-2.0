
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { DataService, TyreProduct } from '../../../services/data.service';

@Component({
  selector: 'app-admin-tyres',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-tyres.component.html'
})
export class AdminTyresComponent {
  dataService = inject(DataService);
  fb = inject(FormBuilder);

  editingTyreId = signal<number | null>(null);

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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64String = e.target.result;
        this.tyreProductForm.patchValue({ image: base64String });
      };
      reader.readAsDataURL(file);
    }
  }
}
