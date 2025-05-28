import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { allRepositories as repo } from './shared/allRepos';
import { ZeroRepository } from './util/ZeroRepository';
import { Follower, Medium, Message, MessageView, Schema, Topic, User } from './util/schema';
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { ThemeService } from './services/theme.service';
import { CommonModule } from '@angular/common';
import { ZeroService } from 'zero-angular';
import Cookies from "js-cookie";

@Component({
  selector: 'app-root',
  imports: [RouterModule, SidebarComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'ng-xstate-entity-view-state';

  // TODO: Use a service to handle repositories
  constructor(private zeroService: ZeroService<Schema>) {
    // Init Repos
    repo.medium = new ZeroRepository<Schema, Medium>(
      'medium',
    );
    repo.message = new ZeroRepository<Schema, Message>(
      'message',
    );
    repo.messageView = new ZeroRepository<Schema, MessageView>(
      'message_view',
      ['userID', 'messageID'],
    );
    repo.user = new ZeroRepository<Schema, User>(
      'user',
    );
    repo.topic = new ZeroRepository<Schema, Topic>(
      'topic',
    );
    repo.follower = new ZeroRepository<Schema, Follower>(
      'follower',
      ['userID', 'followerID'],
    );
  }

  user: User | undefined;
  ngOnInit(): void {
    // this.themeService.themeChanges().subscribe(theme => {
    //   if (theme.oldValue) {
    //     this.renderer.removeClass(document.body, theme.oldValue);
    //   }
    //   this.renderer.addClass(document.body, theme.newValue);
    // // })
    repo.user?.findOne(this.userID)
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
