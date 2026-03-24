import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '@services';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected readonly user = computed(() => this.authService.user());
  protected readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  protected readonly role = computed(() => this.authService.role());

  protected readonly navbarScrolled = signal(false);

  private readonly navRefresh = signal(0);
  protected readonly showFooter = computed(() => {
    this.navRefresh();
    const path = this.router.url.split('?')[0];
    const hiddenPaths = ['/login', '/register'];
    const isAdminRoute = path.startsWith('/admin');
    return !hiddenPaths.includes(path) && !isAdminRoute;
  });

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        this.navRefresh.update((n) => n + 1);
      });
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.navbarScrolled.set(window.scrollY > 24);
  }

  logout() {
    this.authService.logout();
  }
}
