
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
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
  `
})
export class AdminLoginComponent {
  authService = inject(AuthService);
  fb = inject(FormBuilder);
  
  loading = signal(false);
  loginError = signal(false);

  loginForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

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
}
