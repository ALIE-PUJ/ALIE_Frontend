import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  // providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration()]
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideAnimationsAsync(), provideHttpClient()]

  // Use provideHttpClient to enable requests
};
