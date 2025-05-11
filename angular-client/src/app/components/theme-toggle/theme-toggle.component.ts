import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.scss'],
  imports: [CommonModule]
})
export class ThemeToggleComponent implements OnInit {
  theme: string = 'bootstrap';

  constructor(private themeService: ThemeService) { }

  ngOnInit(): void {
    this.theme = this.themeService.getTheme()
  }

  toggleTheme() {
    console.log('Toggling theme');
    if( this.themeService.getTheme() === 'bootstrap' ) {
      this.theme = 'dark';
    } else {
      this.theme = 'bootstrap';
    }
    this.themeService.setTheme(this.theme)
  }
}
