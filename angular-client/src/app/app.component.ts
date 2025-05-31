import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Schema, User } from './util/schema';
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { ThemeService } from './services/theme.service';
import { CommonModule } from '@angular/common';
import { ZeroService } from 'zero-angular';
import { MessageService } from './services/message.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterModule, SidebarComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  authService = inject(AuthService);
  messageService = inject(MessageService);
  zeroService = inject(ZeroService<Schema>);
  themeService = inject(ThemeService);


  ngOnInit(): void {
    // this.themeService.themeChanges().subscribe(theme => {
    //   if (theme.oldValue) {
    //     this.renderer.removeClass(document.body, theme.oldValue);
    //   }
    //   this.renderer.addClass(document.body, theme.newValue);
    // // })
    // if(this.authService.isLoggedIn()) {
    //   this.authService.getUser().then((user) => {
    //     this.user = user;
    //     console.log('User:', this.user);
    //   }
    //   ).catch((err) => {
    //     console.error('Error fetching user:', err);
    //   }
    //   );
    // }
  }

  // TODO: Provide an Auth Service to handle login/logout
  async login(evt: Event) {
    evt.preventDefault();
    if(this.isLoggedIn) {
      this.authService.logout();
      location.reload();
    } else {

      // just loging with randon user for now
      this.authService.login()
      .then(() => {
        location.reload();
      }).catch((err) => {
        console.error('Login failed:', err);
      });

    }
  }

  get isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  get userName() {
    return this.authService.user?.name || 'Guest';
  }
}
