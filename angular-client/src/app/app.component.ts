import { Component, inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Schema } from './util/schema';
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { ThemeService } from './services/theme.service';
import { CommonModule } from '@angular/common';
import { ZeroService } from 'zero-angular';
import { MessageService } from './services/message.service';
import { AuthService } from './services/auth.service';
import { RepoService } from './services/repo.service';

@Component({
  selector: 'app-root',
  imports: [RouterModule, SidebarComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    this.repoService.destroyRepositories()
  }
  repoService = inject(RepoService);
  authService = inject(AuthService);
  messageService = inject(MessageService);
  zeroService = inject(ZeroService<Schema>);
  themeService = inject(ThemeService);
  // renderer = inject(Renderer2);

  ngOnInit(): void {
    this.authService.runAuth()
    .subscribe({
      next: (user) => {
        console.log('User logged in:', user);
      },
      error: (err) => {
        console.error('Error during authentication:', err);
      }
    });
    // this.themeService.themeChanges().subscribe(theme => {
    //   if (theme.oldValue) {
    //     this.renderer.removeClass(document.body, theme.oldValue);
    //   }
    //   this.renderer.addClass(document.body, theme.newValue);
    // })
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
