import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { getErrorMessage } from '@core/utils';
import { AuthService } from '@services';
import { ErrorModalComponent } from '@shared/error-modal/error-modal.component';

@Component({
  selector: 'app-login-page',
  imports: [ ReactiveFormsModule, RouterLink, ErrorModalComponent],
  templateUrl: './login.page.html',
  styleUrl: './login.page.css',
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  loading = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.authService.redirectByRole();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          getErrorMessage(
            err,
            'Invalid email or password. Please check your email and password and try again.',
          ),
        );
      },
    });
  }
}
