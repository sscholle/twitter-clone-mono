import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CardComponent } from '../components/card.component';
import { Follower, Message, Schema, Topic, User } from '../util/schema';
import { allRepositories as repo } from '../shared/allRepos';
import { MessagesComponent } from '../messages/messages.component';
import { CommonModule } from '@angular/common';
import { ZeroService } from 'zero-angular';

interface FollowerUser extends Follower {
  user: User
}
@Component({
  selector: 'components-home',
  imports: [CommonModule, RouterModule, CardComponent, MessagesComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  zeroService = inject(ZeroService<Schema>);
  userID: string | null = this.zeroService.getZero().userID;// TODO: store this in a service
  followingUsers: FollowerUser[] = [];
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
    repo.follower?.findSubscribe(
      {
        "followerID": this.userID || '',
      },
      [{
        table: "user",
        cb: (q) => q,
      }],
    )
    .subscribe((followers) => {
      console.log('Followers:', followers);
      this.followingUsers = followers as FollowerUser[];
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

  canFollowUser(userId: string): boolean {
    return this.userID !== userId && this.isNotFollowingUser(userId);
  }
  isNotFollowingUser(userId: string): boolean {
    return !this.followingUsers.some((follower) => follower.userID === userId);
  }

  followUser(userId: string) {
    console.log('Following user:', userId);
    // Implement follow user logic here
    repo.follower?.create({
      userID: userId,
      followerID: this.userID,
    } as any).then((result) => {
      console.log('Followed user:', result);
    }
    ).catch((error) => {
      console.error('Error following user:', error);
    }
    );
  }

  unFollowUser(userId: string) {
    console.log('Unfollowing user:', userId);
    // Implement unfollow user logic here
    repo.follower?.delete({
      userID: userId,
      followerID: this.userID,
    } as any).then((result) => {
      console.log('Unfollowed user:', result);
    }
    ).catch((error) => {
      console.error('Error unfollowing user:', error);
    }
    );
  }
}
