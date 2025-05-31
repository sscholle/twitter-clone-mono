import { ApplicationConfig, provideZoneChangeDetection, isDevMode, provideAppInitializer, inject } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { schema } from './util/schema';
import { Zero } from '@rocicorp/zero';
import { provideZero } from 'zero-angular';
import { decodeJwt } from 'jose';
import Cookies from 'js-cookie';
import { provideServiceWorker } from '@angular/service-worker';
import { environment } from '../environments/environment';

// Use cookies to get the JWT and decode it
const encodedJWT = Cookies.get("jwt");
const decodedJWT = encodedJWT && decodeJwt(encodedJWT);
const userID = decodedJWT?.sub ? (decodedJWT.sub as string) : "anon";
console.log("userID", userID);
console.log("encodedJWT", encodedJWT);
console.log("decodedJWT", decodedJWT);
console.log("environment", environment);
console.log("schema", schema);

export const appConfig: ApplicationConfig = {
  providers: [
    // Provide Angular's built-in animations
    provideAnimations(),
    // Enable Zone.js change detection
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Routes with Animations
    provideRouter(routes, withViewTransitions()),
    // provideAppInitializer(() => {
    //   const authService = inject(AuthService); // Set the userID in AuthService
    //   authService.userID = userID; // Store the userID in AuthService
    //   authService.jwt = encodedJWT || ''; // Store the JWT in AuthService
    //   localStorage.setItem('userID', userID);
    //   localStorage.setItem('jwt', encodedJWT || '');
    //   console.log("localStorage userID", localStorage.getItem('userID'));
    //   console.log("localStorage jwt", localStorage.getItem('jwt'));
    //   authService.login(); // Call login to set up the user
    //   // This is a placeholder for any app initialization logic you might need
    //   return Promise.resolve();
    // }),
    // SYNC: Provide the Zero service with the userID and JWT for authentication
    provideZero(new Zero({
      userID: userID,
      auth: () => encodedJWT,
      server: environment.cache_server || 'http://localhost:4848',
      schema,
      kvStore: "idb",
    })),
    // PWA configuration
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};
