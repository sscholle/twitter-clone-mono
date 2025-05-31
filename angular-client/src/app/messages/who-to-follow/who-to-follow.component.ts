import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { Schema } from "@rocicorp/zero";
import { ZeroService } from "zero-angular";
import { Follower, User } from "../../util/schema";
import { allRepositories as repo } from '../../shared/allRepos';
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { MessageService } from "../../services/message.service";
import { AuthService } from "../../services/auth.service";

interface FollowerUser extends Follower {
  user: User
}

@Component({
  selector: "app-who-to-follow",
  templateUrl: "./who-to-follow.component.html",
  // styleUrls: ["./who-to-follow.component.scss"]
  imports: [CommonModule, NgbTooltipModule],
})
export class WhoToFollowComponent implements OnInit {
  // This component is used to display a list of users to follow
  // It can be used in the home component or anywhere else
  authService = inject(AuthService<Schema>);
  messageService = inject(MessageService);
  users: User[] = [];
  // user: User | null = null;
  followingUsers: FollowerUser[] = [];

  get userID() {
    return this.authService.userID || '';
  }
  ngOnInit(): void {
    this.messageService.getUsers()
    .then((users) => {
      console.log('Users:', users);
      this.users = users as User[];
    })
    // this.messageService.getFollowers(this.authService.userID)
    if(this.authService.isLoggedIn() && this.userID) {
      this.messageService.observeFollowers(this.userID)
      .subscribe((followers) => {
        console.log('Followers:', followers);
        this.followingUsers = followers as FollowerUser[];
        console.log('Following Users:', this.followingUsers);
      });
    }
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
    this.messageService.followUser(userId, this.userID)
    .then(() => {
      console.log('Followed user:', userId);
    }
    ).catch((error) => {
      console.error('Error following user:', error);
    }
    );
  }

  unFollowUser(userId: string) {
    console.log('Unfollowing user:', userId);
    // Implement unfollow user logic here
    this.messageService.unFollowUser(userId, this.userID)
    .then(() => {
      console.log('Unfollowed user:', userId);
    }
    ).catch((error) => {
      console.error('Error unfollowing user:', error);
    }
    );
  }
}
