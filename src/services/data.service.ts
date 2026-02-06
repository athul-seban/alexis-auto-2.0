
import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface Car {
  id: number;
  model: string;
  year: number;
  engine: string;
  price: number;
  image: string;
  sold: boolean;
  mileage: number;
  transmission: 'Automatic' | 'Manual';
  description: string;
  features: string[];
}

export interface TyreProduct {
  id: number;
  brand: string;
  model: string;
  size: string;
  price: number;
  offerPrice?: number; 
  quantity: number;    
  category: 'Premium' | 'Mid-Range' | 'Budget';
  image: string;
  specs: {
    fuel: 'A' | 'B' | 'C' | 'D' | 'E';
    wet: 'A' | 'B' | 'C' | 'D' | 'E';
    noise: number;
  };
}

export interface TyreBrand {
  name: string;
  image?: string; 
}

export interface User {
  username: string;
  password?: string;
}

export interface Banner {
  active: boolean;
  reason: string;
}

export interface Booking {
  id: number;
  customerName: string;
  contact: string;
  serviceType: string;
  date: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  notes?: string;
}

export interface ServiceItem {
  id: number;
  name: string;
  description: string;
}

export interface Location {
  city: string;
  type: string;
  addressLine: string;
}

export interface CompanyInfo {
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
  };
  address: {
    lines: string[];
  };
  openingHours: { day: string; hours: string; }[];
  facilities: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);
  
  private getBaseUrl(): string {
    const stored = localStorage.getItem('alexis_api_url');
    if (stored) return stored;
    
    const hostname = window.location.hostname;
    
    // 1. Localhost Development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
       return `${window.location.protocol}//${window.location.hostname}:8000/api`;
    }

    // 2. GitHub Codespaces / Gitpod Auto-Detection
    // Matches patterns like: app-name-3000.app.github.dev
    // We want to replace the port number (e.g. 3000 or 4200) with 8000
    if (hostname.includes('github.dev') || hostname.includes('gitpod.io') || hostname.includes('app.github.dev')) {
      const newHostname = hostname.replace(/-[0-9]+(?=\.)/, '-8000');
      return `https://${newHostname}/api`;
    }

    // 3. Environment Variable Fallback
    if (environment.apiUrl && environment.apiUrl !== '') {
        return environment.apiUrl.endsWith('/api') ? environment.apiUrl : `${environment.apiUrl}/api`;
    }
    
    // 4. Default Fallback
    return `${window.location.protocol}//${window.location.hostname}:8000/api`;
  }

  private apiUrl = this.getBaseUrl();

  // --- State Signals ---
  inventory = signal<Car[]>([]);
  tyreBrands = signal<TyreBrand[]>([]);
  tyreInventory = signal<TyreProduct[]>([]);
  services = signal<ServiceItem[]>([]);
  bookings = signal<Booking[]>([]);
  
  locations = signal<Location[]>([
    { city: "Loughborough", type: "Main Service Centre", addressLine: "Unit C5, Cumberland Trading Estate" },
    { city: "Leicester", type: "Tyre Shop", addressLine: "142 Narborough Road" }
  ]);

  companyInfo = signal<CompanyInfo>({
    contact: { email: "", phone: "", whatsapp: "" },
    address: { lines: [] },
    openingHours: [],
    facilities: []
  });

  banner = signal<Banner>({ active: false, reason: '' });

  constructor() {
    this.initializeData();
  }

  setCustomApiUrl(url: string) {
    const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    localStorage.setItem('alexis_api_url', cleanUrl);
    window.location.reload(); 
  }

  resetApiUrl() {
    localStorage.removeItem('alexis_api_url');
    window.location.reload();
  }

  getCurrentApiUrl() {
    return this.apiUrl;
  }

  public async initializeData() {
    console.log('Connecting to API:', this.apiUrl);
    try {
      await Promise.all([
        this.loadCars(),
        this.loadServices(),
        this.loadTyres(),
        this.loadBrands(),
        this.loadSettings()
      ]);
      console.log('Sync complete.');
    } catch (e: any) {
      console.error('API Connection Failed.', e);
      if (e.status === 0) {
        console.warn('%c CRITICAL: CORS or Connection Error.', 'color: red; font-size: 16px; font-weight: bold;');
        console.warn('If you are using GitHub Codespaces, ensure Port 8000 visibility is set to PUBLIC in the "PORTS" tab.');
      }
    }
  }

  private getOptions(auth: boolean = false) {
    // These headers help with some proxy warnings (like Ngrok or sometimes Codespaces)
    let headers = new HttpHeaders({
      'ngrok-skip-browser-warning': 'true',
      'Bypass-Tunnel-Reminder': 'true'
    });

    if (auth) {
      const token = sessionStorage.getItem('alexis_token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return { headers };
  }

  // --- API Loaders ---
  private loadCars() {
    return firstValueFrom(this.http.get<Car[]>(`${this.apiUrl}/cars`, this.getOptions(false)))
      .then(data => this.inventory.set(data));
  }
  private loadServices() {
    return firstValueFrom(this.http.get<ServiceItem[]>(`${this.apiUrl}/services`, this.getOptions(false)))
      .then(data => this.services.set(data));
  }
  public loadBookings() {
    return firstValueFrom(this.http.get<Booking[]>(`${this.apiUrl}/bookings`, this.getOptions(true)))
      .then(data => this.bookings.set(data))
      .catch(err => console.log('Cannot load bookings (unauthorized)'));
  }
  private loadTyres() {
    return firstValueFrom(this.http.get<TyreProduct[]>(`${this.apiUrl}/tyres`, this.getOptions(false)))
      .then(data => this.tyreInventory.set(data));
  }
  private loadBrands() {
    return firstValueFrom(this.http.get<TyreBrand[]>(`${this.apiUrl}/brands`, this.getOptions(false)))
      .then(data => this.tyreBrands.set(data));
  }
  private async loadSettings() {
    try {
      const banner = await firstValueFrom(this.http.get<Banner>(`${this.apiUrl}/settings/banner`, this.getOptions(false)));
      if (banner) this.banner.set(banner);

      const info = await firstValueFrom(this.http.get<CompanyInfo>(`${this.apiUrl}/settings/companyInfo`, this.getOptions(false)));
      if (info) this.companyInfo.set(info);
    } catch (e) { console.warn('Could not load settings'); }
  }

  // --- PUBLIC CRUD METHODS ---
  addService(service: Omit<ServiceItem, 'id'>) {
    return this.http.post<ServiceItem>(`${this.apiUrl}/services`, service, this.getOptions(true)).pipe(
      tap(newService => this.services.update(s => [...s, newService]))
    );
  }

  updateService(id: number, data: Partial<ServiceItem>) {
    const current = this.services().find(s => s.id === id);
    const payload = { ...current, ...data };
    return this.http.put<ServiceItem>(`${this.apiUrl}/services/${id}`, payload, this.getOptions(true)).pipe(
      tap(updated => this.services.update(s => s.map(i => i.id === id ? updated : i)))
    );
  }

  removeService(id: number) {
    return this.http.delete(`${this.apiUrl}/services/${id}`, this.getOptions(true)).pipe(
      tap(() => this.services.update(s => s.filter(i => i.id !== id)))
    );
  }

  addCar(car: Omit<Car, 'id'>) {
    return this.http.post<Car>(`${this.apiUrl}/cars`, car, this.getOptions(true)).pipe(
      tap(newCar => this.inventory.update(cars => [...cars, newCar]))
    );
  }

  updateCar(id: number, car: Partial<Car>) {
    const current = this.inventory().find(c => c.id === id);
    const payload = { ...current, ...car };
    return this.http.put<Car>(`${this.apiUrl}/cars/${id}`, payload, this.getOptions(true)).pipe(
      tap(updated => this.inventory.update(cars => cars.map(c => c.id === id ? updated : c)))
    );
  }

  removeCar(id: number) {
    return this.http.delete(`${this.apiUrl}/cars/${id}`, this.getOptions(true)).pipe(
      tap(() => this.inventory.update(cars => cars.filter(c => c.id !== id)))
    );
  }

  addBooking(booking: Omit<Booking, 'id' | 'status'>) {
    return this.http.post<Booking>(`${this.apiUrl}/bookings`, { ...booking, status: 'Pending' }, this.getOptions(false));
  }

  updateBookingStatus(id: number, status: Booking['status']) {
    return this.http.put(`${this.apiUrl}/bookings/${id}/status`, { status }, this.getOptions(true)).pipe(
      tap(() => this.bookings.update(b => b.map(booking => 
        booking.id === id ? { ...booking, status } : booking
      )))
    );
  }

  addTyreProduct(product: Omit<TyreProduct, 'id'>) {
    return this.http.post<TyreProduct>(`${this.apiUrl}/tyres`, product, this.getOptions(true)).pipe(
      tap(newTyre => this.tyreInventory.update(t => [...t, newTyre]))
    );
  }

  updateTyreProduct(id: number, data: Partial<TyreProduct>) {
    const current = this.tyreInventory().find(t => t.id === id);
    const payload = { ...current, ...data };
    return this.http.put<TyreProduct>(`${this.apiUrl}/tyres/${id}`, payload, this.getOptions(true)).pipe(
      tap(updated => this.tyreInventory.update(t => t.map(i => i.id === id ? updated : i)))
    );
  }

  removeTyreProduct(id: number) {
    return this.http.delete(`${this.apiUrl}/tyres/${id}`, this.getOptions(true)).pipe(
      tap(() => this.tyreInventory.update(t => t.filter(i => i.id !== id)))
    );
  }

  updateTyreStock(id: number, delta: number) {
    this.http.put(`${this.apiUrl}/tyres/${id}/stock`, { delta }, this.getOptions(true)).subscribe(() => {
       this.tyreInventory.update(tyres => tyres.map(t => {
          if (t.id === id) return { ...t, quantity: Math.max(0, t.quantity + delta) };
          return t;
       }));
    });
  }

  searchTyres(vehicleQuery: string): TyreProduct[] {
    const query = vehicleQuery.toLowerCase();
    if (query.length < 2) return [];
    return this.tyreInventory().filter(t => 
      t.brand.toLowerCase().includes(query) || 
      t.model.toLowerCase().includes(query) ||
      t.size.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query)
    );
  }

  addTyreBrand(name: string) {
    this.http.post<TyreBrand>(`${this.apiUrl}/brands`, { name }, this.getOptions(true)).subscribe(brand => {
       this.tyreBrands.update(b => [...b, brand]);
    });
  }

  removeTyreBrand(name: string) {
    this.http.delete(`${this.apiUrl}/brands/${name}`, this.getOptions(true)).subscribe(() => {
       this.tyreBrands.update(b => b.filter(brand => brand.name !== name));
    });
  }

  updateBanner(active: boolean, reason: string) {
    const payload = { active, reason };
    this.http.post(`${this.apiUrl}/settings`, { key: 'banner', value: payload }, this.getOptions(true)).subscribe(() => {
      this.banner.set(payload);
    });
  }

  updateCompanyContact(contact: CompanyInfo['contact']) {
    const current = this.companyInfo();
    const payload = { ...current, contact };
    this.http.post(`${this.apiUrl}/settings`, { key: 'companyInfo', value: payload }, this.getOptions(true)).subscribe(() => {
      this.companyInfo.set(payload);
    });
  }

  addUser(user: User) {
    return this.http.post(`${this.apiUrl}/users`, user, this.getOptions(true));
  }

  changePassword(username: string, newPass: string) {
    return this.http.put(`${this.apiUrl}/users/${username}/password`, { password: newPass }, this.getOptions(true));
  }

  login(username: string, password: string) {
    return this.http.post<{ access_token: string, token_type: string, username: string }>(`${this.apiUrl}/login`, { username, password }, this.getOptions(false));
  }
}
