
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
  template: `
    <div class="min-h-screen flex flex-col relative overflow-x-hidden">
      
      <!-- Banner Section -->
      @if (dataService.banner().active) {
        <div class="bg-[#E30613] text-white text-center py-3 px-4 fixed top-0 left-0 right-0 z-50 font-bold uppercase tracking-widest shadow-lg animate-pulse">
           ⚠️ NOTICE: {{ dataService.banner().reason }}
        </div>
      }

      <!-- Reusable Navbar -->
      <app-navbar 
        [currentPage]="currentPage()" 
        (navigate)="navigateTo($event)" 
      ></app-navbar>

      <!-- Spacer for fixed header -->
      <div class="h-24" [class.mt-12]="dataService.banner().active"></div>

      <!-- Main Content Area -->
      <main class="flex-grow">
        
        <!-- HOME PAGE -->
        @if (currentPage() === 'home') {
          <div class="relative animate-fade-in">
            <!-- Hero Section -->
            <div class="relative w-full max-w-[96%] mx-auto px-4 mt-8">
               <div class="relative rounded-3xl overflow-hidden h-[70vh] border border-white/10 shadow-2xl">
                 <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10"></div>
                 
                 <img src="https://picsum.photos/seed/luxury-car/1920/1080" fetchpriority="high" class="absolute inset-0 w-full h-full object-cover" alt="Luxury Sports Car in Showroom">
                 
                 <div class="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-16">
                   <span class="text-[#E30613] font-bold tracking-[0.4em] text-xs md:text-sm uppercase mb-4 animate-slide-in-right">Loughborough's Finest</span>
                   <h2 class="text-4xl md:text-7xl font-bold italic brand-font mb-6 leading-tight liquid-chrome-text max-w-3xl">
                     PRECISION <br/> ENGINEERING.
                   </h2>
                   <p class="text-lg text-gray-300 sub-brand-font mb-10 tracking-wide max-w-lg font-light">
                     Specialists in high-performance maintenance, premium tyres, and luxury vehicle sales.
                   </p>
                   <div class="flex flex-col sm:flex-row gap-4">
                     <button (click)="navigateTo('services')" class="bg-[#E30613] hover:bg-red-700 text-white font-bold py-4 px-10 rounded-full transition-all hover:shadow-[0_0_20px_rgba(227,6,19,0.4)] uppercase tracking-widest text-xs">
                       Book Service
                     </button>
                     <button (click)="navigateTo('contact')" class="bg-transparent border border-white/30 hover:border-white text-white font-bold py-4 px-10 rounded-full transition-all uppercase tracking-widest text-xs backdrop-blur-sm">
                       Contact Us
                     </button>
                   </div>
                 </div>
               </div>
            </div>

            <!-- Brands Ticker -->
            <div class="w-full max-w-[96%] mx-auto px-4 mt-8">
              <div class="glass-panel py-6 px-8 rounded-xl flex flex-wrap justify-between items-center gap-6 opacity-80">
                <span class="text-xs font-bold text-gray-500 uppercase tracking-widest mr-4 border-r border-gray-700 pr-6 h-full">Specialists In</span>
                @for (brand of partnerBrands; track brand) {
                  <span class="text-gray-400 font-bold uppercase tracking-wider text-sm hover:text-[#E30613] transition-colors cursor-default">{{ brand }}</span>
                }
              </div>
            </div>

            <!-- Quick Links Grid -->
            <div class="w-full max-w-[96%] mx-auto px-4 py-20">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Card 1 -->
                <div class="glass-panel p-8 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group relative overflow-hidden" (click)="navigateTo('tyres')">
                  <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-32 w-32 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 class="text-2xl font-bold mb-2 brand-font italic text-white group-hover:text-[#E30613] transition-colors">TYRES</h3>
                  <p class="text-gray-400 text-sm leading-relaxed mb-4">Michelin, Pirelli, Continental. Performance rubber for road and track.</p>
                  <div class="w-12 h-1 bg-[#E30613] rounded-full group-hover:w-full transition-all duration-500"></div>
                </div>

                <!-- Card 2 -->
                <div class="glass-panel p-8 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group relative overflow-hidden" (click)="navigateTo('services')">
                  <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-32 w-32 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
                  </div>
                  <h3 class="text-2xl font-bold mb-2 brand-font italic text-white group-hover:text-[#E30613] transition-colors">SERVICE</h3>
                  <p class="text-gray-400 text-sm leading-relaxed mb-4">Diagnostics, engine work, and manufacturer-spec servicing.</p>
                  <div class="w-12 h-1 bg-[#E30613] rounded-full group-hover:w-full transition-all duration-500"></div>
                </div>

                <!-- Card 3 -->
                <div class="glass-panel p-8 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group relative overflow-hidden" (click)="navigateTo('cars')">
                  <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-32 w-32 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <h3 class="text-2xl font-bold mb-2 brand-font italic text-white group-hover:text-[#E30613] transition-colors">SALES</h3>
                  <p class="text-gray-400 text-sm leading-relaxed mb-4">A curated selection of performance vehicles for the discerning driver.</p>
                  <div class="w-12 h-1 bg-[#E30613] rounded-full group-hover:w-full transition-all duration-500"></div>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- SERVICE PAGE -->
        @if (currentPage() === 'services' || currentPage() === 'tyres') {
          <div class="w-full max-w-[96%] mx-auto px-4 py-12 animate-fade-in">
            <h2 class="text-4xl font-bold mb-8 brand-font italic text-white text-center">
              {{ currentPage() === 'tyres' ? 'PERFORMANCE TYRES' : 'EXPERT SERVICES' }}
            </h2>
            
            @if (currentPage() === 'services') {
              <p class="text-center text-gray-400 max-w-2xl mx-auto mb-16">
                Comprehensive automotive care delivered by certified technicians. We use state-of-the-art diagnostic equipment to ensure your vehicle performs at its peak.
              </p>

              <!-- Services Grid (DYNAMIC) -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
                @for (service of dataService.services(); track service.id) {
                  <div class="glass-panel p-6 rounded-xl hover:bg-white/5 transition-all group border-t-4 border-t-transparent hover:border-t-[#E30613] flex flex-col relative overflow-hidden h-full">
                    <div class="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                       <svg class="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
                    </div>
                    <div class="mb-4">
                       <h3 class="text-xl font-bold text-white mb-2 brand-font italic relative z-10 group-hover:text-[#E30613] transition-colors">{{ service.name }}</h3>
                       <div class="w-12 h-0.5 bg-[#E30613] rounded-full mb-4"></div>
                    </div>
                    <p class="text-sm text-gray-400 mb-6 flex-grow relative z-10 leading-relaxed">{{ service.description }}</p>
                    <button (click)="openBookingModal(service.name)" class="text-[#E30613] text-xs font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2 self-start mt-auto relative z-10">
                      Book Now <span class="group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                  </div>
                }
              </div>

              <!-- Facilities & Locations Split (DYNAMIC) -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <!-- Facilities -->
                 <div class="glass-panel p-8 rounded-2xl h-full">
                    <h3 class="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">CUSTOMER FACILITIES</h3>
                    <div class="grid grid-cols-2 gap-y-4 gap-x-2">
                       @for (facility of dataService.companyInfo().facilities; track facility) {
                         <div class="flex items-center gap-3 text-gray-300 group">
                            <div class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#E30613] transition-colors shrink-0">
                              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                            </div>
                            <span class="text-sm font-bold">{{ facility }}</span>
                         </div>
                       }
                    </div>
                 </div>

                 <!-- Locations -->
                 <div class="glass-panel p-8 rounded-2xl h-full">
                    <h3 class="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">OUR LOCATIONS</h3>
                    <div class="space-y-6">
                       @for (center of dataService.locations(); track center.city) {
                         <div class="flex items-start gap-4">
                            <div class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                               <svg class="w-5 h-5 text-[#E30613]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                            </div>
                            <div>
                              <h4 class="text-white font-bold text-lg">{{ center.city }}</h4>
                              <p class="text-xs text-[#E30613] uppercase tracking-wider mb-1 font-bold">{{ center.type }}</p>
                              <p class="text-xs text-gray-500">{{ center.addressLine }}</p>
                            </div>
                         </div>
                       }
                    </div>
                 </div>
              </div>

            } @else {
               <!-- Tyre Specific Content with Vehicle Lookup -->
               <div class="space-y-12">
                 <!-- Search Section -->
                 <div class="max-w-3xl mx-auto text-center">
                    <div class="glass-panel p-8 rounded-2xl border-t-4 border-t-[#E30613] relative overflow-hidden">
                       <div class="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
                       <h3 class="text-2xl font-bold text-white mb-6 font-michroma italic">FIND YOUR TYRES</h3>
                       <p class="text-gray-400 mb-8 max-w-lg mx-auto">Enter your vehicle registration or model to instantly see compatible premium, mid-range, and budget tyre options.</p>
                       <div class="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-xl mx-auto">
                          <!-- Number Plate Style Input -->
                          <div class="relative w-full">
                            <div class="bg-[#facc15] text-black px-4 py-3 rounded-lg border-4 border-black font-bold text-2xl font-mono text-center tracking-widest shadow-lg uppercase relative">
                               <div class="absolute left-0 top-0 bottom-0 w-8 bg-[#003399] flex flex-col items-center justify-center rounded-l-sm border-r-2 border-white/50">
                                  <span class="text-[8px] text-white">UK</span>
                               </div>
                               <input 
                                 type="text" 
                                 [(ngModel)]="tyreSearchQuery" 
                                 (keyup.enter)="searchTyres()"
                                 placeholder="ENTER REG" 
                                 class="bg-transparent border-none text-center w-full h-full focus:outline-none placeholder-black/30 uppercase pl-6"
                               >
                            </div>
                          </div>
                          <button (click)="searchTyres()" class="w-full sm:w-auto bg-[#E30613] hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(227,6,19,0.3)] hover:shadow-[0_0_25px_rgba(227,6,19,0.5)] whitespace-nowrap">
                             Search
                          </button>
                       </div>
                    </div>
                 </div>

                 <!-- Results Grid -->
                 @if (foundTyres().length > 0) {
                   <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fade-in">
                      @for (tyre of foundTyres(); track tyre.id) {
                         <div class="glass-panel p-6 rounded-2xl hover:border-[#E30613] transition-all group flex flex-col h-full relative overflow-hidden">
                            <div class="absolute top-4 right-4 z-10">
                               <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/80 text-white border border-white/10" 
                                 [class.text-[#E30613]]="tyre.category === 'Premium'"
                                 [class.text-blue-400]="tyre.category === 'Mid-Range'"
                                 [class.text-green-400]="tyre.category === 'Budget'">
                                 {{ tyre.category }}
                               </span>
                            </div>
                            <div class="flex justify-center mb-6 relative">
                               <div class="w-48 h-48 rounded-full bg-white/5 flex items-center justify-center relative z-0">
                                  <img [src]="tyre.image" class="w-32 h-32 object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500">
                               </div>
                            </div>
                            <div class="mb-4">
                               <h3 class="text-xl font-bold text-white italic font-michroma">{{ tyre.brand }}</h3>
                               <p class="text-gray-400 text-sm font-bold">{{ tyre.model }}</p>
                               <p class="text-gray-500 text-xs mt-1">{{ tyre.size }}</p>
                            </div>
                            <div class="grid grid-cols-3 gap-2 mb-6 text-center text-xs text-gray-400 bg-black/40 p-3 rounded-lg border border-white/5">
                               <div class="flex flex-col items-center gap-1 border-r border-white/10">
                                  <span class="font-bold text-white">{{ tyre.specs.fuel }}</span>
                                  <span class="text-[8px] uppercase">Fuel Eff.</span>
                               </div>
                               <div class="flex flex-col items-center gap-1 border-r border-white/10">
                                  <span class="font-bold text-white">{{ tyre.specs.wet }}</span>
                                  <span class="text-[8px] uppercase">Wet Grip</span>
                               </div>
                               <div class="flex flex-col items-center gap-1">
                                  <span class="font-bold text-white">{{ tyre.specs.noise }}dB</span>
                                  <span class="text-[8px] uppercase">Noise</span>
                               </div>
                            </div>
                            <div class="mt-auto pt-6 border-t border-white/10 flex items-center justify-between">
                               <div>
                                  <p class="text-[10px] text-gray-500 uppercase">Fully Fitted</p>
                                  @if (tyre.offerPrice && tyre.offerPrice < tyre.price) {
                                     <div class="flex flex-col">
                                        <span class="text-xs text-gray-500 line-through">£{{ tyre.price | number:'1.2-2' }}</span>
                                        <span class="text-2xl font-bold text-[#E30613]">£{{ tyre.offerPrice | number:'1.2-2' }}</span>
                                     </div>
                                  } @else {
                                     <p class="text-2xl font-bold text-white">£{{ tyre.price | number:'1.2-2' }}</p>
                                  }
                                  @if (tyre.quantity > 0) {
                                     <p class="text-[10px] text-green-500 mt-1">● In Stock ({{tyre.quantity}})</p>
                                  } @else {
                                     <p class="text-[10px] text-red-500 mt-1">● Out of Stock</p>
                                  }
                               </div>
                            </div>
                         </div>
                      }
                   </div>
                 } @else {
                   <div class="glass-panel p-8 rounded-2xl animate-fade-in">
                      <h3 class="text-xl font-bold text-white mb-6 sub-brand-font tracking-wider border-b border-white/10 pb-4 text-center">OUR PARTNER BRANDS</h3>
                      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                         @for (brand of dataService.tyreBrands(); track brand.name) {
                           <div class="bg-black/40 p-6 rounded-xl text-center border border-white/5 hover:border-[#E30613] transition-colors group cursor-default">
                              <span class="block text-lg font-bold text-white group-hover:text-[#E30613] transition-colors">{{ brand.name }}</span>
                           </div>
                         }
                      </div>
                   </div>
                 }
               </div>
            }
          </div>
        }

        <!-- CARS PAGE -->
        @if (currentPage() === 'cars') {
          <div class="w-full max-w-[96%] mx-auto px-4 py-12 animate-fade-in">
            <h2 class="text-4xl font-bold mb-12 brand-font italic text-white text-center">CURRENT INVENTORY</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              @for (car of dataService.inventory(); track car.id) {
                <div class="bg-[#0f0f11] rounded-2xl overflow-hidden group border border-white/5 hover:border-[#E30613] transition-all hover:-translate-y-1 shadow-lg flex flex-col">
                  <div class="relative h-56 overflow-hidden">
                    <img [src]="car.image" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Luxury Car for Sale">
                    <div class="absolute top-3 right-3 bg-[#E30613] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">For Sale</div>
                  </div>
                  <div class="p-6 flex flex-col flex-grow">
                    <div class="flex justify-between items-start mb-2">
                      <h3 class="text-xl font-bold text-white brand-font italic">{{ car.model }}</h3>
                    </div>
                    <p class="text-gray-500 text-xs mb-4 uppercase tracking-wider">{{ car.year }} • {{ car.engine }}</p>
                    <div class="w-full h-[1px] bg-white/10 mb-4 mt-auto"></div>
                    <div class="flex justify-between items-center">
                       <span class="text-2xl font-bold text-white">£{{ car.price | number }}</span>
                       <button (click)="viewCarDetails(car)" class="text-xs bg-white text-black font-bold px-4 py-2 rounded-full hover:bg-[#E30613] hover:text-white transition-colors uppercase tracking-wider">View Details</button>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- CONTACT / ABOUT PAGE -->
        @if (currentPage() === 'contact' || currentPage() === 'about') {
          <div class="w-full max-w-[96%] mx-auto px-4 py-12 animate-fade-in">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              <div class="space-y-8">
                <h2 class="text-4xl font-bold mb-8 brand-font italic text-white">{{ currentPage() === 'contact' ? 'GET IN TOUCH' : 'ABOUT ALEXIS AUTOS' }}</h2>
                
                @if (currentPage() === 'about') {
                  <div class="prose prose-invert max-w-none">
                    <p class="text-lg text-gray-300 leading-relaxed font-light">
                      <strong class="text-white">Alexis Autos Limited</strong> represents speed, precision, and automotive excellence. Established in Loughborough, we have dedicated ourselves to providing top-tier service for enthusiasts of luxury and sports vehicles.
                    </p>
                    <p class="text-gray-400 leading-relaxed font-light mt-4">
                      Our state-of-the-art facility is equipped to handle everything from routine maintenance to complex engine diagnostics. We believe in transparency, quality, and performance.
                    </p>
                  </div>
                }

                <!-- Contact Info Cards (DYNAMIC) -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Phone Card (Call & Chat) -->
                  <div class="glass-panel p-6 rounded-2xl hover:border-[#E30613] transition-colors group flex flex-col justify-between">
                     <div>
                        <div class="flex items-center gap-3 mb-4">
                          <div class="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-[#E30613] transition-colors">
                              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                          </div>
                          <h4 class="text-sm font-bold text-gray-400 uppercase tracking-wider">Contact Us</h4>
                        </div>
                        
                        <div class="mb-4">
                          <p class="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Main Line</p>
                          <a [href]="'tel:' + dataService.companyInfo().contact.phone.replace(' ', '')" class="block text-lg font-bold text-white hover:text-[#E30613] transition-colors">{{ dataService.companyInfo().contact.phone }}</a>
                        </div>

                        <div>
                           <p class="text-[10px] text-gray-500 uppercase tracking-widest mb-1">WhatsApp / Message</p>
                           <a [href]="getWhatsAppLink(dataService.companyInfo().contact.whatsapp)" target="_blank" class="flex items-center gap-2 text-lg font-bold text-white hover:text-[#E30613] transition-colors">
                              <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-[#E30613] shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.506-.669-.514l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.015-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                              {{ dataService.companyInfo().contact.whatsapp }}
                           </a>
                        </div>
                     </div>
                  </div>

                  <!-- Email Card (DYNAMIC) -->
                  <div class="glass-panel p-6 rounded-2xl hover:border-[#E30613] transition-colors group">
                     <div class="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#E30613] transition-colors">
                        <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                     </div>
                     <h4 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Email Us</h4>
                     <a [href]="'mailto:' + dataService.companyInfo().contact.email" class="block text-lg font-bold text-white hover:text-[#E30613] transition-colors break-words">{{ dataService.companyInfo().contact.email }}</a>
                  </div>
                </div>

                <!-- Opening Hours Card (DYNAMIC) -->
                <div class="glass-panel p-6 rounded-2xl border-l-4 border-l-[#E30613]">
                  <h4 class="text-[#E30613] font-bold mb-4 uppercase tracking-wider">Opening Hours</h4>
                  <div class="space-y-2">
                    @for (time of dataService.companyInfo().openingHours; track time.day) {
                      <div class="flex justify-between text-sm">
                        <span class="text-gray-400">{{ time.day }}</span>
                        <span class="text-white font-bold">{{ time.hours }}</span>
                      </div>
                    }
                  </div>
                </div>

                <!-- Address Card (DYNAMIC) -->
                <div class="glass-panel p-6 rounded-2xl border-l-4 border-l-[#E30613]">
                  <h4 class="text-[#E30613] font-bold mb-3 uppercase tracking-wider">Loughborough (Main Service Centre)</h4>
                  <div class="text-gray-300 space-y-1">
                     @for (line of dataService.companyInfo().address.lines; track line) {
                       <p>{{ line }}</p>
                     }
                  </div>
                  <div class="mt-4 pt-4 border-t border-white/10">
                    <h5 class="text-gray-400 font-bold text-xs uppercase mb-1">Also serving</h5>
                    <p class="text-gray-300">Leicester (Tyre Shop) - 142 Narborough Road</p>
                  </div>
                </div>
              </div>

              <!-- Map and Booking Form Column -->
              <div class="space-y-8" id="booking-section">
                 <!-- Online Booking Request Form -->
                 <div class="glass-panel p-6 rounded-2xl border-t-4 border-t-[#E30613] relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-4 opacity-5">
                       <svg class="w-32 h-32 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-6 font-michroma italic">REQUEST BOOKING</h3>
                    
                    @if (bookingSubmitted() && !isBookingModalOpen()) {
                      <div class="bg-green-600/20 border border-green-600 text-green-100 p-4 rounded text-center animate-fade-in">
                         <p class="font-bold">Request Sent Successfully!</p>
                         <p class="text-xs mt-1">Our team will contact you shortly to confirm.</p>
                         <button (click)="bookingSubmitted.set(false)" class="mt-4 text-xs underline">Send another</button>
                      </div>
                    } @else {
                      <form [formGroup]="bookingForm" (ngSubmit)="submitBooking()" class="space-y-4 relative z-10">
                         <div>
                            <label class="block text-[10px] uppercase text-gray-500 mb-1 font-bold tracking-wider">Your Name</label>
                            <input formControlName="customerName" class="w-full bg-black/50 border border-white/20 rounded p-2 text-sm text-white focus:border-[#E30613] focus:outline-none placeholder-gray-700" placeholder="John Doe">
                         </div>
                         <div>
                            <label class="block text-[10px] uppercase text-gray-500 mb-1 font-bold tracking-wider">Contact Number / Email</label>
                            <input formControlName="contact" class="w-full bg-black/50 border border-white/20 rounded p-2 text-sm text-white focus:border-[#E30613] focus:outline-none placeholder-gray-700" placeholder="07700 900000">
                         </div>
                         <div class="grid grid-cols-2 gap-4">
                            <div>
                               <label class="block text-[10px] uppercase text-gray-500 mb-1 font-bold tracking-wider">Service Type</label>
                               <select formControlName="serviceType" class="w-full bg-black/50 border border-white/20 rounded p-2 text-sm text-white focus:border-[#E30613] focus:outline-none appearance-none">
                                  <option value="">Select...</option>
                                  @for (s of dataService.services(); track s.id) {
                                    <option [value]="s.name">{{ s.name }}</option>
                                  }
                               </select>
                            </div>
                            <div>
                               <label class="block text-[10px] uppercase text-gray-500 mb-1 font-bold tracking-wider">Preferred Date</label>
                               <input type="date" formControlName="date" class="w-full bg-black/50 border border-white/20 rounded p-2 text-sm text-white focus:border-[#E30613] focus:outline-none [color-scheme:dark]">
                            </div>
                         </div>
                         <div>
                            <label class="block text-[10px] uppercase text-gray-500 mb-1 font-bold tracking-wider">Notes (Optional)</label>
                            <textarea formControlName="notes" rows="2" class="w-full bg-black/50 border border-white/20 rounded p-2 text-sm text-white focus:border-[#E30613] focus:outline-none placeholder-gray-700" placeholder="Vehicle model, registration, or specific issues..."></textarea>
                         </div>
                         <button type="submit" [disabled]="bookingForm.invalid" class="w-full bg-[#E30613] hover:bg-red-700 text-white font-bold py-3 rounded text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(227,6,19,0.3)] hover:shadow-[0_0_25px_rgba(227,6,19,0.5)] disabled:opacity-50 disabled:cursor-not-allowed">
                           Submit Request
                         </button>
                      </form>
                    }
                 </div>
                 <!-- Map section remains unchanged ... -->
                 <div class="h-[400px] bg-[#1a1a1a] rounded-2xl relative overflow-hidden border border-white/10 shadow-2xl">
                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d214.20024452003523!2d-1.2228218143705194!3d52.774582689345586!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4879e10078bc838b%3A0x44d49898f184dae1!2sALEXIS%20AUTOS%20LIMITED!5e1!3m2!1sen!2sin!4v1770209070417!5m2!1sen!2sin" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" class="opacity-70 hover:opacity-100 transition-opacity grayscale invert contrast-125"></iframe>
                    <div class="absolute bottom-4 left-4 right-4 flex justify-center">
                      <a href="https://maps.app.goo.gl/M7UJckHJ4gVzpBiR9" target="_blank" class="bg-black/80 backdrop-blur-md text-white border border-[#E30613] px-6 py-3 rounded-full hover:bg-[#E30613] flex items-center text-sm font-bold uppercase tracking-wider transition-all shadow-lg">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Navigate to Workshop
                      </a>
                    </div>
                 </div>
              </div>

            </div>
          </div>
        }

      </main>

      <!-- Reusable Footer -->
      <app-footer></app-footer>

      <!-- Chat Widget -->
      <app-chatbot></app-chatbot>
      
      <!-- MODALS (Same as before, updated service binding) -->
      @if (selectedCar(); as car) {
        <!-- ... Car Modal Content Unchanged ... -->
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div class="absolute inset-0 bg-black/90 backdrop-blur-sm" (click)="closeCarDetails()"></div>
           <div class="relative bg-[#0f0f11] w-full max-w-4xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
              <!-- Close Button -->
              <button (click)="closeCarDetails()" class="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center hover:bg-[#E30613] transition-colors text-white">
                 <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              <!-- Scrollable Content -->
              <div class="overflow-y-auto custom-scrollbar">
                 <div class="relative h-64 md:h-96">
                    <img [src]="car.image" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-gradient-to-t from-[#0f0f11] via-transparent to-transparent"></div>
                    <div class="absolute bottom-6 left-6 md:left-10">
                       <span class="bg-[#E30613] text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-sm mb-2 inline-block">For Sale</span>
                       <h2 class="text-3xl md:text-5xl font-bold text-white brand-font italic">{{ car.model }}</h2>
                    </div>
                 </div>
                 <div class="p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div class="md:col-span-2 space-y-8">
                       <!-- Specs Grid -->
                       <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div class="bg-white/5 p-4 rounded-xl border border-white/5">
                             <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Year</p>
                             <p class="text-white font-bold">{{ car.year }}</p>
                          </div>
                          <div class="bg-white/5 p-4 rounded-xl border border-white/5">
                             <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Engine</p>
                             <p class="text-white font-bold">{{ car.engine }}</p>
                          </div>
                          <div class="bg-white/5 p-4 rounded-xl border border-white/5">
                             <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Mileage</p>
                             <p class="text-white font-bold">{{ car.mileage | number }} mi</p>
                          </div>
                          <div class="bg-white/5 p-4 rounded-xl border border-white/5">
                             <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Transmission</p>
                             <p class="text-white font-bold">{{ car.transmission }}</p>
                          </div>
                       </div>
                       <!-- Description -->
                       <div>
                          <h3 class="text-lg font-bold text-white mb-4 uppercase tracking-wider">Vehicle Overview</h3>
                          <p class="text-gray-400 leading-relaxed font-light">{{ car.description }}</p>
                       </div>
                       <!-- Features -->
                       <div>
                          <h3 class="text-lg font-bold text-white mb-4 uppercase tracking-wider">Key Features</h3>
                          <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-300 text-sm">
                             @for (feature of car.features; track feature) {
                                <li class="flex items-center gap-2">
                                   <svg class="w-4 h-4 text-[#E30613]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                   {{ feature }}
                                </li>
                             }
                          </ul>
                       </div>
                    </div>
                    <div class="md:col-span-1">
                       <div class="glass-panel p-6 rounded-2xl sticky top-6 border border-white/10">
                          <p class="text-gray-400 text-xs uppercase tracking-wider mb-1">Our Price</p>
                          <p class="text-4xl font-bold text-white mb-6">£{{ car.price | number }}</p>
                          <button (click)="enquireCar(car)" class="w-full bg-[#E30613] hover:bg-red-700 text-white font-bold py-4 rounded-lg uppercase tracking-widest text-xs transition-colors shadow-lg mb-4">Enquire Now</button>
                          <div class="text-xs text-gray-500 text-center">
                             <p class="mb-2">Call us directly:</p>
                             <a [href]="'tel:' + dataService.companyInfo().contact.phone.replace(' ', '')" class="text-white font-bold text-lg hover:text-[#E30613]">{{ dataService.companyInfo().contact.phone }}</a>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      }

      <!-- SERVICE BOOKING MODAL OVERLAY -->
      @if (isBookingModalOpen()) {
         <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div class="absolute inset-0 bg-black/90 backdrop-blur-sm" (click)="closeBookingModal()"></div>
           
           <div class="relative bg-[#0f0f11] w-full max-w-lg rounded-2xl overflow-hidden border border-white/10 shadow-2xl animate-fade-in">
              <div class="bg-gradient-to-r from-gray-900 to-black p-6 border-b border-[#E30613]">
                 <div class="flex justify-between items-center">
                    <h3 class="text-xl font-bold text-white brand-font italic">BOOK SERVICE</h3>
                    <button (click)="closeBookingModal()" class="text-gray-400 hover:text-white transition-colors">
                       <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                 </div>
              </div>
              
              <div class="p-6">
                 @if (bookingSubmitted()) {
                   <div class="bg-green-600/20 border border-green-600 text-green-100 p-8 rounded-xl text-center">
                      <svg class="w-16 h-16 mx-auto mb-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <h4 class="text-xl font-bold mb-2">Booking Received!</h4>
                      <p class="text-sm text-gray-300">Our team will review your request and contact you shortly to confirm the appointment.</p>
                      <button (click)="closeBookingModal()" class="mt-6 bg-white text-black font-bold py-2 px-6 rounded-full text-xs uppercase hover:bg-gray-200">Close</button>
                   </div>
                 } @else {
                   <form [formGroup]="bookingForm" (ngSubmit)="submitBooking()" class="space-y-4">
                      <div>
                         <label class="block text-[10px] uppercase text-gray-500 mb-1 font-bold tracking-wider">Your Name</label>
                         <input formControlName="customerName" class="w-full bg-black/50 border border-white/20 rounded p-3 text-sm text-white focus:border-[#E30613] focus:outline-none placeholder-gray-700">
                      </div>
                      <div>
                         <label class="block text-[10px] uppercase text-gray-500 mb-1 font-bold tracking-wider">Contact Number / Email</label>
                         <input formControlName="contact" class="w-full bg-black/50 border border-white/20 rounded p-3 text-sm text-white focus:border-[#E30613] focus:outline-none placeholder-gray-700">
                      </div>
                      <div class="grid grid-cols-2 gap-4">
                         <div>
                            <label class="block text-[10px] uppercase text-gray-500 mb-1 font-bold tracking-wider">Service Type</label>
                            <select formControlName="serviceType" class="w-full bg-black/50 border border-white/20 rounded p-3 text-sm text-white focus:border-[#E30613] focus:outline-none appearance-none">
                               <option value="">Select...</option>
                               @for (s of dataService.services(); track s.id) {
                                 <option [value]="s.name">{{ s.name }}</option>
                               }
                               <option value="Car Sales">Car Sales Inquiry</option>
                            </select>
                         </div>
                         <div>
                            <label class="block text-[10px] uppercase text-gray-500 mb-1 font-bold tracking-wider">Preferred Date</label>
                            <input type="date" formControlName="date" class="w-full bg-black/50 border border-white/20 rounded p-3 text-sm text-white focus:border-[#E30613] focus:outline-none [color-scheme:dark]">
                         </div>
                      </div>
                      <div>
                         <label class="block text-[10px] uppercase text-gray-500 mb-1 font-bold tracking-wider">Notes (Optional)</label>
                         <textarea formControlName="notes" rows="3" class="w-full bg-black/50 border border-white/20 rounded p-3 text-sm text-white focus:border-[#E30613] focus:outline-none placeholder-gray-700" placeholder="Vehicle info, registration, or specific request..."></textarea>
                      </div>
                      <button type="submit" [disabled]="bookingForm.invalid" class="w-full bg-[#E30613] hover:bg-red-700 text-white font-bold py-4 rounded text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(227,6,19,0.3)] hover:shadow-[0_0_25px_rgba(227,6,19,0.5)] disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                        Confirm Request
                      </button>
                   </form>
                 }
              </div>
           </div>
         </div>
      }

    </div>
  `,
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
