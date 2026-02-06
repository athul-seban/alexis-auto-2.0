
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  template: `
    <footer class="bg-black border-t border-white/10 py-16 mt-12">
        <div class="w-full max-w-[96%] mx-auto px-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <!-- Brand Column -->
            <div class="col-span-1 md:col-span-1">
              <h2 class="text-2xl font-bold italic brand-font text-white mb-4">ALEXIS</h2>
              <p class="text-xs text-gray-500 leading-relaxed mb-6">High-performance automotive care. Precision engineering for the modern driver.</p>
              <div class="flex space-x-4">
                 <div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#E30613] transition-colors cursor-pointer"><svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></div>
                 <div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#E30613] transition-colors cursor-pointer"><svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V14a6 6 0 0 1 6-6z"/><path d="M2 14v6h2v-6H2z"/><path d="M20 14v6h2v-6H20z"/><path d="M12 11a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3z"/></svg></div>
              </div>
            </div>

            <!-- Contacts Column -->
            <div class="col-span-1 md:col-span-2">
              <h3 class="text-sm font-bold text-white uppercase tracking-widest mb-6">Quick Contacts</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                   <p class="text-xs text-gray-500 uppercase mb-1">Email Support</p>
                   <a [href]="'mailto:' + dataService.companyInfo().contact.email" class="text-white hover:text-[#E30613] transition-colors">{{ dataService.companyInfo().contact.email }}</a>
                 </div>
                 <div>
                   <p class="text-xs text-gray-500 uppercase mb-1">Emergency / Bookings</p>
                   <a [href]="'tel:' + dataService.companyInfo().contact.phone.replace(' ', '')" class="text-white hover:text-[#E30613] transition-colors block">{{ dataService.companyInfo().contact.phone }}</a>
                   <a [href]="getWhatsAppLink(dataService.companyInfo().contact.whatsapp)" target="_blank" class="text-white hover:text-[#E30613] transition-colors flex items-center gap-2 mt-1">
                     <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-[#E30613] shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.506-.669-.514l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.015-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                     {{ dataService.companyInfo().contact.whatsapp }}
                   </a>
                 </div>
              </div>
            </div>

            <!-- Hours Column -->
            <div class="col-span-1 md:col-span-1">
              <h3 class="text-sm font-bold text-white uppercase tracking-widest mb-6">Opening Hours</h3>
              <div class="space-y-2">
                @for (time of dataService.companyInfo().openingHours; track time.day) {
                  <div class="flex justify-between text-xs">
                    <span class="text-gray-400">{{ time.day }}</span>
                    <span class="text-white">{{ time.hours }}</span>
                  </div>
                }
              </div>
            </div>
          </div>
          
          <div class="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
            <p>© 2024 Alexis Autos Limited. All rights reserved.</p>
            <div class="flex space-x-6 mt-4 md:mt-0">
              <a href="#" class="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" class="hover:text-white transition-colors">Terms of Service</a>
              <button (click)="navigateToAdmin()" class="hover:text-[#E30613] transition-colors font-bold uppercase text-[10px] tracking-widest">Admin Access</button>
            </div>
          </div>
        </div>
      </footer>
  `
})
export class FooterComponent {
  dataService = inject(DataService);
  router = inject(Router);

  getWhatsAppLink(number: string): string {
    return `https://wa.me/${number.replace(/[^0-9]/g, '')}`;
  }

  navigateToAdmin() {
    this.router.navigate(['/admin']);
  }
}
