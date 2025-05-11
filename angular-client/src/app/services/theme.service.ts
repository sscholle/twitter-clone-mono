import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ThemeObject {
  oldValue: string | null;
  newValue: string;
};


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
