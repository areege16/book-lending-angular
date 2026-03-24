import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { getErrorMessage } from '@core/utils';
import { AuthService } from '@services';
import { ErrorModalComponent } from '@shared/error-modal/error-modal.component';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink, ErrorModalComponent],
  templateUrl: './register.page.html',
  styleUrl: './register.page.css',
})
export class RegisterPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loading = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    userName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: [''],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
    role: ['Reader' as 'Reader' | 'Admin', [Validators.required]],
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.controls.password.value !== this.form.controls.confirmPassword.value) {
      this.error.set('Passwords do not match.');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.authService.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/login');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(getErrorMessage(err, 'Registration failed. Try another email or username.'));
      },
    });
  }
}