import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-modal',
  template: `
    @if (message()) {
      <div class="error-modal-backdrop" (click)="dismiss()" role="presentation">
        <div
          class="error-modal"
          (click)="$event.stopPropagation()"
          role="alertdialog"
          aria-label="Notification"
          aria-modal="true"
        >
          <div class="error-modal-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p class="error-modal-message">{{ message() }}</p>
          <button type="button" class="error-modal-btn" (click)="dismiss()">OK</button>
        </div>
      </div>
    }
  `,
  styles: `
    .error-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 0.75rem;
      animation: fadeIn 0.2s ease-out;
    }

    .error-modal {
      background: var(--color-surface);
      border: 1px solid rgba(180, 140, 90, 0.3);
      border-left: 4px solid var(--color-accent);
      border-radius: var(--radius);
      padding: 1.25rem 1.5rem;
      max-width: 420px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      text-align: center;
      animation: slideUp 0.3s ease-out;
    }

    .error-modal-icon {
      width: 48px;
      height: 48px;
      margin: 0 auto 0.75rem;
      border-radius: 50%;
      background: var(--color-error-bg);
      color: var(--color-accent);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .error-modal-message {
      color: var(--color-text-muted);
      font-size: 0.95rem;
      line-height: 1.55;
      margin: 0 0 1rem;
    }

    .error-modal-btn {
      padding: 0.6rem 1.5rem;
      border-radius: var(--radius);
      border: 1px solid rgba(212, 168, 83, 0.4);
      background: #1b4332;
      color: var(--color-secondary);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .error-modal-btn:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }
  `,
})
export class ErrorModalComponent {
  message = input<string>('');
  dismissEvent = output<void>();

  dismiss() {
    this.dismissEvent.emit();
  }
}
