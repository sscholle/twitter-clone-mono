import { Component, OnInit, Renderer2 } from '@angular/core';
import { RouterModule } from '@angular/router';
import { allRepositories as repo } from './shared/allRepos';
import { ZeroRepository } from './util/ZeroRepository';
import { Follower, Medium, Message, Schema, Topic, User } from './util/schema';
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { ThemeService } from './services/theme.service';
import { CommonModule } from '@angular/common';
import { MessagesComponent } from "./messages/messages.component";

@Component({
  selector: 'app-root',
  imports: [RouterModule, SidebarComponent, CommonModule, MessagesComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'ng-xstate-entity-view-state';

  constructor(private themeService: ThemeService, private renderer: Renderer2) {
    // Init Repos
    repo.medium = new ZeroRepository<Schema, Medium>(
      'medium',
      'id',
    );
    repo.message = new ZeroRepository<Schema, Message>(
      'message',
      'id',
    );
    repo.user = new ZeroRepository<Schema, User>(
      'user',
      'id',
    );
    repo.topic = new ZeroRepository<Schema, Topic>(
      'topic',
      'id',
    );
    repo.follower = new ZeroRepository<Schema, Follower>(
      'follower',
      'id',
    );
    // // Init ZeroService
    // this.zeroService.initZero();
    // // Init all repos
    // allRepositories.medium.initRepo(this.zeroService);
    // allRepositories.message.initRepo(this.zeroService);
    // allRepositories.user.initRepo(this.zeroService);
  }
  ngOnInit(): void {
    // this.themeService.themeChanges().subscribe(theme => {
    //   if (theme.oldValue) {
    //     this.renderer.removeClass(document.body, theme.oldValue);
    //   }
    //   this.renderer.addClass(document.body, theme.newValue);
    // // })
    // repo.message?.find({}, ['users', 'mediums'])
    // .then((messages) => {
    //   console.log('Messages:', messages);
    //   this.tweets = messages as Message[];
    // });
    repo.user?.find()
    .then((users) => {
      console.log('Users:', users);
      this.users = users as User[];
    });
    repo.topic?.findSubscribe()
    .subscribe((topics) => {
      console.log('Topics:', topics);
      this.topics = topics as Topic[];
    });
  }
  tweets: Message[] = [];
  users: User[] = [];
  topics: Topic[] = [];

  filterByTopic(topicId: string) {
    console.log('Filtering by topic:', topicId);
    // repo.message?.find({ topicID: topicId })
    // .then((messages) => {
    //   console.log('Filtered Messages:', messages);
    //   this.tweets = messages as Message[];
    // });
  }
}
