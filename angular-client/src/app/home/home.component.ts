import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CardComponent } from '../components/card.component';
import { Message, Topic, User } from '../util/schema';
import { allRepositories as repo } from '../shared/allRepos';
import { MessagesComponent } from '../messages/messages.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'components-home',
  imports: [CommonModule, RouterModule, CardComponent, MessagesComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
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
