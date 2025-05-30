import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Schema, User } from './util/schema';
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { ThemeService } from './services/theme.service';
import { CommonModule } from '@angular/common';
import { ZeroService } from 'zero-angular';
import Cookies from "js-cookie";
import { MessageService } from './services/message.service';

@Component({
  selector: 'app-root',
  imports: [RouterModule, SidebarComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  constructor(private zeroService: ZeroService<Schema>, private messageService: MessageService, private themeService: ThemeService) {
  }

  user: User | undefined;
  ngOnInit(): void {
    // this.themeService.themeChanges().subscribe(theme => {
    //   if (theme.oldValue) {
    //     this.renderer.removeClass(document.body, theme.oldValue);
    //   }
    //   this.renderer.addClass(document.body, theme.newValue);
    // // })
    this.messageService.getUser(this.userID)
    .then((user) => {
      console.log('User:', user);
      this.user = user as User;
    });
  }

  // TODO: Provide an Auth Service to handle login/logout
  async login(evt: Event) {
    evt.preventDefault();
    // just loging with randon user for now

    if (!this.isLoggedIn) {
      const res = await fetch('http://localhost:5173/api/login', {
        credentials: 'include',
      });
    } else {
      Cookies.remove("jwt");
    }
    location.reload();
  }

  get isLoggedIn() {
    return this.zeroService.getZero().userID !== "anon";
  }

  get userID() {
    return this.zeroService.getZero().userID;
  }
}
