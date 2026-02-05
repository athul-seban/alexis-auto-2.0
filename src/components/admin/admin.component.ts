
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DataService, Booking, Car, TyreProduct, ServiceItem } from '../../services/data.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="min-h-screen bg-black text-white p-6 md:p-12">
      <!-- HEADER -->
      <div class="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
        <h1 (click)="goHome()" class="text-2xl font-bold italic font-michroma text-[#E30613] cursor-pointer hover:text-white transition-colors">ALEXIS ADMIN</h1>
        @if (authService.isLoggedIn()) {
          <div class="flex items-center gap-4">
             <span class="text-gray-400 text-sm">Logged in as: <strong class="text-white">{{ authService.currentUser() }}</strong></span>
             <button (click)="authService.logout()" class="text-xs bg-white/10 hover:bg-[#E30613] text-white px-4 py-2 rounded transition-colors uppercase tracking-wider">Logout</button>
          </div>
        }
      </div>

      <!-- LOGIN VIEW -->
      @if (!authService.isLoggedIn()) {
        <div class="max-w-md mx-auto glass-panel p-8 rounded-2xl border border-white/10">
          <h2 class="text-xl font-bold mb-6 text-center">Admin Access</h2>
          <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-4">
            <div>
              <label class="block text-xs uppercase text-gray-500 mb-1">Username</label>
              <input formControlName="username" type="text" class="w-full bg-black/50 border border-white/20 rounded p-2 text-white focus:border-[#E30613] focus:outline-none">
            </div>
            <div>
              <label class="block text-xs uppercase text-gray-500 mb-1">Password</label>
              <input formControlName="password" type="password" class="w-full bg-black/50 border border-white/20 rounded p-2 text-white focus:border-[#E30613] focus:outline-none">
            </div>
            @if (loginError()) {
              <p class="text-[#E30613] text-xs text-center">Invalid credentials</p>
            }
            <button type="submit" [disabled]="loading()" class="w-full bg-[#E30613] hover:bg-red-700 text-white font-bold py-3 rounded uppercase tracking-widest text-sm transition-colors disabled:opacity-50">
              {{ loading() ? 'Verifying...' : 'Login' }}
            </button>
          </form>
        </div>
      } 
      
      <!-- DASHBOARD VIEW -->
      @else {
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <!-- SIDEBAR NAV -->
          <div class="col-span-1 space-y-2">
            <button (click)="activeTab.set('bookings')" [class.bg-[#E30613]]="activeTab() === 'bookings'" class="w-full text-left p-3 rounded hover:bg-white/10 transition-colors uppercase text-sm font-bold tracking-wider flex justify-between items-center">
               Bookings
               @if (getPendingCount() > 0) {
                 <span class="bg-white text-[#E30613] px-2 py-0.5 rounded-full text-[10px] font-bold">{{ getPendingCount() }}</span>
               }
            </button>
            <button (click)="activeTab.set('content')" [class.bg-[#E30613]]="activeTab() === 'content'" class="w-full text-left p-3 rounded hover:bg-white/10 transition-colors uppercase text-sm font-bold tracking-wider">Content & Services</button>
            <button (click)="activeTab.set('inventory')" [class.bg-[#E30613]]="activeTab() === 'inventory'" class="w-full text-left p-3 rounded hover:bg-white/10 transition-colors uppercase text-sm font-bold tracking-wider">Car Inventory</button>
            <button (click)="activeTab.set('tyres')" [class.bg-[#E30613]]="activeTab() === 'tyres'" class="w-full text-left p-3 rounded hover:bg-white/10 transition-colors uppercase text-sm font-bold tracking-wider">Tyre Stock & Brands</button>
            <button (click)="activeTab.set('banner')" [class.bg-[#E30613]]="activeTab() === 'banner'" class="w-full text-left p-3 rounded hover:bg-white/10 transition-colors uppercase text-sm font-bold tracking-wider">Site Banner</button>
            <button (click)="activeTab.set('users')" [class.bg-[#E30613]]="activeTab() === 'users'" class="w-full text-left p-3 rounded hover:bg-white/10 transition-colors uppercase text-sm font-bold tracking-wider">System & Users</button>
          </div>

          <!-- CONTENT AREA -->
          <div class="col-span-1 md:col-span-3 glass-panel p-8 rounded-2xl border border-white/10 min-h-[500px]">
            
            <!-- BOOKINGS TAB -->
            @if (activeTab() === 'bookings') {
               <!-- Existing Bookings code -->
               <h2 class="text-xl font-bold mb-6 border-b border-white/10 pb-4">Booking Management</h2>
               <div class="space-y-4">
                 @if (dataService.bookings().length === 0) {
                   <p class="text-gray-500 italic">No bookings found.</p>
                 }
                 @for (booking of dataService.bookings(); track booking.id) {
                    <div class="bg-black/40 p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all">
                       <div class="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
                          <div>
                             <div class="flex items-center gap-3 mb-1">
                                <h3 class="font-bold text-lg text-white">{{ booking.customerName }}</h3>
                                <span class="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider" 
                                   [class.bg-yellow-500]="booking.status === 'Pending'"
                                   [class.bg-green-600]="booking.status === 'Confirmed'"
                                   [class.bg-blue-600]="booking.status === 'Completed'"
                                   [class.bg-red-600]="booking.status === 'Cancelled'">
                                   {{ booking.status }}
                                </span>
                             </div>
                             <p class="text-gray-400 text-xs">{{ booking.serviceType }} • {{ booking.date }}</p>
                             <p class="text-gray-500 text-xs mt-1">Contact: {{ booking.contact }}</p>
                             @if (booking.notes) {
                               <div class="mt-2 bg-white/5 p-2 rounded text-xs text-gray-300 italic">"{{ booking.notes }}"</div>
                             }
                          </div>
                          
                          <div class="flex gap-2">
                             @if (booking.status === 'Pending') {
                               <button (click)="updateStatus(booking.id, 'Confirmed')" class="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-xs font-bold uppercase">Approve</button>
                               <button (click)="updateStatus(booking.id, 'Cancelled')" class="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-xs font-bold uppercase">Reject</button>
                             }
                          </div>
                       </div>
                    </div>
                 }
               </div>
            }

            <!-- CONTENT & SERVICES TAB -->
            @if (activeTab() === 'content') {
              <div class="space-y-12">
                <!-- Contact Info -->
                <div>
                   <h2 class="text-xl font-bold mb-6 border-b border-white/10 pb-4">Contact Details</h2>
                   <form [formGroup]="contactForm" (ngSubmit)="saveContact()" class="bg-white/5 p-6 rounded-xl border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div><label class="block text-xs uppercase text-gray-500 mb-1">Phone Number</label><input formControlName="phone" class="w-full bg-black border border-white/20 rounded p-2 text-sm text-white"></div>
                      <div><label class="block text-xs uppercase text-gray-500 mb-1">Email Address</label><input formControlName="email" class="w-full bg-black border border-white/20 rounded p-2 text-sm text-white"></div>
                      <div><label class="block text-xs uppercase text-gray-500 mb-1">WhatsApp Number</label><input formControlName="whatsapp" class="w-full bg-black border border-white/20 rounded p-2 text-sm text-white"></div>
                      <div class="md:col-span-3 text-right"><button type="submit" [disabled]="contactForm.invalid" class="bg-[#E30613] text-white px-6 py-2 rounded text-xs font-bold uppercase disabled:opacity-50">Save Details</button></div>
                   </form>
                </div>

                <!-- Services -->
                <div>
                   <div class="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                      <h2 class="text-xl font-bold">Services Menu</h2>
                      @if (editingServiceId()) { <button (click)="cancelServiceEdit()" class="text-xs text-red-500 uppercase font-bold hover:underline">Cancel Edit</button> }
                   </div>
                   <form [formGroup]="serviceForm" (ngSubmit)="saveService()" class="mb-8 bg-white/5 p-6 rounded-xl border border-white/10" [class.border-[#E30613]]="editingServiceId()">
                      <h3 class="text-sm font-bold text-gray-400 uppercase mb-4">{{ editingServiceId() ? 'Edit Service' : 'Add New Service' }}</h3>
                      <div class="grid grid-cols-1 gap-4">
                         <div><input formControlName="name" placeholder="Service Name" class="w-full bg-black border border-white/20 rounded p-2 text-sm text-white"></div>
                         <div><textarea formControlName="description" rows="2" placeholder="Description" class="w-full bg-black border border-white/20 rounded p-2 text-sm text-white"></textarea></div>
                      </div>
                      <button type="submit" [disabled]="serviceForm.invalid" class="mt-4 bg-[#E30613] text-white px-6 py-2 rounded text-xs font-bold uppercase disabled:opacity-50">{{ editingServiceId() ? 'Update Service' : 'Add Service' }}</button>
                   </form>
                   <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      @for (service of dataService.services(); track service.id) {
                         <div class="bg-black/40 p-4 rounded border border-white/10 group hover:border-white/30 transition-colors">
                            <div class="flex justify-between items-start mb-2">
                               <h4 class="font-bold text-white">{{ service.name }}</h4>
                               <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button (click)="editService(service)" class="text-blue-400 hover:text-white text-[10px] uppercase font-bold">Edit</button>
                                  <button (click)="removeService(service.id)" class="text-red-500 hover:text-white text-[10px] uppercase font-bold">Remove</button>
                               </div>
                            </div>
                            <p class="text-xs text-gray-500">{{ service.description }}</p>
                         </div>
                      }
                   </div>
                </div>
              </div>
            }

            <!-- INVENTORY TAB -->
            @if (activeTab() === 'inventory') {
              <div class="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                 <h2 class="text-xl font-bold">Manage Cars</h2>
                 @if (editingCarId()) { <button (click)="cancelCarEdit()" class="text-xs text-red-500 uppercase font-bold hover:underline">Cancel Edit</button> }
              </div>
              <form [formGroup]="carForm" (ngSubmit)="saveCar()" class="mb-12 bg-white/5 p-6 rounded-xl relative border border-white/10" [class.border-[#E30613]]="editingCarId()">
                 <h3 class="text-sm font-bold text-gray-400 uppercase mb-4">{{ editingCarId() ? 'Edit Vehicle' : 'Add New Vehicle' }}</h3>
                 <div class="grid grid-cols-2 gap-4">
                    <div><input formControlName="model" placeholder="Model" class="w-full bg-black border border-white/20 rounded p-2 text-sm text-white"></div>
                    <div><input formControlName="year" type="number" placeholder="Year" class="w-full bg-black border border-white/20 rounded p-2 text-sm text-white"></div>
                    <div><input formControlName="engine" placeholder="Engine" class="w-full bg-black border border-white/20 rounded p-2 text-sm text-white"></div>
                    <div><input formControlName="price" type="number" placeholder="Price (£)" class="w-full bg-black border border-white/20 rounded p-2 text-sm text-white"></div>
                    <div><input formControlName="mileage" type="number" placeholder="Mileage" class="w-full bg-black border border-white/20 rounded p-2 text-sm text-white"></div>
                    <div><select formControlName="transmission" class="w-full bg-black border border-white/20 rounded p-2 text-sm text-white"><option value="Automatic">Automatic</option><option value="Manual">Manual</option></select></div>
                    <div class="col-span-2"><textarea formControlName="description" rows="3" placeholder="Description" class="w-full bg-black border border-white/20 rounded p-2 text-sm text-white"></textarea></div>
                    <div class="col-span-2"><input formControlName="features" placeholder="Features (comma separated)" class="w-full bg-black border border-white/20 rounded p-2 text-sm text-white"></div>
                    <div class="col-span-2"><input type="file" (change)="onFileSelected($event, 'car')" class="w-full bg-black border border-white/20 rounded p-2 text-sm text-white"></div>
                 </div>
                 <button type="submit" [disabled]="carForm.invalid" class="mt-4 bg-[#E30613] text-white px-6 py-2 rounded text-xs font-bold uppercase disabled:opacity-50">{{ editingCarId() ? 'Update Car' : 'Add Car' }}</button>
              </form>
              <div class="space-y-4">
                @for (car of dataService.inventory(); track car.id) {
                   <div class="flex items-center justify-between bg-black/40 p-4 rounded border border-white/10">
                      <div class="flex items-center gap-4">
                         <img [src]="car.image" class="w-16 h-12 object-cover rounded">
                         <div><p class="font-bold text-sm">{{ car.model }}</p><p class="text-xs text-gray-500">{{ car.year }} • £{{ car.price | number }}</p></div>
                      </div>
                      <div class="flex gap-2">
                         <button (click)="editCar(car)" class="text-blue-400 hover:text-white text-xs uppercase font-bold mr-2">Edit</button>
                         <button (click)="removeCar(car.id)" class="text-red-500 hover:text-white text-xs uppercase font-bold">Remove</button>
                      </div>
                   </div>
                }
              </div>
            }

            <!-- TYRES TAB -->
            @if (activeTab() === 'tyres') {
              <div class="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                 <h2 class="text-xl font-bold">Manage Tyre Stock</h2>
                 @if (editingTyreId()) { <button (click)="cancelTyreEdit()" class="text-xs text-red-500 uppercase font-bold hover:underline">Cancel Edit</button> }
              </div>
              <div class="bg-white/5 p-6 rounded-xl mb-12 border border-white/10" [class.border-[#E30613]]="editingTyreId()">
                 <h3 class="text-sm font-bold text-gray-400 uppercase mb-4">{{ editingTyreId() ? 'Edit Stock Item' : 'Add Stock Item' }}</h3>
                 <form [formGroup]="tyreProductForm" (ngSubmit)="saveTyreProduct()" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <select formControlName="brand" class="w-full bg-black border border-white/20 rounded p-2 text-sm text-white"><option value="">Select Brand</option>
                          @for (brand of dataService.tyreBrands(); track brand.name) { <option [value]="brand.name">{{ brand.name }}</option> }
                       </select>
                       <input formControlName="model" placeholder="Model" class="w-full bg-black border border-white/20 rounded p-2 text-sm text-white">
                       <input formControlName="size" placeholder="Size" class="w-full bg-black border border-white/20 rounded p-2 text-sm text-white">
                       <select formControlName="category" class="w-full bg-black border border-white/20 rounded p-2 text-sm text-white"><option value="Premium">Premium</option><option value="Mid-Range">Mid-Range</option><option value="Budget">Budget</option></select>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/10 pt-4">
                       <div><input formControlName="price" type="number" placeholder="Price" class="w-full bg-black border border-white/20 rounded p-2 text-sm text-white"></div>
                       <div><input formControlName="offerPrice" type="number" placeholder="Offer Price" class="w-full bg-black border border-white/20 rounded p-2 text-sm text-white"></div>
                       <div><input formControlName="quantity" type="number" placeholder="Qty" class="w-full bg-black border border-white/20 rounded p-2 text-sm text-white"></div>
                    </div>
                    <div class="grid grid-cols-3 gap-4 border-t border-white/10 pt-4">
                       <div><select formControlName="specFuel" class="w-full bg-black border border-white/20 rounded p-2 text-sm text-white"><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option><option value="E">E</option></select></div>
                       <div><select formControlName="specWet" class="w-full bg-black border border-white/20 rounded p-2 text-sm text-white"><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option><option value="E">E</option></select></div>
                       <div><input formControlName="specNoise" type="number" placeholder="dB" class="w-full bg-black border border-white/20 rounded p-2 text-sm text-white"></div>
                    </div>
                    <div class="mt-4"><input type="file" (change)="onFileSelected($event, 'tyre')" class="w-full bg-black border border-white/20 rounded p-2 text-sm text-white"></div>
                    <button type="submit" [disabled]="tyreProductForm.invalid" class="w-full bg-[#E30613] hover:bg-red-700 text-white font-bold py-3 rounded text-xs uppercase tracking-widest transition-colors disabled:opacity-50">{{ editingTyreId() ? 'Update Inventory' : 'Add to Inventory' }}</button>
                 </form>
              </div>
              <h3 class="text-sm font-bold text-gray-400 uppercase mb-4">Current Inventory</h3>
              <div class="space-y-4 mb-12">
                 @if (dataService.tyreInventory().length === 0) { <p class="text-gray-500 text-sm italic">No tyres in stock.</p> }
                 @for (tyre of dataService.tyreInventory(); track tyre.id) {
                    <div class="bg-black/40 p-4 rounded border border-white/10 flex flex-col md:flex-row justify-between items-center gap-4" [class.border-l-4]="editingTyreId() === tyre.id" [class.border-l-[#E30613]]="editingTyreId() === tyre.id">
                       <div class="flex items-center gap-4"><img [src]="tyre.image" class="w-12 h-12 object-contain bg-white/5 rounded-full p-1"><div><p class="font-bold text-sm text-white">{{ tyre.brand }} {{ tyre.model }}</p><p class="text-xs text-gray-500">{{ tyre.size }}</p></div></div>
                       <div class="flex items-center gap-6 text-sm">
                          <div class="text-center"><div class="flex items-center gap-2"><button (click)="dataService.updateTyreStock(tyre.id, -1)" class="bg-white/10 hover:bg-[#E30613] text-white w-6 h-6 rounded flex items-center justify-center font-bold">-</button><span class="font-bold w-6 text-center">{{ tyre.quantity }}</span><button (click)="dataService.updateTyreStock(tyre.id, 1)" class="bg-white/10 hover:bg-[#E30613] text-white w-6 h-6 rounded flex items-center justify-center font-bold">+</button></div></div>
                          <button (click)="editTyre(tyre)" class="bg-white/10 hover:bg-blue-600 text-white p-2 rounded transition-colors">Edit</button>
                          <button (click)="removeTyre(tyre.id)" class="bg-white/10 hover:bg-red-600 text-white p-2 rounded transition-colors">X</button>
                       </div>
                    </div>
                 }
              </div>
              <h3 class="text-sm font-bold text-gray-400 uppercase mb-4 border-t border-white/10 pt-8">Manage Partner Brands</h3>
              <div class="flex gap-4 mb-6"><input #tyreBrandInput placeholder="New Brand Name" class="bg-black border border-white/20 rounded p-2 text-sm text-white flex-1"><button (click)="addTyreBrand(tyreBrandInput)" class="bg-white/10 hover:bg-white hover:text-black text-white px-6 py-2 rounded text-xs font-bold uppercase transition-colors">Add Brand</button></div>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                 @for (brand of dataService.tyreBrands(); track brand.name) {
                    <div class="bg-black/40 p-3 rounded border border-white/10 flex justify-between items-center group hover:border-[#E30613] transition-colors"><span class="font-bold text-xs">{{ brand.name }}</span><button (click)="dataService.removeTyreBrand(brand.name)" class="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">✕</button></div>
                 }
              </div>
            }

            <!-- USERS TAB -->
            @if (activeTab() === 'users') {
               <h2 class="text-xl font-bold mb-6 border-b border-white/10 pb-4">System & User Management</h2>
               
               <!-- API Configuration -->
               <div class="bg-white/5 p-6 rounded-xl mb-8 border border-white/10">
                  <h3 class="text-sm font-bold text-[#E30613] uppercase mb-4">Remote Access Configuration</h3>
                  
                  <!-- Setup Guide -->
                  <details class="bg-black/40 border border-white/10 rounded p-4 mb-4 text-xs text-gray-400" open>
                    <summary class="cursor-pointer font-bold text-white mb-2 select-none hover:text-[#E30613] transition-colors">Setup Guide: How to access from outside?</summary>
                    <ol class="list-decimal pl-4 space-y-3 mt-2">
                      <li>Download <strong>ngrok</strong> from <a href="https://ngrok.com/download" target="_blank" class="text-[#E30613] hover:underline">ngrok.com/download</a>.</li>
                      <li>
                         <strong>IMPORTANT:</strong> You must restart your Angular server to allow remote connections:
                         <div class="bg-black p-2 rounded border border-white/20 mt-1 font-mono text-[10px] text-green-400">ng serve --host 0.0.0.0 --disable-host-check</div>
                      </li>
                      <li>
                         Tunnel your Backend (API) on port 8000:
                         <div class="bg-black p-2 rounded border border-white/20 mt-1 font-mono text-[10px] text-green-400">ngrok http 8000</div>
                         <span class="text-[10px] italic opacity-70">Copy the https URL it gives you (e.g., https://api-xyz.ngrok.app) and paste it below.</span>
                      </li>
                      <li>
                         Tunnel your Frontend (App) on port 4200:
                         <div class="bg-black p-2 rounded border border-white/20 mt-1 font-mono text-[10px] text-green-400">ngrok http 4200</div>
                         <span class="text-[10px] italic opacity-70">Use this URL on your phone to visit the site.</span>
                      </li>
                    </ol>
                  </details>

                  <p class="text-xs text-gray-400 mb-4">Enter your backend URL below (from Step 3). Example: <code>https://api-xyz.ngrok-free.app/api</code></p>
                  
                  <div class="flex flex-col gap-2">
                     <label class="text-[10px] uppercase font-bold text-gray-500">Current API URL</label>
                     <div class="flex gap-2">
                        <input #apiUrlInput type="text" [value]="dataService.getCurrentApiUrl()" class="flex-1 bg-black border border-white/20 rounded p-2 text-sm text-white font-mono">
                        <button (click)="dataService.setCustomApiUrl(apiUrlInput.value)" class="bg-white/10 hover:bg-white hover:text-black text-white px-4 py-2 rounded text-xs font-bold uppercase transition-colors">Save</button>
                        <button (click)="dataService.resetApiUrl()" class="bg-white/10 hover:bg-red-600 text-white px-4 py-2 rounded text-xs font-bold uppercase transition-colors">Reset</button>
                     </div>
                  </div>
               </div>

               <div class="bg-white/5 p-6 rounded-xl mb-8">
                  <h3 class="text-sm font-bold text-gray-400 uppercase mb-4">Change Password</h3>
                  <div class="flex gap-4">
                     <input #passInput type="password" placeholder="New Password" class="bg-black border border-white/20 rounded p-2 text-sm text-white flex-1">
                     <button (click)="changePassword(passInput)" class="bg-[#E30613] text-white px-6 py-2 rounded text-xs font-bold uppercase">Update</button>
                  </div>
                  @if (passwordMsg()) { <p class="text-green-500 text-xs mt-2">{{ passwordMsg() }}</p> }
               </div>
               <div class="bg-white/5 p-6 rounded-xl mb-8">
                  <h3 class="text-sm font-bold text-gray-400 uppercase mb-4">Add New Admin User</h3>
                  <form [formGroup]="userForm" (ngSubmit)="addUser()" class="space-y-4">
                     <div><input formControlName="username" placeholder="Username" class="w-full bg-black border border-white/20 rounded p-2 text-sm text-white"></div>
                     <div><input formControlName="password" type="password" placeholder="Password" class="w-full bg-black border border-white/20 rounded p-2 text-sm text-white"></div>
                     <button type="submit" [disabled]="userForm.invalid" class="bg-white text-black hover:bg-gray-200 px-6 py-2 rounded text-xs font-bold uppercase disabled:opacity-50">Create User</button>
                  </form>
               </div>
            }

          </div>
        </div>
      }
    </div>
  `,
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
  loginError = signal(false);
  loading = signal(false);
  passwordMsg = signal('');
  
  // Edit State
  editingCarId = signal<number | null>(null);
  editingTyreId = signal<number | null>(null);
  editingServiceId = signal<number | null>(null);

  selectedBooking = signal<Booking | null>(null);

  loginForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

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

  onLogin() {
    if (this.loginForm.valid) {
      this.loading.set(true);
      const { username, password } = this.loginForm.value;
      this.authService.login(username, password).subscribe({
        next: () => {
           this.loading.set(false);
           this.loginError.set(false);
        },
        error: () => {
           this.loading.set(false);
           this.loginError.set(true);
        }
      });
    }
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
