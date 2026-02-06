
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-users',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-users.component.html'
})
export class AdminUsersComponent {
  dataService = inject(DataService);
  authService = inject(AuthService);
  fb = inject(FormBuilder);

  passwordMsg = signal('');

  userForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

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

  toggleTheme() {
    this.dataService.toggleTheme();
  }

  toggleDemoMode() {
    const currentState = this.dataService.isDemoMode();
    this.dataService.toggleDemoMode(!currentState);
  }

  updateBanner(message: string) {
    if (!message) {
      this.dataService.updateBanner(false, '');
    } else {
      this.dataService.updateBanner(true, message);
    }
  }
}
