import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ThemeObject {
  oldValue: string | null;
  newValue: string;
};

/**
 * Theme Service
 * This service manages the theme selection for the application.
 * It allows setting and getting the current theme, and provides an observable for theme changes.
 * It initializes with a default theme based on the user's system preference.
 * It uses a BehaviorSubject to track the current theme and notify subscribers of changes.
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  currentTheme: string = 'bootstrap';
  initialSetting: ThemeObject = {
    oldValue: null,
    newValue: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  };
  themeSelection: BehaviorSubject<ThemeObject> =  new BehaviorSubject<ThemeObject>(this.initialSetting);
  constructor() { }

  setTheme(theme: string) {
    this.themeSelection.next(
      {
        oldValue: this.themeSelection.value.newValue,
        newValue: theme
      });
  }

  getTheme(): string {
    return this.themeSelection.value.newValue;
  }

  themeChanges(): Observable<ThemeObject> {
    return this.themeSelection.asObservable();
  }
}
