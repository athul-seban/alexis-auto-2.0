
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss'
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
